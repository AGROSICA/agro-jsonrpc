//Didn't like either of the JSON-RPC servers. One had a nice syntax but was inflexible in allowing the server to provide more than just JSON-RPC functionality, the other was more flexible, but had an ugly syntax.
//David Ellis 27 March 2011 - 22 April 2011

//The JSONRPC object
function JSONRPC(scope) {
	var DATA = "";
	this.handleJSON = function(request, response) {
		var self = this;
		request.setEncoding('utf8');
		request.addListener('data', function(chunk) {
			DATA += chunk;
		});
		request.addListener('end', function() {
			var data = "";
			try {
				data = JSON.parse(DATA);
				DATA = "";
			} catch(e) {
				data = ""; //Will be handled below
			}
			if(data instanceof Object) {
				if(data.method) { //Valid-enough to run
					var result = "";
					if(scope[data.method] && scope[data.method].nonblocking) { //Exists on server and is nonblocking
						var callback = function(result, error) {
							if(data.id) {
								self.returnVal(response, {result:result, error:error, id:data.id});
							} else {
								self.returnVal(response, {result:result, error:error});
							}
						};
						try {
							if(data.params && data.params instanceof Array) {
								data.params.push(callback);
								scope[data.method].apply(scope, data.params);
							} else if(data.params) {
								scope[data.method].apply(scope, [data.params, callback]);
							} else {
								scope[data.method].apply(scope, [callback]);
							}
						} catch(e) {
							if(data.id) {
								self.returnVal(response, {result:null, error:e, id:data.id});
							} else {
								self.returnVal(response, {result:null, error:e});
							}
						}
					} else if(scope[data.method]) { //Exists on the server and is blocking
						try {
							if(data.params && data.params instanceof Array) {
								result = scope[data.method].apply(scope, data.params);
							} else if(data.params) {
								result = scope[data.method].apply(scope, [data.params]);
							} else {
								result = scope[data.method].apply(scope, []);
							}
							if(data.id) {
								self.returnVal(response, {result:result, error:null, id:data.id});
							} else {
								self.returnVal(response, {result:result, error:null});
							}
						} catch(e) {
							if(data.id) {
								self.returnVal(response, {result:null, error:e, id:data.id});
							} else {
								self.returnVal(response, {result:null, error:e});
							}
						}
					} else {
						self.returnVal(response, {result:null, error:"Requested method does not exist.", id:-1});
					}
				} else {
					self.returnVal(response, {result:null, error:"Did not receive valid JSON-RPC data.", id:-1});
				}
			} else {
				self.returnVal(response, {result:null, error:"Did not receive valid JSON-RPC data.", id:-1});
			}
		});
	};
	this.returnVal = function(response, retVal) {
		if(retVal.id || this.debug) {
			var outString = JSON.stringify(retVal);
			response.writeHead(retVal.error?500:200, {
				"Content-Length": outString.length,
				"Content-Type": "application/json"
			});
			response.end(outString);
		} else {
			response.end();
		}
	};
	this.setScope = function(newScope) { scope = newScope; };
	this.register = function(methodName, method) {
		if(!scope || typeof(scope) != "object") {
			scope = {};
		}
		scope[methodName] = method;
	};
	if(!scope || typeof(scope) != "object") {
		scope = root; //Note, this doesn't behave like in browsers, must explicitly declare functions in root to be in this scope
	}
	return this;
}

//Exporting object for use in Node.js apps
exports.JSONRPC = JSONRPC; //In case anyone wants to extend the object
exports.createJSONRPCserver = function(scope) { //Helper function for constructing the object
	return new JSONRPC(scope);
};
