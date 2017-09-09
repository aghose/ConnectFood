"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
__export(require("pg"));
require('dotenv');
/**
 * The process.env object contains the global environmental variables set in the root directory's .env file.
 * For deployment on Heroku, we will explicitly set the environmental variables using 'heroku config:set ENVIRONEMNTAL_VAR_NAME = value' via the heroku cli.
 */
var config = {
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    database: process.env.DATABASE_DATABASE,
    ssl: (process.env.DATABASE_SSL.toLowerCase() === 'true')
};
/**
 * A static instace of a connection pool for pgsql.
 */
var pool = new pg_1.Pool(config);
/**
 * This is a convenience method for quickly implicitly obtaining a connection, executing a single query, and releasing the connection automatically when finished.
 * Feel free to use this if you are performing a single simple query.
 * @param text The prepared query statement.
 * @param values (OPTIONAL) The arguments to the prepared query statement.
 * @return A JavaScript Promise that will contain the result of the query upon success and error information upon failure.
 */
function query(text, values) {
    if (values === void 0) { values = null; }
    if (values != null) {
        return pool.query(text, values);
    }
    else {
        return pool.query(text);
    }
}
exports.query = query;
;
/**
 * This is used to grab a connection from the underlying connection pool.
 * You are expected to release the conneciton back into the pool to make it available for others to use when you are done with it.
 * To do this, call release() on the connection object returned by this method.
 * @return A Promise that will provide a client or connection object on success that can have queries exected on it.
 */
function connect() {
    return pool.connect();
}
exports.connect = connect;
;
//# sourceMappingURL=connection-pool.js.map