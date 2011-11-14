var Email = require("./email");
var Email2 = require("./email2");

//Number of email addresses to attach
var len = 1000000;

//Initializing array
var addresses = new Array(len);
for(var i = 0; i < len; i++) {
	addresses[i] = "test@address.com";
}

//Test 1: Using addEmailTo method
var test1Start = Date.now();
var test1Email = new Email();
for(var i = 0; i < addresses.length; i++) {
	test1Email.addEmailTo(addresses[i]);
}
var test1End = Date.now();
console.log("Test 1 Time (ms): " + (test1End-test1Start));

//Test 2: Direct object access on instantiated Email
var test2Start = Date.now();
var test2Email = new Email();
test2Email.to = addresses.concat(", ");
var test2End = Date.now();
console.log("Test 2 Time (ms): " + (test2End-test2Start));

//Test 3: Direct object access on "raw" object
var test3Start = Date.now();
var test3Email = {
	to: addresses.concat(", ")
};
var test3End = Date.now();
console.log("Test 3 Time (ms): " + (test3End-test3Start));

//Test 4: Demonstration of instantiated Email object time
var test4Start = Date.now();
for(var i = 0; i < len; i++) {
	var test4Email = new Email(null, "test@address.com");
}
var test4End = Date.now();
console.log("Test 4 Time (ms): " + (test4End-test4Start));

//Test 5: Demonstration of "raw" object time
var test5Start = Date.now();
for(var i = 0; i < len; i++) {
	var test5Email = { to: "test@address.com" };
}
var test5End = Date.now();
console.log("Test 5 Time (ms): " + (test5End-test5Start));

//Test 6: Demonstration of the instantiated Email2 object time
var test6Start = Date.now();
for(var i = 0; i < len; i++) {
	var test6Email = new Email2(null, "test@address.com");
}
var test6End = Date.now();
console.log("Test 6 Time (ms): " + (test6End-test6Start));
