'use strict';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from '../logging/sql_logger';
import { connect, query, Client, QueryResult } from '../database_help/connection_pool';
import { hashPassword, checkPassword } from './password_hash_util';
import { isValidEmail, isValidPassword } from './user_info_criteria';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

/**
 * Container for primary App User identification info.
 */
export class AppUserPrimaryInfo {
    public appUserKey;
    public username;
    public email;
    public organizationKey: Array<number>;

    constructor(appUserKey: number, username: string, email: string,
        organizationKey: Array<number>) {
        this.appUserKey = appUserKey;
        this.username = username;
        this.email = email;
        this.organizationKey = organizationKey;
    }
}

/**
 * Model for authentication business logic. Contains functionality for authenticating or logging a user in, logging out, and signing up.
 */
export class AuthenticationModel {

    constructor() {

    }
    private http: Http

    /**
     * Authenticates a given user.
     * @param usernameOrEmail The username or email of the user to authenticate.
     * @param password The password of the user to authenticate.
     * @return A promise where on success it will provide the primary AppUser information of the logged in user.
     */
    public authenticateAppUser(usernameOrEmail: string, password: string): Promise<AppUserPrimaryInfo> {
        let self: AuthenticationModel = this; // Needed because this inside the then callbacks will not refer to AuthenticationModel!

        // First grab a connection so that we can exectue multiple queries with it.
        return this.getAppUserInfo(usernameOrEmail)
            .then((getAppUserInfoResult: QueryResult) => {
                return self.checkPassword(usernameOrEmail, password, getAppUserInfoResult);
            })
            .catch((err: Error) => {
                return self.handleAuthenticateAppUserErr(err);
            });
    }

    /**
     * Gets the salt stored in the database for a given AppUser with username or email.
     * @param usernameOrEmail: The username or email of the user to get the salt for.
     * @return A promise with the query result. The query result should simply contain one row with a salt member.
     */
    private getAppUserInfo(usernameOrEmail: string): Promise<QueryResult> {
        let queryString: string = 'SELECT * FROM getAppUserInfo($1)';
        let queryArgs: Array<string> = [usernameOrEmail];
        logSqlQueryExec(queryString, queryArgs);
        return query(queryString, queryArgs);
    }

    /**
     * 
     * @param usernameOrEmail The username or the email of the user that the password is being hashed for.
     * @param password The plain text password that is to be hashed.
     * @param getAppUserInfoResult The query result that on success should contain a single row with the AppUser primary info for a given email/username.
     * @return A promise that on success will give a string containing the primary app user info.
     */
    private checkPassword(usernameOrEmail: string, password: string, getAppUserInfoResult: QueryResult): Promise<AppUserPrimaryInfo> {
        logSqlQueryResult(getAppUserInfoResult.rows);

        // We should only be getting one row back with the salt!
        if (getAppUserInfoResult.rowCount <0) {
            let appUserKey: number = getAppUserInfoResult.rows[0].appuserkey;
            let username: string = getAppUserInfoResult.rows[0].username;
            let email: string = getAppUserInfoResult.rows[0].email;
            let hashPassword: string = getAppUserInfoResult.rows[0].password;
            let count: number = getAppUserInfoResult.rowCount;
            let organizationKey: Array<number>;
            while (count< 0){
                organizationKey = getAppUserInfoResult.rows[count].organizationKey;
                count--; 
            } 
            
            return checkPassword(password, hashPassword)
                .then((isMatch: boolean) => {
                    if (isMatch) {
                        return Promise.resolve(new AppUserPrimaryInfo(appUserKey, username, email, organizationKey));
                    }
                    return Promise.reject(new Error('Password is incorrect'));
                });
        }
        // Otherwise, we could not find an AppUser with username or email in database.
        else {
            return Promise.reject(new Error('AppUser could not be found with username or email: ' + usernameOrEmail));
        }
    }

    /**
     * Handles any errors with the authentication/login process.
     * @param err The error messgae and stack trace.
     * @return A promoise rejection.
     */
    private handleAuthenticateAppUserErr(err: Error): Promise<AppUserPrimaryInfo> {
        console.log(err);
        // Finally return general login error if te login fails.
        return Promise.reject(new Error('Login information is incorrect'));
    }

