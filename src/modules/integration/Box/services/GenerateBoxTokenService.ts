import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import querystring from 'querystring';
import { AppError } from '../../../../shared/utils/AppError';
import { StatusCode } from '../../../../shared/utils/StatusCode';

type boxTokenType = {
  access_token: string;
  expires_in: number;
  restricted_to: any[];
  token_type: string;
};

export class GenerateBoxTokenService {
  BOX_AUTH_URL = 'https://api.box.com/oauth2/token';

  public async execute(): Promise<boxTokenType> {
    try {
      const assertion = await this.generateAssertion();
      const playloadBoxRequest = querystring.stringify({
        scope: 'root_readwrite',
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: assertion,
        client_id: process.env.BOX_CLIENT_ID,
        client_secret: process.env.BOX_CLIENT_SECRET,
      });

      const response = await axios.post<boxTokenType>(
        this.BOX_AUTH_URL,
        playloadBoxRequest,
      );

      return response.data;
    } catch (error: any) {
      console.log(
        '[integration:box:GenerateBoxTokenService] erro ao gerar token, error: ',
        error,
      );
      throw new AppError(
        StatusCode.INTERNAL_SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        error.message,
      );
    }
  }

  private async generateAssertion(): Promise<string> {
    const key: any = {
      key: (process.env.BOX_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
      passphrase: process.env.BOX_PASSPHRASE,
    };

    const claims: any = {
      iss: process.env.BOX_CLIENT_ID,
      sub: process.env.BOX_ENTERPRISE_ID,
      box_sub_type: 'enterprise',
      aud: this.BOX_AUTH_URL,
      jti: crypto.randomBytes(64).toString('hex'),
      exp: Math.floor(Date.now() / 1000) + 45,
    };

    const headers: any = {
      algorithm: 'RS512',
      keyid: process.env.BOX_PUBLIC_KEY_ID,
    };

    try {
      return jwt.sign(claims, key, headers);
    } catch (error) {
      throw error;
    }
  }
}
