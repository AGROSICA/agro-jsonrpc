//Didn't like any available JSON-RPC clients for browsers, so I wrote my own.
//David Ellis 27 March 2011
function JSONRPC(serverURL) {
	this.request = function() {
		var method = arguments[0];
		var responseHandler = arguments[arguments.length-1];
		var params = [];
		for(var i = 1; i < arguments.length-1; i++) {
			params[i-1] = arguments[i];
		}
		var contents = JSON.stringify({
			method: method,
			params: params,
			id: Math.random()
		});
		var req = new XMLHttpRequest();
		req.open("POST", serverURL, true);
		req.onreadystatechange = function() {
			if(req.readyState == 4) { //Done loading response
				if(req.status == 200 || req.status == 500) { //Executed successfully or function failed
					var myResponse = JSON.parse(req.responseText);
					delete myResponse.id;
					responseHandler(myResponse);
				} else { //Communication Failed
					responseHandler({error: "Could not communicate with server."});
				}
			}
		};
		req.setRequestHeader('Content-Length', contents.length);
		req.setRequestHeader('Content-Type', 'application/json');
		req.send(contents);
	};
	this.requestBlock = function() {
		var method = arguments[0];
		var params = [];
		for(var i = 1; i < arguments.length; i++) {
			params[i-1] = arguments[i];
		}
		var contents = JSON.stringify({
			method: method,
			params: params,
			id: Math.random()
		});
		var req = new XMLHttpRequest();
		req.open("POST", serverURL, false);
		req.setRequestHeader('Content-Length', contents.length);
		req.setRequestHeader('Content-Type', 'application/json');
		req.send(contents);
		if(req.status == 200 || req.status == 500) { //Executed successfully, or function failed
			var myResponse = JSON.parse(req.responseText);
			if(myResponse.error) {
				throw myResponse.error;
			} else {
				return myResponse.result;
			}
		} else { //Communication unsuccessful
			throw "Could not communicate with server.";
		}
	};
	this.register = function(method) {
		var self = this;
		var singleReg = function(method) {
			self[method] = function() {
				var theArgs = []; //Copy arguments into a normal array object
				for(var i in arguments) {
					theArgs[i] = arguments[i];
				}
				self.request.apply(self, [].concat(method, theArgs));
			};
			self[method + "Block"] = function() {
				var theArgs = [2]; //Copy arguments into a normal array object
				for(var i in arguments) {
					theArgs[i] = arguments[i];
				}
				return self.requestBlock.apply(self, [].concat(method, theArgs));
			};
		};
		if(typeof(method) == "object" && method.length) {
			for(var i in method) {
				singleReg(method[i]);
			}
		} else {
			singleReg(method);
		}
	};
	return this;
}
