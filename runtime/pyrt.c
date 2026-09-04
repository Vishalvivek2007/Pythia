/* PYTHIA runtime support library -- implementation
 * Owner: Member 3 (Koliparthy Venkata Jahnavi)
 */
#include "pyrt.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <inttypes.h>

/* ---------------------------------------------------------- diagnostics */
PyHandler *py_handler_stack = NULL;
char py_current_exc_name[64] = "";
char py_current_exc_msg[256] = "";

/* Shared by py_raise and py_reraise: if a try block is active anywhere on
 * the call chain, jump there; otherwise this is an uncaught exception, so
 * report it the way an uncaught CPython exception reports and stop. */
static void py_unwind(void) {
    if (py_handler_stack) {
        PyHandler *h = py_handler_stack;
        py_handler_stack = h->prev;
        longjmp(h->buf, 1);
    }
    fflush(stdout);
    fprintf(stderr, "%s: %s\n", py_current_exc_name, py_current_exc_msg);
    exit(1);
}

void py_raise(const char *exc, const char *msg) {
    snprintf(py_current_exc_name, sizeof py_current_exc_name, "%s", exc);
    snprintf(py_current_exc_msg, sizeof py_current_exc_msg, "%s", msg);
    py_unwind();
}

void py_raise_pystr(const char *exc, PyStr *msg) {
    py_raise(exc, msg ? msg->data : "");
}

void py_reraise(void) { py_unwind(); }

void *py_alloc(size_t n) {
    void *p = malloc(n);
    if (!p) py_raise("MemoryError", "out of memory");
    return p;
}

void *py_realloc(void *p, size_t n) {
    void *q = realloc(p, n);
    if (!q) py_raise("MemoryError", "out of memory");
    return q;
}

static void *xmalloc(size_t n) { return py_alloc(n); }
static void *xrealloc(void *p, size_t n) { return py_realloc(p, n); }

/* ------------------------------------------------ integer arithmetic */
int64_t py_add_i64(int64_t a, int64_t b) {
    int64_t r;
    if (__builtin_add_overflow(a, b, &r))
        py_raise("OverflowError", "int64 overflow (PySub bounds native ints; "
                                  "CPython would promote to arbitrary precision)");
    return r;
}

int64_t py_sub_i64(int64_t a, int64_t b) {
    int64_t r;
    if (__builtin_sub_overflow(a, b, &r))
        py_raise("OverflowError", "int64 overflow");
    return r;
}

int64_t py_mul_i64(int64_t a, int64_t b) {
    int64_t r;
    if (__builtin_mul_overflow(a, b, &r))
        py_raise("OverflowError", "int64 overflow");
    return r;
}

int64_t py_neg_i64(int64_t a) {
    if (a == INT64_MIN) py_raise("OverflowError", "int64 overflow");
    return -a;
}

int64_t py_abs_i64(int64_t a) {
    if (a == INT64_MIN) py_raise("OverflowError", "int64 overflow");
    return a < 0 ? -a : a;
}

/* Python floors toward -inf; C truncates toward 0. */
int64_t py_floordiv_i64(int64_t a, int64_t b) {
    if (b == 0) py_raise("ZeroDivisionError", "integer division or modulo by zero");
    if (a == INT64_MIN && b == -1) py_raise("OverflowError", "int64 overflow");
    int64_t q = a / b;
    if ((a % b != 0) && ((a < 0) != (b < 0))) q -= 1;
    return q;
}

/* Python: sign of the result follows the divisor. C: follows the dividend. */
int64_t py_mod_i64(int64_t a, int64_t b) {
    if (b == 0) py_raise("ZeroDivisionError", "integer division or modulo by zero");
    if (a == INT64_MIN && b == -1) return 0;
    int64_t r = a % b;
    if (r != 0 && ((r < 0) != (b < 0))) r += b;
    return r;
}

int64_t py_pow_i64(int64_t a, int64_t b) {
    if (b < 0)
        py_raise("PythiaSemanticError",
                 "int ** negative-int yields float in CPython; annotate the "
                 "base as float to keep the translation sound");
    int64_t result = 1;
    while (b > 0) {
        if (b & 1) result = py_mul_i64(result, a);
        b >>= 1;
        if (b) a = py_mul_i64(a, a);
    }
    return result;
}

/* -------------------------------------------------- float arithmetic */
double py_truediv(double a, double b) {
    if (b == 0.0) py_raise("ZeroDivisionError", "division by zero");
    return a / b;
}

