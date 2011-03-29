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
				if(req.status == 200) { //Executed successfully
					var myResponse = JSON.parse(req.responseText);
					delete myResponse.id;
					responseHandler(myResponse);
				} else { //Failed
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
		if(req.status == 200) { //Executed successfully
			var myResponse = JSON.parse(req.responseText);
			delete myResponse.id;
			return myResponse;
		} else { //Failed
			return {error: "Could not communicate with server."};
		}
	};
	this.register = function(method) {
		this[method] = function() {
			var theArgs = []; //Copy arguments into a normal array object
			for(var i in arguments) {
				theArgs[i] = arguments[i];
			}
			this.request.apply(this, [].concat(method, theArgs));
		};
		this[method + "Block"] = function() {
			var theArgs = [2]; //Copy arguments into a normal array object
			for(var i in arguments) {
				theArgs[i] = arguments[i];
			}
			return this.requestBlock.apply(this, [].concat(method, theArgs));
		};
	};
	return this;
}
