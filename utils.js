var http = require('http');
var https = require('https');
var sha2 = require('./SHA2');

// ## The *mergeObjs* function
// is a simple helper function to create a new object based on input objects.
// It has been copied from the *Registration* server source, and so is a
// candidate for moving into a common library.
var mergeObjs = function () {
	var outObj = {};
	for(var i in arguments) {
		if(arguments[i] instanceof Object) {
			for(var j in arguments[i]) {
				// Does not check for collisions, newer object
				// definitions clobber old definitions
				outObj[j] = arguments[i][j];
			}
		}
	}
	return outObj;
};
exports.mergeObjs = mergeObjs;

// ### The *setMasterKey* method
// is provided by the *Registration* server a new *masterKey*, and this method
// simply marks the current key as the old key and the newly-provided key as
// the master key, and informs the *Registration* server that it was successful
function setMasterKey(masterKey) {
	console.log("Received new master key");
	global.registration.prevMasterKey = global.registration.currMasterKey;
	global.registration.currMasterKey = masterKey;
	return true;
};
exports.setMasterKey = setMasterKey;

// ## The *verifyUser* function
// validates whether or not the user has successfully logged into the
// *Registration* server, indicating whether or not access should be granted
// by whatever function calls it.
// IMPORTANT: This function expects global.registration.currMasterKey and global.registration.prevMasterkey to be defined.
function verifyUser(user_id, session_code) {
	var currSessionCode = sha2(global.registration.currMasterKey + user_id);
	if(currSessionCode == session_code) {
		return true;
	}
	currSessionCode = sha2(global.registration.prevMasterKey + user_id);
	if(currSessionCode == session_code) {
		return true;
	} else {
		return false;
	}
};
exports.verifyUser = verifyUser;

// ## The *authenticate* function
// is a wrapper around the *verifyUser* function that will also execute a
// provided *callback* if the user validation fails. This is a convenience
// function to reduce code size, but does not completely replace the
// *verifyUser* function if, for example, a function performs different actions
// depending on whether or not a user is logged in.
function authenticateUser(userId, sessionCode, callback) {
	if(verifyUser(userId, sessionCode)) {
		return true;
	} else {
		if(callback){
			callback(new Error("Invalid Session"));
		}
		return false;
	}
};
exports.authenticateUser = authenticateUser;

// ## The *errorOut* function
// is a simple method for JSON-RPC purposes (client and server) to call a
// specified callback on a specified error object, if it exists, and do so with
// a *proper* Error object
function errorOut(error, callback) {
	if(error) {
		if(error.message) { callback(new Error(error.message)); }
		else { callback(new Error(error)); }
		return true;
	}
	return false;
}
exports.errorOut = errorOut;

// ## The *mongoInsert* function
// is a convenience function for inserting data into a specified MongoDB collection
function mongoInsert(collection, inObject, callback) {
	if(collection && collection.insert) {
		collection.insert(inObject, {safe: true}, function(error, objects) {
			if(error) {
				if(error instanceof Error) { return callback(error); }
				return callback(new Error(error));
			}
			return callback(objects[0]);
		});
	} else {
		return callback(new Error("Invalid Collection"));
	}
}
exports.mongoInsert = mongoInsert;

// ## Common Mongoose field validators
// Enforce string length
exports.fieldValidators = {
	// Ensures a string is at least min characters and at most max characters
	stringLength: function(min, max){
		return function(v){
			return v.length >= min && v.length <= max; 
		};
	}
};

// ## Image URL provider
// Provides the URL of an image based on information about it
exports.getImageUrl = function(subsystem, imageId, size){
	// TODO Load from a config?
	var prefix = "https://s3.amazonaws.com/agrosica-";
	return prefix + subsystem + "/" + imageId + "/" + size + ".jpeg";
};