double py_floordiv_f64(double a, double b) {
    if (b == 0.0) py_raise("ZeroDivisionError", "float floor division by zero");
    return floor(a / b);
}

double py_mod_f64(double a, double b) {
    if (b == 0.0) py_raise("ZeroDivisionError", "float modulo");
    double r = fmod(a, b);
    if (r != 0.0) {
        if ((r < 0) != (b < 0)) r += b;
    } else {
        /* CPython gives zero the sign of the divisor: -1.5 % 0.5 == 0.0 */
        r = copysign(0.0, b);
    }
    return r;
}

double py_pow_f64(double a, double b) { return pow(a, b); }

/* ------------------------------------------------------------ strings */
PyStr *pystr_new(const char *s, int64_t len) {
    PyStr *p = xmalloc(sizeof(PyStr));
    p->len = len;
    p->data = xmalloc((size_t)len + 1);
    if (len) memcpy(p->data, s, (size_t)len);
    p->data[len] = '\0';
    return p;
}

PyStr *pystr_lit(const char *s) { return pystr_new(s, (int64_t)strlen(s)); }

PyStr *pystr_concat(PyStr *a, PyStr *b) {
    PyStr *p = xmalloc(sizeof(PyStr));
    p->len = a->len + b->len;
    p->data = xmalloc((size_t)p->len + 1);
    memcpy(p->data, a->data, (size_t)a->len);
    memcpy(p->data + a->len, b->data, (size_t)b->len);
    p->data[p->len] = '\0';
    return p;
}

PyStr *pystr_repeat(PyStr *a, int64_t n) {
    if (n < 0) n = 0;                       /* Python: "ab" * -1 == "" */
    PyStr *p = xmalloc(sizeof(PyStr));
    p->len = a->len * n;
    p->data = xmalloc((size_t)p->len + 1);
    for (int64_t i = 0; i < n; i++)
        memcpy(p->data + i * a->len, a->data, (size_t)a->len);
    p->data[p->len] = '\0';
    return p;
}

PyStr *pystr_index(PyStr *a, int64_t i) {
    int64_t j = i < 0 ? a->len + i : i;     /* Python negative indexing */
    if (j < 0 || j >= a->len)
        py_raise("IndexError", "string index out of range");
    return pystr_new(a->data + j, 1);
}

PyStr *pystr_upper(PyStr *a) {
    PyStr *p = pystr_new(a->data, a->len);
    for (int64_t i = 0; i < p->len; i++)
        if (p->data[i] >= 'a' && p->data[i] <= 'z') p->data[i] -= 32;
    return p;
}

PyStr *pystr_lower(PyStr *a) {
    PyStr *p = pystr_new(a->data, a->len);
    for (int64_t i = 0; i < p->len; i++)
        if (p->data[i] >= 'A' && p->data[i] <= 'Z') p->data[i] += 32;
    return p;
}

int64_t pystr_len(PyStr *a) { return a->len; }
bool pystr_truthy(PyStr *a) { return a->len != 0; }

bool pystr_contains(PyStr *hay, PyStr *needle) {
    if (needle->len == 0) return true;             /* "" in s is True in Python */
    if (needle->len > hay->len) return false;
    for (int64_t i = 0; i + needle->len <= hay->len; i++)
        if (memcmp(hay->data + i, needle->data, (size_t)needle->len) == 0)
            return true;
    return false;
}

int pystr_cmp(PyStr *a, PyStr *b) {
    int64_t n = a->len < b->len ? a->len : b->len;
    int c = n ? memcmp(a->data, b->data, (size_t)n) : 0;
    if (c) return c < 0 ? -1 : 1;
    if (a->len == b->len) return 0;
    return a->len < b->len ? -1 : 1;
}

PyStr *pystr_from_i64(int64_t v) {
    char buf[32];
    snprintf(buf, sizeof buf, "%" PRId64, v);
    return pystr_lit(buf);
}

PyStr *pystr_from_f64(double v) {
    char buf[64];
    py_fmt_f64(buf, sizeof buf, v);
    return pystr_lit(buf);
}

PyStr *pystr_from_bool(bool v) { return pystr_lit(v ? "True" : "False"); }

int64_t py_i64_from_str(PyStr *s) {
    char *end = NULL;
    long long v = strtoll(s->data, &end, 10);
    if (end == s->data || *end != '\0')
        py_raise("ValueError", "invalid literal for int() with base 10");
    return (int64_t)v;
}

double py_f64_from_str(PyStr *s) {
    char *end = NULL;
    double v = strtod(s->data, &end);
    if (end == s->data || *end != '\0')
        py_raise("ValueError", "could not convert string to float");
    return v;
}

