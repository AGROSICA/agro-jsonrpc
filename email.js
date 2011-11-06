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
	this.attachments = new Array();

	this.setEmailFrom = function(newEmail, from){
		newEmail.from = from;
	};

	this.setEmailReply = function(newEmail, reply){
		newEmail.reply = reply;
	};

	this.setEmailTo = function(newEmail, to){
		newEmail.to = to;
	};

	this.addEmailTo = function(newEmail, to){
		newEmail.to += ", " + to;
	};

	this.setEmailCC = function(newEmail, cc){
		newEmail.cc = cc;
	};

	this.addEmailCC = function(newEmail, cc){
		newEmail.cc += ", " + cc;
	};

	this.setEmailBCC = function(newEmail, bcc){
		newEmail.bcc = bcc;
	};

	this.addEmailBCC = function(newEmail, bcc){
		newEmail.bcc += ", " + bcc;
	};

	this.setEmailSubject = function(newEmail, subject){
		newEmail.subject = subject;
	};

	this.setEmailText = function(newEmail, body){
		newEmail.body = body;
	};

	this.setEmailHTML = function(newEmail, html){
		newEmail.html = html;
	};
	
	this.addAttachment = function(attachment, callback){
		var self = this;
		var content;
		//get the filename portion of the attachment (i.e. whatever comes after the last /)
		//attachment name itself if it is in the same directory
		var filename = path.basename(attachment);
		fs.readFile(attachment, function(err, content){
			//process error message		
			if(err){
				callback(false, err);
			}
			else{
				self.attachments.push({"filename": filename, "contents": content});
				callback(true, "success");
			}
		});
	
	};

	this.addRelatedAttachment = function(cid, attachment, callback){
		var self = this;
		var content;
		//get the filename portion of the attachment (i.e. whatever comes after the last /)
		//attachment name itself if it is in the same directory
		var filename = path.basename(attachment);
		fs.readFile(attachment, function(err, content){
			//process error message		
			if(err){
				callback(false, err);
			}
			else{
				self.attachments.push({"filename": filename, "contents": content, cid: cid});
				callback(true, "success");
			}
		});
	
	};

	return this;
}

//Email.prototype

module.exports = Email;

