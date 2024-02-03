import { Injectable } from '@nestjs/common';
import { CrateDbService } from 'src/common/common/crateDb.service';
import { DB_CONFIG, SECRETS, SPECTRUM_CONFIG } from 'src/shared/config/global-db-config';
import { ApiResponse } from 'src/shared/entities/common/apiResponse';
import { HashService } from 'src/shared/services/hash/hash.service';
import { QueryGenratorService } from 'src/shared/services/query-genrator/query-genrator.service';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from 'src/shared/services/common/common.service';
import { EmailService } from '../email/email.service';
const { v4: uuidv4 } = require('uuid');
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private hashService: HashService,
        private queryGenratorService: QueryGenratorService,
        private crateDbService: CrateDbService,
        private emailService: EmailService,
    ) { }

    async registerUser(body, origion): Promise<any> {
        try {
            console.log(body);
            const hashedPassword = await this.hashService.hashPassword(body?.password);
            body.password = hashedPassword;
            console.log("After Pwd  : " + JSON.stringify(body));
            const excludedColumns = ['responsekey', 'domain'];
            let checkUserQuery = `select * from dev_meta.users where email='${body?.email}' and applicationid='${body?.applicationId}' `;
            let result = await this.crateDbService.executeQuery(checkUserQuery);
            console.log(result)
            if (result.data.length > 0) {
                return result;
            }

            const { query, values } = this.queryGenratorService.generateInsertQueryExcludedColumns(`${DB_CONFIG.CRATEDB.mode}meta.users`, body, excludedColumns);
            console.log(query);
            let user = await this.crateDbService.executeQuery(query);

            const emailText = `Welcome to ${body.username} - Registration Confirmation`;
            const emailSubject = `Account Registration - PMO Governance Managment Order Portal`;
            let dataForEmailTemplate: any = {
                name: body.firstName + ' ' + body.lastName,
                companyName: body.companyname,
                email: SPECTRUM_CONFIG.SPECTRUM.email,
                webistUrl: SPECTRUM_CONFIG.SPECTRUM.webistUrl,
                ContactInformation: SPECTRUM_CONFIG.SPECTRUM.ContactInformation,
                username: body.username,
                loginlink: origion + '/login'
            }
            const attachment = this.emailService.makeTemplates('registered', dataForEmailTemplate);

            if (attachment) {
                await this.emailService.sendEmail(emailSubject, body.username, emailText, attachment);
            }

            return user;
        } catch (error) {
            console.error('Error in registerUser:', error);
            return new ApiResponse(false, `${error}`, []);
        }
    }


    async createUserExternal(body): Promise<any> {
        console.log(body);
        let checkUserQuery = `select * from dev_meta.users where email='${body?.email}' and applicationid='${body?.applicationId}' `;
        let result = await this.crateDbService.executeQuery(checkUserQuery);
        console.log(result)
        if (result.data.length > 0) {
            return (result);
        }
        const hashedPassword = await this.hashService.hashPassword(body?.password);
        body.password = hashedPassword;
        console.log("After Pwd  : " + JSON.stringify(body));
        const excludedColumns = ['responsekey', 'domain'];

        const { query, values } = this.queryGenratorService.generateInsertQueryExcludedColumnsExternalLogin(`${DB_CONFIG.CRATEDB.mode}meta.users`, body, excludedColumns, body?.id);
        console.log(query);
        return await this.crateDbService.executeQuery(query);

        // Save the username and hashedPassword to the database
    }

    async login(user: any): Promise<ApiResponse<any>> {
        try {
            if (typeof user === 'string') {
                // If the user variable is a string, it means it's an error message.
                return new ApiResponse(false, user);
            }


            const sanitizedUsername = user.username.replace(/\s/g, '');

            let query = `SELECT  * FROM ${DB_CONFIG.CRATEDB.mode}meta.users WHERE LOWER((username)) = LOWER(('${sanitizedUsername}')) AND applicationId = '${user.applicationId}'`;
            const getuserDetail = await this.crateDbService.executeQuery(query);

            if (getuserDetail.data?.length == 0) {
                return new ApiResponse(false, 'username is incorrect');
            }

            const getuser = getuserDetail?.data?.[0];
            if (getuser?.status == 'Pending') {
                return new ApiResponse(false, 'user not approved');
            }
            const orgQuery = `SELECT name FROM ${DB_CONFIG.CRATEDB.mode}meta.organization WHERE id = '${getuserDetail?.data[0]?.organizationid}';  `

            const getorganization = await this.crateDbService.executeQuery(orgQuery);
            const organization = getorganization?.data?.[0];
            // let organization = await this.organizationService.getById(getuser.organizationId);
            const objAuth = {
                username: getuser.username,
                status: getuser.status,
                userId: getuser.id,
                applicationId: getuser.applicationid,
                organizationId: getuser.organizationid,
                organizationName: organization.name,
                name: `${getuser.firstName} ${getuser.lastname}`,
                contactnumber: getuser?.contactnumber,
            };

            if (objAuth?.status == 'Approved' || objAuth?.status == undefined) {
                let userMapping: any = await this.findUserPolicyAll(getuser.id);

                let newMapping = [];
                let policyBulk;
                console.log("AllnewMapping", JSON.stringify(newMapping));

                objAuth['policyBulk'] = [];

                for (let element of userMapping) {
                    try {
                        // Fetch policy data using a CrateDB-compatible query
                        const policyQuery = ` SELECT name, applicationTheme FROM ${DB_CONFIG.CRATEDB.mode}meta.policy WHERE id = '${element.policyid}'`;
                        const policyResult = await this.crateDbService.executeQuery(policyQuery);

                        const policy = policyResult.data?.length > 0 ? policyResult.data[0] : null;

                        let elementCopy = { ...element };
                        elementCopy['policyName'] = policy ? policy.name : "N/A";
                        elementCopy['policyTheme'] = policy ? policy.applicationTheme : '';
                        objAuth['policy'] = elementCopy;

                    } catch (err) {
                        console.error("Error fetching policy:", err);
                    }
                }
                const payload = { username: getuser.username, sub: getuser.id, status: user.status, userDetail: objAuth };
                console.log('payload : ' + JSON.stringify(payload))
                objAuth['access_token'] = this.jwtService.sign(payload, { secret: SECRETS.secretKey, expiresIn: '10h' });
                objAuth['refresh_token'] = this.jwtService.sign(
                    { username: getuser.username, sub: getuser.id, status: user.status, userDetail: objAuth },
                    { secret: SECRETS.secretKey, expiresIn: '10h' },
                );
                return new ApiResponse(true, 'Data Retrieved', objAuth);
            } else {
                return new ApiResponse(false, 'User is not approved..!');
            }

        }
        catch (error) {
            console.log('error : ' + error)
            // this.errorLogger.error(`API: login - Login: ${error}`);
            return new ApiResponse(false, error.message);
        }
    }


    async validateUser(username: string, plainTextPassword: string): Promise<boolean> {
        // Retrieve the user and hashed password from the database
        return this.hashService.comparePassword('storedHash', plainTextPassword);
    }

    async getAppDetails(domain: string) {
        let cmd: string;

        cmd = `SELECT  apps.*,og.id as organizationid, dep.id as departmentid, dep.name as departmentname, apps.name as applicationname
        FROM ${DB_CONFIG.CRATEDB.mode}meta.Application apps
        JOIN ${DB_CONFIG.CRATEDB.mode}meta.Department dep ON apps.departmentid = dep.id
        JOIN ${DB_CONFIG.CRATEDB.mode}meta.organization og ON dep.organizationid = og.id
        Where  apps.domains = '${domain}';`;

        return await this.crateDbService.executeQuery(cmd);
    }
    async getByDomain(type, id: string): Promise<ApiResponse<any>> {
        try {

            const getTableName = type.split('.')[0].toLowerCase();
            const query = `  SELECT * FROM ${DB_CONFIG.CRATEDB.mode}meta.application WHERE  domains ='${id}'`;

            const result = await this.crateDbService.executeQuery(query);

            if (!result.isSuccess && !result?.data) {
                return new ApiResponse(false, 'No data found');
            }

            const instance = result.data?.[0];

            // Query to retrieve department data
            const findDepartmentQuery = `SELECT *  FROM ${DB_CONFIG.CRATEDB.mode}meta.department WHERE id = '${instance.departmentid}' `;

            const findDepartmentResult = await this.crateDbService.executeQuery(findDepartmentQuery);

            const findDepartment = findDepartmentResult.data?.length > 0 ? findDepartmentResult.data[0] : undefined;

            const obj = {
                application: instance,
                department: findDepartment
            };

            return new ApiResponse<any>(true, 'Success', obj);
        } catch (error) {
            return new ApiResponse<any>(false, error.message);
        }
    }

    async findUserPolicyAll(id: string) {
        const query = ` SELECT * FROM ${DB_CONFIG.CRATEDB.mode}meta.usermapping  WHERE userid = '${id}'`;

        const result = await this.crateDbService.executeQuery(query);

        // Check if a default policy exists
        const defaultPolicy = result.data?.length > 0
            ? result.data.find((mapping: any) => mapping.defaultpolicy === true || mapping.defaultpolicy === 'true')
            : undefined;

        if (defaultPolicy) {
            return [defaultPolicy];
        }

        // If no default policy exists, return the last mapping
        if (result.data?.length > 0) {
            return [result.data[0]];
        }

        // If no mappings are found, return undefined or handle it as needed
        return;
    }
    async resetPassword(data: any, origion: string, appId): Promise<ApiResponse<any>> {
        try {
            const appQuery = `SELECT * FROM ${DB_CONFIG.CRATEDB.mode}meta.application where domains = '${data.domain}'`;
            const getApplication = await this.crateDbService.executeQuery(appQuery);
            const getAppID = getApplication.data.length > 0 ? getApplication.data[0].id : null;
            const execQuery = `SELECT * FROM ${DB_CONFIG.CRATEDB.mode}meta.users  WHERE username = '${data.email}' AND applicationid = '${getAppID}'`;
            const result = await this.crateDbService.executeQuery(execQuery);
            const userData = result.data.length > 0 ? result.data[0] : null;

            // Get the last record from the 'forgot' table
            const lastRecordQuery = `SELECT * FROM ${DB_CONFIG.CRATEDB.mode}meta.forgot WHERE email = '${data.email}' order by createddate desc LIMIT 1; `;
            const lastRecordQueryResult = await this.crateDbService.executeQuery(lastRecordQuery);
            const lastForgotRecord: any = lastRecordQueryResult.data.length > 0 ? lastRecordQueryResult.data[0] : null;;

            if (!lastForgotRecord) {
                return new ApiResponse(false, 'No password reset request found.');
            }

            // Check if the provided data matches the last record
            if (
                lastForgotRecord.verificationcode === data.verificationCode &&
                lastForgotRecord.verificationtoken === data.token &&
                lastForgotRecord.email === data.email
            ) {
                // Parse the expiryDate to a Date object for comparison
                const expiryDate = new Date(lastForgotRecord.expirydate);

                // Get the current datetime
                const currentDateTime = new Date();

                // Compare current datetime with expiryDate
                if (currentDateTime <= expiryDate) {
                    // Reset the password for the user associated with the email
                    // You can call your user service's reset password method here

                    // await this.userService.resetPassword(data.email, data.password);
                    // Hash the new password before saving it
                    const saltRounds = 10; // You can adjust the number of salt rounds
                    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
                    data.password = hashedPassword;
                    userData['createddate']
                    const updateQuery: any = await this.queryGenratorService.generateUpdateQuery(`${DB_CONFIG.CRATEDB.mode}meta.users`, userData.id, userData)
                    const result = await this.crateDbService.executeQuery(updateQuery.updateQuery);
                    // Delete the used 'forgot' record
                    // await lastForgotRecord.deleteOne();
                    let dataForEmailTemplate: any = {
                        email: SPECTRUM_CONFIG.SPECTRUM.email,
                        webistUrl: SPECTRUM_CONFIG.SPECTRUM.webistUrl,
                        ContactInformation: SPECTRUM_CONFIG.SPECTRUM.ContactInformation,
                        username: data.email,
                        loginlink: origion + '/login',
                        name: userData?.firstname + ' ' + userData?.lastname,
                    }
                    const attachment = this.emailService.makeTemplates('resetPassword', dataForEmailTemplate);
                    if (attachment) {
                        const emailSubject = ' Password Reset Successful - PMO Governance Managment Order Portal';
                        const emailText = ' Password Reset Successful - PMO Governance Managment Order Portal';

                        await this.emailService.sendEmail(emailSubject, data.username, emailText, attachment);
                    }
                    return new ApiResponse(true, 'Password reset successfully.');
                }
                else {
                    return new ApiResponse(false, 'Password reset request has expired.');
                }
            } else {
                return new ApiResponse(false, 'Invalid password reset request data.');
            }
        } catch (error) {
            return new ApiResponse(false, error.message);
        }
    }
    async create(data: any, origion: string, appId): Promise<ApiResponse<any>> {
        const appQuery = `SELECT * FROM  ${DB_CONFIG.CRATEDB.mode}meta.application where domains = '${data.domain}'`;
        const getApplication = await this.crateDbService.executeQuery(appQuery);
        const getAppID = getApplication.data.length > 0 ? getApplication.data[0].id : null;
        const execQuery = `SELECT * FROM ${DB_CONFIG.CRATEDB.mode}meta.users  WHERE username = '${data.email}' AND applicationid = '${getAppID}'`;
        const result = await this.crateDbService.executeQuery(execQuery);
        const existingUser: any = result.data.length > 0 ? result.data[0] : null;


        if (!existingUser) {
            // If the username exists, return an error or handle it as needed
            return new ApiResponse(false, 'Email did not exists. Please use another');
        }

        // Generate a JWT token with a 15-minute expiration
        const token = this.jwtService.sign({ email: data.email }, { secret: SECRETS.secretKey, expiresIn: '10h' })
        // const token = this.jwtService.sign({ email: data.email }, { expiresIn: '15m' });

        const verificationCode = this.generateRandomCode(6); // You need to implement this function

        // Generate the expiry date (15 minutes from now)
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 15);
        // Save the token, along with other data, into your 'forgot' collection
        const obj = {
            verificationtoken: token,
            verificationcode: verificationCode,
            expirydate: expiryDate.toISOString(),
            email: data.email,
            name: token
        }
        const { query } = this.queryGenratorService.generateInsertQuery(`${DB_CONFIG.CRATEDB.mode}meta.forgot`, obj);
        const savedInstance = await this.crateDbService.executeQuery(query);
        if (savedInstance.data.length == 0) {
            return savedInstance;
        }
        // Create a link with the token
        const resetLink = origion + `/reset-password?token=${token}&code=${verificationCode}&email=${data.email}`;
        // Define months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Extract date components
        const day = expiryDate.getDate();
        const month = months[expiryDate.getMonth()];
        const year = expiryDate.getFullYear();
        const hours = expiryDate.getHours();
        const minutes = expiryDate.getMinutes();
        const seconds = expiryDate.getSeconds();

        // Format the date
        const formattedExpiryDate = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
        let dataForEmailTemplate: any = {
            email: SPECTRUM_CONFIG.SPECTRUM.email,
            webistUrl: SPECTRUM_CONFIG.SPECTRUM.webistUrl,
            ContactInformation: SPECTRUM_CONFIG.SPECTRUM.ContactInformation,
            username: data.email,
            loginlink: origion + '/login',
            resetLink: resetLink,
            expiryDate: formattedExpiryDate,
            name: existingUser.firstname + ' ' + existingUser.lastname,
        }
        // Send the reset link to the user's email
        const emailSubject = 'Password Reset Successful - PMO Governance Managment Order Portal';
        const emailText = `Click on the following link to reset your password: ${resetLink}`;
        const attachment = this.emailService.makeTemplates('passwordLink', dataForEmailTemplate);
        if (attachment) {
            await this.emailService.sendEmail(emailSubject, data.email, emailText, attachment);
        }

        return new ApiResponse(true, 'Password reset email send successfully. Please check your email');
    }
    generateRandomCode(length: number): string {
        const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let code = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            code += charset[randomIndex];
        }
        return code;
    }
}
