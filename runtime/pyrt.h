/* PYTHIA runtime support library -- header
 * Owner: Member 3 (Koliparthy Venkata Jahnavi)
 *
 * Every routine here exists to close one measured semantic gap between
 * CPython 3.12 and ISO C.  Nothing in this file is a convenience wrapper:
 * if a function is here, removing it changes observable behaviour.
 */
#ifndef PYRT_H
#define PYRT_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include <math.h>
#include <setjmp.h>

/* ---- generic allocation: one MemoryError path for the whole runtime ---- */
void *py_alloc(size_t n);
void *py_realloc(void *p, size_t n);

/* ---- diagnostics: mirror CPython exception names and exit status ---- */
void py_raise(const char *exc, const char *msg);

/* ---- exception handling (try/except) -----------------------------------
 * Implemented with setjmp/longjmp: a try block pushes a PyHandler onto a
 * global stack before running its body; py_raise (called by any runtime
 * check, anywhere in the call chain) longjmps to the innermost pushed
 * handler. This models Python's dynamic-scope exception search exactly,
 * without a real unwinder -- sound here because PYTHIA never allocates
 * anything that needs cleanup on the way out (divergence D7: nothing is
 * freed either way, so there is nothing an unwinder would need to release).
 * Single-threaded only: py_handler_stack is a global. */
typedef struct PyHandler {
    jmp_buf buf;
    struct PyHandler *prev;
} PyHandler;

extern PyHandler *py_handler_stack;
extern char py_current_exc_name[64];
extern char py_current_exc_msg[256];

void py_reraise(void);          /* propagate the current exception outward */

/* ---- integer arithmetic ------------------------------------------------
 * C truncates toward zero; Python floors toward negative infinity, and the
 * sign of % follows the divisor. These four routines restore Python's rule.
 * Overflow is trapped rather than wrapped (C signed overflow is UB).       */
int64_t py_floordiv_i64(int64_t a, int64_t b);
int64_t py_mod_i64(int64_t a, int64_t b);
int64_t py_add_i64(int64_t a, int64_t b);
int64_t py_sub_i64(int64_t a, int64_t b);
int64_t py_mul_i64(int64_t a, int64_t b);
int64_t py_pow_i64(int64_t a, int64_t b);
int64_t py_neg_i64(int64_t a);
int64_t py_abs_i64(int64_t a);

/* ---- float arithmetic --------------------------------------------------- */
double  py_truediv(double a, double b);
double  py_floordiv_f64(double a, double b);
double  py_mod_f64(double a, double b);
double  py_pow_f64(double a, double b);

/* ---- strings: immutable, length-prefixed, NUL-terminated ---------------- */
typedef struct { int64_t len; char *data; } PyStr;

PyStr  *pystr_new(const char *s, int64_t len);
PyStr  *pystr_lit(const char *s);
PyStr  *pystr_concat(PyStr *a, PyStr *b);
PyStr  *pystr_repeat(PyStr *a, int64_t n);
PyStr  *pystr_index(PyStr *a, int64_t i);      /* Python returns a 1-char str */
PyStr  *pystr_upper(PyStr *a);
PyStr  *pystr_lower(PyStr *a);
int64_t pystr_len(PyStr *a);
int     pystr_cmp(PyStr *a, PyStr *b);
bool    pystr_truthy(PyStr *a);
bool    pystr_contains(PyStr *hay, PyStr *needle);
PyStr  *pystr_from_i64(int64_t v);
PyStr  *pystr_from_f64(double v);
PyStr  *pystr_from_bool(bool v);
int64_t py_i64_from_str(PyStr *s);
double  py_f64_from_str(PyStr *s);

void py_raise_pystr(const char *exc, PyStr *msg);   /* for `raise Exc(msg)` */

/* ---- monomorphic lists -------------------------------------------------
 * The type checker guarantees a single element type per list, so we emit
 * four concrete list types instead of boxing every element.               */
