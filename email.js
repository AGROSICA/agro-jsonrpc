var path = require('path');
var fs = require("fs");

//Email class to construc Emails
function Email(from, to, subject, body){
	this.from = from;
	this.to = to;
	this.reply = from;
	this.cc = "";
	this.bcc = "";
	this.subject = subject;
	this.body = body;
	this.html = body;
	this.attachments = [];

	/*privateRpcMethods.setEmailFrom = function(newEmail, from){
		newEmail.from = from;
	};

	privateRpcMethods.setEmailReply = function(newEmail, reply){
		newEmail.reply = reply;
	};

	privateRpcMethods.setEmailTo = function(newEmail, to){
		newEmail.to = to;
	};

	privateRpcMethods.addEmailTo = function(newEmail, to){
		newEmail.to += ", " + to;
	};

	privateRpcMethods.setEmailCC = function(newEmail, cc){
		newEmail.cc = cc;
	};

	privateRpcMethods.addEmailCC = function(newEmail, cc){
		newEmail.cc += ", " + cc;
	};

	privateRpcMethods.setEmailBCC = function(newEmail, bcc){
		newEmail.bcc = bcc;
	};

	privateRpcMethods.addEmailBCC = function(newEmail, bcc){
		newEmail.bcc += ", " + bcc;
	};

	privateRpcMethods.setEmailSubject = function(newEmail, subject){
		newEmail.subject = subject;
	};

	privateRpcMethods.setEmailText = function(newEmail, body){
		newEmail.body = body;
	};

	privateRpcMethods.setEmailHTML = function(newEmail, html){
		newEmail.html = html;
	};
	*/
	this.addAttachment = function(attachment, callback){
		//get the filename portion of the attachment (i.e. whatever comes after the last /)
		//attachment name itself if it is in the same directory
		var filename = path.basename(attachment);
		//check that attachment is valid
		//check is file/exists
		//check file type	
		//check size
		fs.readFile(attachment, function(err, content){
			//process error message		
			if(err){
				callback(err);
			}
			else{
				if(!this.attachments){
					this.attachments = [];
					console.log(this.attachments);
					this.attachments.push({filename: filename, contents: content});
					console.log(this.attachments);
				}
			}
		});
	};

	return this;
}

//Email.prototype

module.exports = Email;