/* -------------------------------------------------------------- lists */
#define PYRT_DEF_LIST(NAME, T, EQ)                                            \
    NAME *NAME##_new(void) {                                                  \
        NAME *l = xmalloc(sizeof(NAME));                                      \
        l->len = 0; l->cap = 8;                                               \
        l->data = xmalloc(sizeof(T) * (size_t)l->cap);                        \
        return l;                                                             \
    }                                                                         \
    void NAME##_append(NAME *l, T v) {                                        \
        if (l->len == l->cap) {                                               \
            l->cap = l->cap * 2 + 1;                                          \
            l->data = xrealloc(l->data, sizeof(T) * (size_t)l->cap);          \
        }                                                                     \
        l->data[l->len++] = v;                                                \
    }                                                                         \
    static int64_t NAME##_norm(NAME *l, int64_t i) {                          \
        int64_t j = i < 0 ? l->len + i : i;                                   \
        if (j < 0 || j >= l->len)                                             \
            py_raise("IndexError", "list index out of range");                \
        return j;                                                             \
    }                                                                         \
    T NAME##_get(NAME *l, int64_t i) { return l->data[NAME##_norm(l, i)]; }   \
    void NAME##_set(NAME *l, int64_t i, T v) {                                \
        l->data[NAME##_norm(l, i)] = v;                                       \
    }                                                                         \
    T NAME##_pop(NAME *l) {                                                   \
        if (l->len == 0) py_raise("IndexError", "pop from empty list");       \
        return l->data[--l->len];                                             \
    }                                                                         \
    NAME *NAME##_concat(NAME *a, NAME *b) {                                   \
        NAME *r = NAME##_new();                                               \
        for (int64_t i = 0; i < a->len; i++) NAME##_append(r, a->data[i]);    \
        for (int64_t i = 0; i < b->len; i++) NAME##_append(r, b->data[i]);    \
        return r;                                                             \
    }                                                                         \
    bool NAME##_eq(NAME *a, NAME *b) {                                        \
        if (a->len != b->len) return false;                                   \
        for (int64_t i = 0; i < a->len; i++)                                  \
            if (!(EQ(a->data[i], b->data[i]))) return false;                  \
        return true;                                                          \
    }                                                                         \
    bool NAME##_contains(NAME *l, T v) {                                      \
        for (int64_t i = 0; i < l->len; i++)                                  \
            if (EQ(l->data[i], v)) return true;                               \
        return false;                                                         \
    }

#define EQ_PRIM(x, y) ((x) == (y))
#define EQ_STR(x, y)  (pystr_cmp((x), (y)) == 0)

PYRT_DEF_LIST(PyListI64, int64_t, EQ_PRIM)
PYRT_DEF_LIST(PyListF64, double, EQ_PRIM)
PYRT_DEF_LIST(PyListBool, bool, EQ_PRIM)
PYRT_DEF_LIST(PyListStr, PyStr *, EQ_STR)

/* ---------------------------------------------- generic pointer list */
PyListList *PyListList_new(void) {
    PyListList *l = xmalloc(sizeof(PyListList));
    l->len = 0; l->cap = 8;
    l->data = xmalloc(sizeof(void *) * (size_t)l->cap);
    return l;
}
void PyListList_append(PyListList *l, void *v) {
    if (l->len == l->cap) {
        l->cap = l->cap * 2 + 1;
        l->data = xrealloc(l->data, sizeof(void *) * (size_t)l->cap);
    }
    l->data[l->len++] = v;
}
static int64_t PyListList_norm(PyListList *l, int64_t i) {
    int64_t j = i < 0 ? l->len + i : i;
    if (j < 0 || j >= l->len) py_raise("IndexError", "list index out of range");
    return j;
}
void *PyListList_get(PyListList *l, int64_t i) { return l->data[PyListList_norm(l, i)]; }
void  PyListList_set(PyListList *l, int64_t i, void *v) { l->data[PyListList_norm(l, i)] = v; }
void *PyListList_pop(PyListList *l) {
    if (l->len == 0) py_raise("IndexError", "pop from empty list");
    return l->data[--l->len];
}
PyListList *PyListList_concat(PyListList *a, PyListList *b) {
    PyListList *r = PyListList_new();
    for (int64_t i = 0; i < a->len; i++) PyListList_append(r, a->data[i]);
    for (int64_t i = 0; i < b->len; i++) PyListList_append(r, b->data[i]);
    return r;
}
bool PyListList_eq(PyListList *a, PyListList *b, bool (*eq)(void *, void *)) {
    if (a->len != b->len) return false;
    for (int64_t i = 0; i < a->len; i++)
        if (!eq(a->data[i], b->data[i])) return false;
    return true;
}

