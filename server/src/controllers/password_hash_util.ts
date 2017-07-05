/**   
  * This will take the raw password as a parameter, salt it,
  *  prepend it, encrypt it, and then insert it into the database
  */
'use strict'; 
var crypt = require('crypto');
var Bcrypt = require('bcrypt');
var pgSql = require('plpgsql');

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypt.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};
/**
 * This will be the actual function that is called
 * @param ID - This is the userName or email
 * @param password - This is the raw password passed in
 */
var saltHashPassword = function (ID, password){
    var salt = genRandomString(20);
    var actHash = Bcrypt.hash(password, salt, null, function(err,hash){
        if (err) throw err;
        var sql = "INSERT INTO appUser(password) WHERE ID = username OR ID = email ";
    });
}
 