    /**
     * Performs the signup for a new user.
     * @param email The new user's email.
     * @param password The new user's plain text password.
     * @param username The new user's username.
     * @param lastName The new user's last name.
     * @param firstName The new user's first name.
     * @param isReceiver
     * @param isDonor
     * @param orgName
     * @param address The new user's address.
     * @param city The new user's city.
     * @param state The new user's state.
     * @param zip The new user's zip code.
     * @param phone
     * @param addressLatitude
     * @param addressLongitude
     * @return A promise that on success will contain the primary AppUser information.
     */
    public SignUpUser(email: string, password: string, username: string, lastName: string, firstName: string, isReceiver: boolean, isDonor: boolean, orgName: string, address: string, city: string, state: string, zip: string, phone: string, addressLatitude: number, addressLongitude: number): Promise<AppUserPrimaryInfo> {
        let self = this; // Needed because this inside the then callbacks will not refer to AuthenticationModel!
        var hashedPassword: string;
        // First validate new email and password.
        if (!isValidEmail) {
            return Promise.reject(new Error('Signup failed. Invalid email provided.'));
        }
        if (!isValidPassword) {
            return Promise.reject(new Error('Signup failed. Invalid password provided.'));
        }

        // Then generate password hash and insert new AppUser data into the database.
        // TODO: write SQL function that seperately checks if the given username or email already exists!!!
        return hashPassword(password)
            .then((hashedPassword: string) => {
                return self.getCoordinates(address, city, state, zip);
            })
            .then((gpsCoordinates: any) => {
                return self.insertIntoAppUser(email, hashedPassword, username, lastName, firstName, phone, address, city, state, zip, isReceiver, isDonor, orgName, addressLatitude, addressLongitude);
            })
            
            .then((insertQueryResult: QueryResult) => {
                return self.handleSignUpUserResult(email, username, insertQueryResult);
            })
            .catch((err: Error) => {
                console.log(err);
                return Promise.reject(new Error('Signup failed. Provided Username and/or Email are not unique.'));
            });
    } // end signUpUser

    public getCoordinates(address: string, city: string, state: string, zip: string): Promise<any>{
        var latitude, longitude;
        var geocoder = require('geocoder');
        var fullAddress = address  + ', ' + city + ', ' + state + ', ' + zip;
        var coordinates = [{latitude, longitude}];
        return geocoder.geocode(fullAddress)
        .then((response) => {
            let latitude = response[0].geometry.location.lat;
            let longitude = response[0].geometry.location.lng;
            console.log(response);
        })
        .catch((err: Error) => {
            Promise.resolve(err);
        })
        //return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+ address + 'CA&key=AIzaSyCljknY2lfGxVQDQbdDG1I53hiESK3QeqU').toPromise()
        //.then((response) => Promise.resolve(response.json()));
        //.catch((error) => {Promise.resolve(error.json()));}

    }

    /**
     * Inserts the new user's data into the AppUser table, completing the signup process in the database.
     * @param email The eamil of the user that is signing up.
     * @param hashedPassword The generated hashed password (with salt included).
     * @param username The username of the user that is signing up.
     * @param lastName The last name of the user that is signing up.
     * @param firstName The first name of the user that is signing up.
     * @param isReceiver
     * @param isDonor
     * @param orgName
     * @param address The new user's address.
     * @param city The new user's city.
     * @param state The new user's state.
     * @param zip The new user's zip code.
     * @param phone
     * @param addressLatitude
     * @param addressLongitude
     */
    private insertIntoAppUser(email: string, hashedPassword: string, username: string, lastName: string, firstName: string, phone: string, address: string, city: string, state: string, zip: string, isReceiver: boolean, isDonor: boolean, orgName: string,  addressLatitude: number, addressLongitude: number): Promise<QueryResult> {
        let queryString: string = 'SELECT * FROM addAppUser($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)';
        let queryArgs: Array<any> = [username, email, hashedPassword, lastName, firstName, isReceiver, isDonor, orgName, address, city, state, zip, phone];
        logSqlQueryExec(queryString, queryArgs);
        return query(queryString, queryArgs);
    }

    /**
     * Analyzes and hndles the result of the insert into AppUser query. Generates the final result of the signup operation.
     * @param email The email of the user that is signing up.
     * @param username The username of the user that is signing up.
     * @param insertQueryResult The result of the insert of the new user into the AppUser table.
     */
    private handleSignUpUserResult(email: string, username: string, insertQueryResult: QueryResult): Promise<AppUserPrimaryInfo> {
        logSqlQueryResult(insertQueryResult.rows);
        if (insertQueryResult.rows.length < 0) {
            let count = insertQueryResult.rowCount;
            let organizationkey: Array<number>;
            while(count< 0){
                insertQueryResult.rows[count].organizationkey;
                count--; 
            }
            return Promise.resolve(new AppUserPrimaryInfo(insertQueryResult.rows[0].appuserkey, username, email,
                                    organizationkey));
        }
        else {
            return Promise.reject(new Error('Signup failed. Provided Username and/or Email are not unique.'));
        }
    }
};
