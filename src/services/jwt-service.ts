
import { UserProfile } from '@loopback/security';
import { promisify } from 'util';
import { HttpErrors } from '@loopback/rest';
import { inject } from '@loopback/core';
import { TokenServiceBindings } from '../keys';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService {
    @inject(TokenServiceBindings.TOKEN_SECRET)
    public readonly jwtSecret: string;

    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    public readonly jwtExpiresIn: string;

    async generateToken(userprofile: UserProfile): Promise<string> {
        if (!userprofile) {
            throw new HttpErrors.Unauthorized('Error while generating token: userprofile is null');
        }
        let token = '';
        try {
            token = await signAsync(userprofile, this.jwtSecret, {
                expiresIn: this.jwtExpiresIn
            })
        }
        catch (err) {
            throw new HttpErrors.Unauthorized(` error generating token ${err}`);
        }
        return token;
    }

    async verifyToken(token: string): Promise<UserProfile> {
        if (!token) {
            throw new HttpErrors.Unauthorized(
                `Error verifying Token': 'token is null'`,
            );
        }
        let userProfile: UserProfile;
        try {
            //decode user profile from token
            const decryptedToken = await verifyAsync(token, this.jwtSecret);
            //dont copy ist,exp,email
            userProfile = Object.assign(
                {
                    id: '', name: ''
                },
                {
                    id: decryptedToken.id, name: decryptedToken.name
                }
            );
        } catch (error) {
            throw new HttpErrors.Unauthorized(
                `Error Verifying Token :${error.message}`
            )
        }
        return userProfile;
    }
}