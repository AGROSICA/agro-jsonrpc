#!/usr/bin/node
// # The Agrosica GitHub Wiki Document Generator
// follows the docco syntax for writing documentation, but then alters the
// source to match the *markdown* wiki syntax of GitHub, instead, as the
// GitHub Pages do not restrict access for private repos while the GitHub Wiki
// will do so. Currently only supports Javascript source code.

// Need the *fs* object to load the source data
var fs = require('fs');

// Only supports one input file right now and outputs to stdout. Should be
// expanded over time to support stdin, multiple source files, etc.
if(process.argv.length != 3) {
	process.exit(1);
}

// Grab the source file (assumed to be Javascript)
var myFile = fs.readFileSync(process.argv[2], 'utf8');

// Break the file into lines of source for regex parsing
var lines = myFile.split("\n");

// Remove comment delimiters from comments and insert an extra 4 spaces on code
// while also placing blank lines between comments and code, and printing the
// results
var prevLine = null;
lines.forEach(function(line, loc, arr) {
	if(line.match(/^\s*\/\/\s?/) || line == "") {
		arr[loc] = line.replace(/^\s*\/\/\s?/, "");
		if(prevLine == "code") {
			arr[loc] = "```\n\n" + arr[loc];
		}
		prevLine = "comment";
	} else {
		arr[loc] = "    " + line;
		if(prevLine == "comment" || prevLine == null) {
			arr[loc] = "```js\n" + arr[loc];
		}
		prevLine = "code";
	}
	console.log(arr[loc]);
});
// Final check to see if the document ended with a code block and close it.
if(prevLine == "code") {
	console.log("```");
}
