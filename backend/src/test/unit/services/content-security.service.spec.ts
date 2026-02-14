import 'reflect-metadata';
import { ContentSecurityService } from '../../../services/content-security.service';
import { HttpException } from '../../../exceptions/httpException';

describe('ContentSecurityService', () => {
  let contentSecurityService: ContentSecurityService;

  beforeEach(() => {
    contentSecurityService = new ContentSecurityService();
  });

  describe('checkPII', () => {
    it('should pass for clean text', () => {
      expect(() => contentSecurityService.checkPII('Hello world')).not.toThrow();
    });

    it('should throw for email', () => {
      expect(() => contentSecurityService.checkPII('Contact me at test@example.com')).toThrow(HttpException);
    });

    it('should throw for phone number', () => {
      expect(() => contentSecurityService.checkPII('Call me at 123-456-7890')).toThrow(HttpException);
    });
  });

  describe('checkProfanity', () => {
    it('should pass for clean text', () => {
      expect(() => contentSecurityService.checkProfanity('Hello world')).not.toThrow();
    });

    it('should throw for bad words', () => {
      expect(() => contentSecurityService.checkProfanity('This is a badword')).toThrow(HttpException);
    });
  });

  describe('checkImageSafety', () => {
    it('should pass for safe url', async () => {
      await expect(contentSecurityService.checkImageSafety('https://example.com/image.jpg')).resolves.not.toThrow();
    });

    it('should throw for unsafe url', async () => {
      await expect(contentSecurityService.checkImageSafety('https://example.com/unsafe.jpg')).rejects.toThrow(HttpException);
    });
  });

  describe('scanFile', () => {
    it('should pass for clean file', async () => {
      const buffer = Buffer.from('Clean file content');
      await expect(contentSecurityService.scanFile(buffer)).resolves.not.toThrow();
    });

    it('should throw for EICAR signature', async () => {
      const eicar = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
      const buffer = Buffer.from(eicar);
      await expect(contentSecurityService.scanFile(buffer)).rejects.toThrow(HttpException);
    });
  });
});
