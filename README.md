nodegrind
=========

Profile nodejs applications with [kcachegrind](http://kcachegrind.sourceforge.net/html/Home.html), either using the nodegrind wrapper or the more targeted profiling module.

Usage:
------
```bash
node nodegrind [-o nodegrind.callgrind] <main.js> <params>
kcachegrind nodegrind.callgrind
```
![KCachegrind screenshot](https://raw.githubusercontent.com/gwicke/nodegrind/master/kcachegrind.png "Kcachegrind view")
