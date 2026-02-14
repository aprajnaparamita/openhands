import { injectable } from 'tsyringe';
import { HttpException } from '../exceptions/httpException';

@injectable()
export class ContentSecurityService {
  /**
   * Scan text for PII (Personally Identifiable Information)
   * Currently detects Emails and Phone numbers.
   */
  checkPII(text: string): void {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;

    if (emailRegex.test(text) || phoneRegex.test(text)) {
      throw new HttpException(400, 'Content contains PII (Email or Phone). Please remove it.');
    }
  }

  /**
   * Scan text for Profanity
   * Simple list-based filter.
   */
  checkProfanity(text: string): void {
    const badWords = ['badword', 'offensive']; // Extend this list or use a library
    const lowerText = text.toLowerCase();
    
    if (badWords.some(word => lowerText.includes(word))) {
      throw new HttpException(400, 'Content contains inappropriate language.');
    }
  }

  /**
   * Scan image for NSFW content (Mock NudeNet)
   */
  async checkImageSafety(imageUrl: string): Promise<void> {
    // Mock implementation: reject images with "unsafe" in the URL
    if (imageUrl.includes('unsafe')) {
      throw new HttpException(400, 'Image detected as NSFW/Unsafe.');
    }
    // Real implementation would call NudeNet API or similar service
  }

  /**
   * Scan file for viruses (Mock ClamAV)
   */
  async scanFile(fileBuffer: Buffer): Promise<void> {
    // Mock implementation: check for EICAR signature or just random fail for testing
    // EICAR test string: X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
    const eicar = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
    
    if (fileBuffer.toString().includes(eicar)) {
      throw new HttpException(400, 'File contains a virus (EICAR Test Signature).');
    }
    
    // In a real scenario, stream file to ClamAV daemon
  }
}
