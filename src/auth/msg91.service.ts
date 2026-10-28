import https from 'node:https';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Msg91Response = {
  type?: string;
  message?: string;
  request_id?: string;
};

@Injectable()
export class Msg91Service {
  private readonly logger = new Logger(Msg91Service.name);

  constructor(private config: ConfigService) {}

  /** MSG91 expects country code, no plus. 10-digit Indian numbers get 91. */
  toMobile(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
    if (digits.length >= 11 && digits.length <= 15) return digits;
    throw new BadRequestException(
      'A valid mobile number is required to send the OTP',
    );
  }

  mask(phone: string): string {
    const mobile = this.toMobile(phone);
    return `${'*'.repeat(Math.max(mobile.length - 4, 0))}${mobile.slice(-4)}`;
  }

  /**
   * The client template is a DLT SMS flow, not an MSG91 OTP widget.
   * The approved text is "##var1## is your OTP verification code. ...".
   */
  async send(phone: string, otp: string) {
    const mobile = this.toMobile(phone);
    const code = otp.replace(/\D/g, '');
    if (!/^\d{4}$/.test(code)) {
      throw new BadRequestException('Invalid OTP');
    }
    await this.request('/flow/', 'POST', {
      template_id: this.templateId(),
      short_url: '0',
      recipients: [{ mobiles: mobile, var1: code }],
    });
    return { phoneMasked: this.mask(phone) };
  }

  private templateId() {
    const id = this.config.get<string>('MSG91_OTP_TEMPLATE_ID')?.trim();
    if (!id) {
      throw new BadRequestException('SMS OTP is not configured');
    }
    return id;
  }

  private async request(
    path: string,
    method: 'GET' | 'POST',
    payload?: Record<string, unknown>,
  ) {
    const authkey = this.config.get<string>('MSG91_AUTH_KEY')?.trim();
    if (!authkey) {
      throw new BadRequestException('SMS OTP is not configured');
    }

    let status = 0;
    let body: Msg91Response = {};
    try {
      const result = await this.ipv4Request(path, method, authkey, payload);
      status = result.status;
      body = result.body;
    } catch (err) {
      this.logger.error(
        `MSG91 request failed: ${err instanceof Error ? err.message : 'network error'}`,
      );
      throw new BadRequestException('Could not send OTP. Try again.');
    }

    if (status < 200 || status >= 300 || body.type === 'error') {
      const message = body.message || 'OTP request failed';
      this.logger.warn(`MSG91 ${method} ${path.split('?')[0]} failed: ${message}`);
      throw new BadRequestException(message);
    }
  }

  /** MSG91 whitelist is IPv4. Node otherwise prefers IPv6, which is a different address. */
  private ipv4Request(
    path: string,
    method: 'GET' | 'POST',
    authkey: string,
    payload?: Record<string, unknown>,
  ): Promise<{ status: number; body: Msg91Response }> {
    const raw = payload ? JSON.stringify(payload) : undefined;
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'control.msg91.com',
          path: `/api/v5${path}`,
          method,
          family: 4,
          headers: {
            authkey,
            accept: 'application/json',
            ...(raw
              ? {
                  'content-type': 'application/json',
                  'content-length': Buffer.byteLength(raw),
                }
              : {}),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            let body: Msg91Response = {};
            try {
              body = JSON.parse(text) as Msg91Response;
            } catch {
              body = {};
            }
            resolve({ status: res.statusCode || 0, body });
          });
        },
      );
      req.on('error', reject);
      if (raw) req.write(raw);
      req.end();
    });
  }
}
