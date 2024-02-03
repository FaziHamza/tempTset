import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DB_CONFIG, SECRETS } from 'src/shared/config/global-db-config';

@Injectable()
export class TokenService {
  private readonly secretKey = SECRETS.secretKey; // Replace with your actual secret key

  generateToken(username: string, email: string): string {
    const payload = { username, email };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: '10h' });
    return token;
  }

  decodeToken(token: string): any | null {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      return decoded;
    } catch (error) {
      // Handle invalid or expired token
      console.error('Error decoding token:', error.message);
      return null;
    }
  }
}
