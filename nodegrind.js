#!/usr/bin/env node
"use strict";
var profiler = require('v8-profiler'),
	c2ct = require('chrome2calltree'),
	fs = require('fs'),
	path = require('path'),
	memstream = require('memory-streams');

/**
 * Simplistic V8 CPU profiler wrapper, WIP
 *
 * Usage:
 * npm install v8-profiler
 *
 * var profiler = require('./profiler');
 * profiler.start('parse');
 * <some computation>
 * var prof = profiler.stop('parse');
 * fs.writeFileSync('parse.cpuprofile', JSON.stringify(prof));
 *
 * Now you can load parse.cpuprofile into chrome, or (much nicer) convert it
 * to calltree format using https://github.com/phleet/chrome2calltree:
 *
 * chrome2calltree -i parse.cpuprofile -o parse.calltree
 * kcachegrind parse.calltree
 *
 * Then use kcachegrind to visualize the callgrind file.
 */

/**
V8 prof node structure:
{ childrenCount: 3,
  callUid: 3550382514,
  selfSamplesCount: 0,
  totalSamplesCount: 7706,
  selfTime: 0,
  totalTime: 7960.497092032271,
  lineNumber: 0,
  scriptName: '',
  functionName: '(root)',
  getChild: [Function: getChild] }

sample cpuprofile (from Chrome):
{
  "functionName":"(root)",
  "scriptId":"0",
  "url":"",
  "lineNumber":0,
  "columnNumber":0,
  "hitCount":0,
  "callUID":4142747341,
  "children":[{"functionName":"(program)","scriptId":"0","url":"","lineNumber":0,"columnNumber":0,"hitCount":3,"callUID":912934196,"children":[],"deoptReason":"","id":2},{"functionName":"(idle)","scriptId":"0","url":"","lineNumber":0,"columnNumber":0,"hitCount":27741,"callUID":176593847,"children":[],"deoptReason":"","id":3}],"deoptReason":"","id":1}
*/

function convertProfNode (node) {
	var res = {
		functionName: node.functionName,
		lineNumber: node.lineNumber,
		callUID: node.callUid,
		hitCount: node.selfSamplesCount,
		url: node.scriptName,
		children: []
	};
	for (var i = 0; i < node.childrenCount; i++) {
		res.children.push(convertProfNode(node.getChild(i)));
	}
	return res;
}

function prof2cpuprofile (prof) {
	return {
		head: convertProfNode(prof.topRoot),
		startTime: 0,
		endTime: prof.topRoot.totalTime,
	};
}

if (module.parent === null && process.argv.length > 1) {
	// run as utility
	var argv = require('yargs')
		.usage('Usage: $0 [--heap] [-o outfile] <example.js> <args>')
		.default('heap', false)
		.default('o', 'callgrind.out.' + process.pid)
		.check(function(argv) {
			return argv._.length > 0;
		})
		.argv;
	var main = argv._.shift();
	process.argv.shift();
	profiler.startProfiling('global');
	// FIXME: requiring the main app won't work if the app relies on
	// module.parent being null.
	require(path.resolve(main));
	// Stop profiling in an exit handler so that we properly handle async code
	process.on('exit', function() {
		var outStream = new memstream.WritableStream();
			c2ct.chromeProfileToCallgrind(
					prof2cpuprofile(profiler.stopProfiling('global')),
					outStream);
		fs.writeFileSync(argv.o, outStream.toString());
		var out = JSON.stringify(argv.o);
		console.warn('Profile written to', out + '\nTry `kcachegrind', out + '`');
	});
}


module.exports = {
	// Start profiling
	startCPU: function(name) {
		return profiler.startProfiling(name);
	},
	// End profiling
	stopCPU: function(name, format) {
		var cpuprofile = prof2cpuprofile(profiler.stopProfiling(name));
		if (format === 'cpuprofile') {
			return JSON.stringify(cpuprofile);
		} else {
			var outStream = new memstream.WritableStream();
			c2ct.chromeProfileToCallgrind(cpuprofile, outStream);
			return outStream.toString();
		}
	}
};