#define PYRT_DECL_LIST(NAME, T)                                            \
    typedef struct { int64_t len, cap; T *data; } NAME;                    \
    NAME   *NAME##_new(void);                                              \
    void    NAME##_append(NAME *l, T v);                                   \
    T       NAME##_get(NAME *l, int64_t i);                                \
    void    NAME##_set(NAME *l, int64_t i, T v);                           \
    T       NAME##_pop(NAME *l);                                           \
    NAME   *NAME##_concat(NAME *a, NAME *b);                               \
    bool    NAME##_eq(NAME *a, NAME *b);                                   \
    bool    NAME##_contains(NAME *l, T v);

PYRT_DECL_LIST(PyListI64, int64_t)
PYRT_DECL_LIST(PyListF64, double)
PYRT_DECL_LIST(PyListBool, bool)
PYRT_DECL_LIST(PyListStr, PyStr *)

/* ---- generic pointer list -----------------------------------------------
 * Used for list[list[T]] and list[SomeClass]: both store pointers, so one
 * runtime type serves both instantiations. The emitter casts void* back to
 * the concrete pointer type at every use site, where it statically knows
 * what that type is -- the cast is free and provably safe, never a guess. */
typedef struct { int64_t len, cap; void **data; } PyListList;
PyListList *PyListList_new(void);
void        PyListList_append(PyListList *l, void *v);
void       *PyListList_get(PyListList *l, int64_t i);
void        PyListList_set(PyListList *l, int64_t i, void *v);
void       *PyListList_pop(PyListList *l);
PyListList *PyListList_concat(PyListList *a, PyListList *b);
bool        PyListList_eq(PyListList *a, PyListList *b,
                          bool (*eq)(void *, void *));

/* ---- monomorphic dicts --------------------------------------------------
 * Insertion-ordered, linear-scan (adequate for a teaching-scale subset;
 * a hash index is a Review-3-plus optimisation, not a semantics question).
 * Keys are int or str; assignment upserts, exactly like Python's dict.    */
#define PYRT_DECL_DICT(NAME, KT, VT)                                       \
    typedef struct { int64_t len, cap; KT *keys; VT *vals; } NAME;         \
    NAME   *NAME##_new(void);                                              \
    void    NAME##_set(NAME *d, KT k, VT v);                               \
    VT      NAME##_get(NAME *d, KT k);                                     \
    VT      NAME##_get_default(NAME *d, KT k, VT def);                     \
    bool    NAME##_contains(NAME *d, KT k);

PYRT_DECL_DICT(PyDictIntInt,    int64_t, int64_t)
PYRT_DECL_DICT(PyDictIntFloat,  int64_t, double)
PYRT_DECL_DICT(PyDictIntBool,   int64_t, bool)
PYRT_DECL_DICT(PyDictIntStr,    int64_t, PyStr*)
PYRT_DECL_DICT(PyDictStrInt,    PyStr*,  int64_t)
PYRT_DECL_DICT(PyDictStrFloat,  PyStr*,  double)
PYRT_DECL_DICT(PyDictStrBool,   PyStr*,  bool)
PYRT_DECL_DICT(PyDictStrStr,    PyStr*,  PyStr*)

/* ---- printing: byte-identical to CPython's print() / repr() ------------ */
void py_print_begin(void);
void py_print_sep(void);
void py_print_end(void);
void py_print_i64(int64_t v);
void py_print_f64(double v);
void py_print_bool(bool v);
void py_print_str(PyStr *v);            /* str() form: no quotes */
void py_print_list_i64(PyListI64 *l);
void py_print_list_f64(PyListF64 *l);
void py_print_list_bool(PyListBool *l);
void py_print_list_str(PyListStr *l);   /* repr() form: quoted elements */

/* nested/class lists print via a caller-supplied element printer, since
 * the concrete element type is known only to the emitter.                 */
void py_print_list_generic(PyListList *l, void (*print_elem)(void *));

void py_print_dict_intint(PyDictIntInt *d);
void py_print_dict_intfloat(PyDictIntFloat *d);
void py_print_dict_intbool(PyDictIntBool *d);
void py_print_dict_intstr(PyDictIntStr *d);
void py_print_dict_strint(PyDictStrInt *d);
void py_print_dict_strfloat(PyDictStrFloat *d);
void py_print_dict_strbool(PyDictStrBool *d);
void py_print_dict_strstr(PyDictStrStr *d);

void py_fmt_f64(char *buf, size_t n, double d);   /* shortest round-trip repr */

#endif /* PYRT_H */
