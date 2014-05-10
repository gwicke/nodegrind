nodegrind
=========

Profile nodejs applications with kcachegrind, either using the nodegrind wrapper or the more targeted profiling module.

Usage:
------
```bash
node nodegrind [-o nodegrind.callgrind] <main.js> <params>
kcachegrind nodegrind.callgrind
```
