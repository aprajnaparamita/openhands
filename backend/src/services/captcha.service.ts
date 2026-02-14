import { injectable } from 'tsyringe';
import axios from 'axios';
import { HttpException } from '../exceptions/httpException';

@injectable()
export class CaptchaService {
  private secretKey = process.env.RECAPTCHA_SECRET_KEY || 'mock_secret_key';
  private verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

  async verifyToken(token: string): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production') {
      // Mock verification in dev
      return true;
    }

    if (!token) {
      throw new HttpException(400, 'CAPTCHA token is missing');
    }

    try {
      const response = await axios.post(
        `${this.verifyUrl}?secret=${this.secretKey}&response=${token}`
      );

      const { success, score } = response.data;

      if (!success) {
        return false;
      }

      // v3 score check (0.0 to 1.0)
      if (score !== undefined && score < 0.5) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('CAPTCHA verification failed:', error);
      // Fail open or closed depending on policy. Usually fail closed for security.
      return false;
    }
  }
}