/* ------------------------------------------------------------- dicts
 * Linear scan, insertion order preserved (matches Python 3.7+ dict).     */
#define PYRT_DEF_DICT(NAME, KT, VT, KEQ)                                     \
    NAME *NAME##_new(void) {                                                 \
        NAME *d = xmalloc(sizeof(NAME));                                     \
        d->len = 0; d->cap = 8;                                              \
        d->keys = xmalloc(sizeof(KT) * (size_t)d->cap);                      \
        d->vals = xmalloc(sizeof(VT) * (size_t)d->cap);                      \
        return d;                                                            \
    }                                                                        \
    static int64_t NAME##_find(NAME *d, KT k) {                              \
        for (int64_t i = 0; i < d->len; i++)                                 \
            if (KEQ(d->keys[i], k)) return i;                                \
        return -1;                                                           \
    }                                                                        \
    void NAME##_set(NAME *d, KT k, VT v) {                                   \
        int64_t i = NAME##_find(d, k);                                       \
        if (i >= 0) { d->vals[i] = v; return; }                              \
        if (d->len == d->cap) {                                              \
            d->cap = d->cap * 2 + 1;                                         \
            d->keys = xrealloc(d->keys, sizeof(KT) * (size_t)d->cap);        \
            d->vals = xrealloc(d->vals, sizeof(VT) * (size_t)d->cap);        \
        }                                                                    \
        d->keys[d->len] = k; d->vals[d->len] = v; d->len++;                  \
    }                                                                        \
    VT NAME##_get(NAME *d, KT k) {                                           \
        int64_t i = NAME##_find(d, k);                                       \
        if (i < 0) py_raise("KeyError", "key not found");                    \
        return d->vals[i];                                                   \
    }                                                                        \
    VT NAME##_get_default(NAME *d, KT k, VT def) {                           \
        int64_t i = NAME##_find(d, k);                                       \
        return i >= 0 ? d->vals[i] : def;                                    \
    }                                                                        \
    bool NAME##_contains(NAME *d, KT k) { return NAME##_find(d, k) >= 0; }

#define KEQ_INT(x, y) ((x) == (y))
#define KEQ_STRK(x, y) (pystr_cmp((x), (y)) == 0)

PYRT_DEF_DICT(PyDictIntInt,   int64_t, int64_t, KEQ_INT)
PYRT_DEF_DICT(PyDictIntFloat, int64_t, double,  KEQ_INT)
PYRT_DEF_DICT(PyDictIntBool,  int64_t, bool,    KEQ_INT)
PYRT_DEF_DICT(PyDictIntStr,   int64_t, PyStr*,  KEQ_INT)
PYRT_DEF_DICT(PyDictStrInt,   PyStr*,  int64_t, KEQ_STRK)
PYRT_DEF_DICT(PyDictStrFloat, PyStr*,  double,  KEQ_STRK)
PYRT_DEF_DICT(PyDictStrBool,  PyStr*,  bool,    KEQ_STRK)
PYRT_DEF_DICT(PyDictStrStr,   PyStr*,  PyStr*,  KEQ_STRK)

/* ----------------------------------------------------------- printing */
/* CPython's float repr is the shortest decimal string that round-trips,
 * rendered fixed unless the decimal exponent is < -4 or >= 16.
 * "%.17g" does NOT reproduce this; the loop below does.                   */
void py_fmt_f64(char *buf, size_t n, double d) {
    if (isnan(d)) { snprintf(buf, n, "nan"); return; }
    if (isinf(d)) { snprintf(buf, n, d > 0 ? "inf" : "-inf"); return; }

    char sci[64];
    int sig = 17;
    for (int s = 1; s <= 17; s++) {
        snprintf(sci, sizeof sci, "%.*e", s - 1, d);
        if (strtod(sci, NULL) == d) { sig = s; break; }
    }
    const char *epos = strchr(sci, 'e');
    int expo = epos ? atoi(epos + 1) : 0;

    if (expo < -4 || expo >= 16) {
        snprintf(buf, n, "%s", sci);
    } else {
        int dec = sig - 1 - expo;
        if (dec < 0) dec = 0;
        snprintf(buf, n, "%.*f", dec, d);
        if (!strchr(buf, '.')) {
            size_t l = strlen(buf);
            if (l + 3 < n) { buf[l] = '.'; buf[l+1] = '0'; buf[l+2] = '\0'; }
        }
    }
}