// ## The *buildServerUrl* function
// is a convenience function for constructing a JSON-RPC or other relatively static URL
exports.buildServerUrl = function(configObj) {
	return (configObj.ssl ? "https://" : "http://") +
		configObj.host + (configObj.port ? ":" + configObj.port : "") +
		(configObj.path ? configObj.path : "/");
};

// ## Trim a string or array of strings of whitespace, inline
exports.trim = function(data) {
	var trimString = function(string){
		return string.replace(/^\s*|\s*$/, '');
	};
	
    if(data instanceof Array){
		data.forEach(function(value, index, data){
			data[index] = trimString(value);
		});
	}else{
		data = trimString(data); 
	}
	return;
}

// ## The *makeJsonRpcServer* function
// builds the JSON-RPC HTTP server functionality used by many of our Node.js servers
exports.makeJsonRpcServer = function(config) {
	// The possible HTTP methods
	var handlePost, handleOptions, handleOther;
	// The OPTIONS method to shut Firefox up
	handleOptions = function(request, response) {
		response.writeHead(200, {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Method": "POST, GET, OPTIONS",
			"Access-Control-Allow-Headers": request.headers["access-control-request-headers"]
		});
		response.end();
	};
	// JSON-RPC server doesn't like getting non-JSON-RPC requests
	handleOther = function(response) {
		response.end("{result:null, error:\"Did not receive valid JSON-RPC data.\", id:-1}");
	};
	// Configuring the JSON-RPC server to handle requests as fast as possible
	// requires creating a handler that only checks what needs to be checked
	// at runtime, since these configurations are known from the beginning
	// and only need to be done once.
	if(config.privateRpc && config.trustedClients) { // Has a properly configured private RPC
		if(config.trustedClients instanceof Array) { // Has many valid trusted clients
			handlePost = function(request, response) {
				var usePrivate = false;
				for(var i = 0; i < config.trustedClients.length; i++) {
					if(config.trustedClients[i] instanceof RegExp &&
						config.trustedClients[i].test(request.socket.remoteAddress)) {
						usePrivate = true;
						break;
					} else if(config.trustedClients[i] == request.socket.remoteAddress) {
						usePrivate = true;
						break;
					}
				}
				if(usePrivate) {
					config.privateRpc.handleJSON(request, response);
				} else {
					config.publicRpc.handleJSON(request, response);
				}
			};
		} else if(config.trustedClients instanceof RegExp) { // A single RegExp to determine trusted clients
			handlePost = function(request, response) {
				if(config.trustedClients.test(request.socket.remoteAddress)) {
					config.privateRpc.handleJSON(request, response);
				} else {
					config.publicRpc.handleJSON(request, response);
				}
			};
		} else { // Assume a string to match for a single trusted client
			handlePost = function(request, response) {
				if(config.trustedClients == request.socket.remoteAddress) {
					config.privateRpc.handleJSON(request, response);
				} else {
					config.publicRpc.handleJSON(request, response);
				}
			};
		}
	} else { // No private RPC, so can short-circuit entire handling function
		handlePost = config.publicRpc.handleJSON;
	}
	var server = (config.https ? https : http);
	// Start the JSON-RPC server
	server.createServer(function(request, response) {
		if(request.method == "POST") {
			handlePost(request, response);
		} else if(request.method == "OPTIONS") {
			handleOptions(request, response);
		} else {
			handleOther(response);
		}
	}).listen(config.port);
};

// ## The *locationToAddressLine* function
// takes a location object and translates that into a string representation
exports.locationToAddressLine = function(loc) {
	var adr = loc.address;
	if(adr.city != "" && adr.region != "" && adr.country != "") {
		return adr.city + ", " + adr.region + ", " + adr.country;
	} else if(adr.city != "" && adr.region != "") {
		return adr.city + ", " + adr.region;
	} else if(adr.city != "" && adr.country != "") {
		return adr.city + ", " + adr.country;
	} else if(adr.city != "") {
		return adr.city;
	} else { // Whu?
		return "";
	}
};
