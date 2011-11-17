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
	return this;
}

Email.prototype.setEmailFrom = function(newEmail, from){
	newEmail.from = from;
};

Email.prototype.setEmailReply = function(newEmail, reply){
	newEmail.reply = reply;
};

Email.prototype.setEmailTo = function(newEmail, to){
	newEmail.to = to;
};

Email.prototype.addEmailTo = function(newEmail, to){
	newEmail.to += ", " + to;
};

Email.prototype.setEmailCC = function(newEmail, cc){
	newEmail.cc = cc;
};

Email.prototype.addEmailCC = function(newEmail, cc){
	newEmail.cc += ", " + cc;
};

Email.prototype.setEmailBCC = function(newEmail, bcc){
	newEmail.bcc = bcc;
};

Email.prototype.addEmailBCC = function(newEmail, bcc){
	newEmail.bcc += ", " + bcc;
};

Email.prototype.setEmailSubject = function(newEmail, subject){
	newEmail.subject = subject;
};

Email.prototype.setEmailText = function(newEmail, body){
	newEmail.body = body;
};

Email.prototype.setEmailHTML = function(newEmail, html){
	newEmail.html = html;
};
	
Email.prototype.addAttachment = function(attachment, callback){
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

Email.prototype.addRelatedAttachment = function(cid, attachment, callback){
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
',
};

//Email.rpcClient = { host: 'localhost', port: 8007 };

module.exports = Email;