static int print_first = 1;
void py_print_begin(void) { print_first = 1; }
void py_print_sep(void)   { if (!print_first) fputc(' ', stdout); print_first = 0; }
void py_print_end(void)   { fputc('\n', stdout); }

void py_print_i64(int64_t v)  { printf("%" PRId64, v); }
void py_print_bool(bool v)    { fputs(v ? "True" : "False", stdout); }
void py_print_str(PyStr *v)   { fwrite(v->data, 1, (size_t)v->len, stdout); }

void py_print_f64(double v) {
    char buf[64];
    py_fmt_f64(buf, sizeof buf, v);
    fputs(buf, stdout);
}

/* repr() of a str inside a container: CPython prefers single quotes and
 * switches to double quotes only when the value contains ' but not ". */
static void print_str_repr(PyStr *s) {
    int has_sq = 0, has_dq = 0;
    for (int64_t i = 0; i < s->len; i++) {
        if (s->data[i] == '\'') has_sq = 1;
        if (s->data[i] == '"')  has_dq = 1;
    }
    char q = (has_sq && !has_dq) ? '"' : '\'';
    fputc(q, stdout);
    for (int64_t i = 0; i < s->len; i++) {
        char c = s->data[i];
        if (c == '\\')      fputs("\\\\", stdout);
        else if (c == q)    { fputc('\\', stdout); fputc(c, stdout); }
        else if (c == '\n') fputs("\\n", stdout);
        else if (c == '\t') fputs("\\t", stdout);
        else if (c == '\r') fputs("\\r", stdout);
        else                fputc(c, stdout);
    }
    fputc(q, stdout);
}

#define PYRT_DEF_PRINT_LIST(FN, LT, ELEM)                                     \
    void FN(LT *l) {                                                          \
        fputc('[', stdout);                                                   \
        for (int64_t i = 0; i < l->len; i++) {                                \
            if (i) fputs(", ", stdout);                                       \
            ELEM(l->data[i]);                                                 \
        }                                                                     \
        fputc(']', stdout);                                                   \
    }

PYRT_DEF_PRINT_LIST(py_print_list_i64,  PyListI64,  py_print_i64)
PYRT_DEF_PRINT_LIST(py_print_list_f64,  PyListF64,  py_print_f64)
PYRT_DEF_PRINT_LIST(py_print_list_bool, PyListBool, py_print_bool)
PYRT_DEF_PRINT_LIST(py_print_list_str,  PyListStr,  print_str_repr)

void py_print_list_generic(PyListList *l, void (*print_elem)(void *)) {
    fputc('[', stdout);
    for (int64_t i = 0; i < l->len; i++) {
        if (i) fputs(", ", stdout);
        print_elem(l->data[i]);
    }
    fputc(']', stdout);
}

#define PYRT_DEF_PRINT_DICT(FN, DT, KPRINT, VPRINT)                          \
    void FN(DT *d) {                                                         \
        fputc('{', stdout);                                                  \
        for (int64_t i = 0; i < d->len; i++) {                               \
            if (i) fputs(", ", stdout);                                      \
            KPRINT(d->keys[i]);                                              \
            fputs(": ", stdout);                                             \
            VPRINT(d->vals[i]);                                              \
        }                                                                    \
        fputc('}', stdout);                                                  \
    }

PYRT_DEF_PRINT_DICT(py_print_dict_intint,   PyDictIntInt,   py_print_i64,  py_print_i64)
PYRT_DEF_PRINT_DICT(py_print_dict_intfloat, PyDictIntFloat, py_print_i64,  py_print_f64)
PYRT_DEF_PRINT_DICT(py_print_dict_intbool,  PyDictIntBool,  py_print_i64,  py_print_bool)
PYRT_DEF_PRINT_DICT(py_print_dict_intstr,   PyDictIntStr,   py_print_i64,  print_str_repr)
PYRT_DEF_PRINT_DICT(py_print_dict_strint,   PyDictStrInt,   print_str_repr, py_print_i64)
PYRT_DEF_PRINT_DICT(py_print_dict_strfloat, PyDictStrFloat, print_str_repr, py_print_f64)
PYRT_DEF_PRINT_DICT(py_print_dict_strbool,  PyDictStrBool,  print_str_repr, py_print_bool)
PYRT_DEF_PRINT_DICT(py_print_dict_strstr,   PyDictStrStr,   print_str_repr, print_str_repr)
