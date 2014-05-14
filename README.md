nodegrind
=========

Profile nodejs applications with [kcachegrind](http://kcachegrind.sourceforge.net/html/Home.html), either using the nodegrind wrapper or the more targeted profiling module.

Installation
------------
```bash
npm install -g nodegrind
```

Full-program profiling:
-----------------------
```bash
node nodegrind [-o callgrind.out.<pid>] <main.js> <params>
kcachegrind nodegrind.callgrind
```
Targeted profiling by using nodegrind as a module
-------------------------------------------------
```javascript
var nodegrind = require('nodegrind'),
	fs = require('fs');

nodegrind.startCPU('someProfile');

// Run the code you are interested in

// Get the callgrind profile as a string
var prof = nodegrind.stopCPU('someProfile');
fs.writeFileSync('callgrind.out.someProfile', prof);
// open kcachegrind with 'kcachegrind callgrind.out.someProfile'

// Alternatively, get a Chrome *.cpuprofile that you can load into the Chrome
// profiler (right-click on 'Profiles' in left pane in the 'Profiles' tab)
var prof = nodegrind.stopCPU('someProfile', 'cpuprofile');
fs.writeFileSync('someProfile.cpuprofile', prof);
```


![KCachegrind screenshot](https://raw.githubusercontent.com/gwicke/nodegrind/master/kcachegrind.png "Kcachegrind view")
