var crypto = require('crypto');

// ## The *SHA2* function
// uses the OpenSSL SHA2 256bit algorithm, producing output compatible with prior
// "homebrew" writeup. See the [Wikipedia entry on SHA-2](http://en.wikipedia.org/wiki/SHA-2)
// for more details.
function SHA2(text) {
	var sha256 = crypto.createHash('sha256');
	sha256.update(text);
	return sha256.digest('hex').toUpperCase();
}
// If this code is running in Node.js, add it to the exports
module.exports = SHA2;
