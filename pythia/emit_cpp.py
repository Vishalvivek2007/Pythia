"""C++17 backend entry point.

The implementation remains in ``emit_c`` for compatibility with existing
imports; this module is the public backend name used by the driver.
"""
from .emit_c import Emitter, c_string, ctype, dict_rt_name, emit, list_rt_name, zero

__all__ = ["Emitter", "c_string", "ctype", "dict_rt_name", "emit", "list_rt_name", "zero"]
