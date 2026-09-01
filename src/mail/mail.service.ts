import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT') || 587),
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER') || undefined,
          pass: this.config.get<string>('SMTP_PASS') || undefined,
        },
      });
    }
  }

  isConfigured() {
    return Boolean(this.transporter);
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const from =
      this.config.get<string>('MAIL_FROM') ||
      this.config.get<string>('SMTP_USER') ||
      'noreply@divyaangdisha.com';

    const subject = 'Reset your Divyaang Disha password';
    const text = [
      'You requested a password reset for your Divyaang Disha admin account.',
      '',
      `Open this link to set a new password (expires in 1 hour):`,
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n');

    const html = `
      <p>You requested a password reset for your Divyaang Disha admin account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `;

    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured — password reset link for ${to}: ${resetUrl}`,
      );
      return { sent: false as const };
    }

    await this.transporter.sendMail({ from, to, subject, text, html });
    this.logger.log(`Password reset email sent to ${to}`);
    return { sent: true as const };
  }
}
