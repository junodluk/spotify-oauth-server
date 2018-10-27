var CryptoJS = require('crypto-js');
var randomstring = require('randomstring');
var ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || randomstring.generate(30);

/**
 * Uses encryption secret defined in environment to encrypt
 * tokens ready for network transfer. Uses symmetric encryption
 * so the token can then be
 *
 * @param {String} String to encrypt
 *
 * return String The encrypted string
 */
module.exports.encrypt = function (text) {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET).toString();
};

/**
 * Uses encryption secret defined in environment to decrypt
 * a string. This is usually a refresh token which has been
 * sent from a client application.
 *
 * @param {String} String to decrypt
 *
 * return String The decrypted string
 */
module.exports.decrypt = function (text) {
    var bytes = CryptoJS.AES.decrypt(text, ENCRYPTION_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
};