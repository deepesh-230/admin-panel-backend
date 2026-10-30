import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleName } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type OutboundMail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
        connectionTimeout: 20_000,
        greetingTimeout: 20_000,
        socketTimeout: 20_000,
      });
    }
  }

  isConfigured() {
    return Boolean(this.transporter);
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const subject = 'Reset your Divyaang Disha password';
    const text = [
      'You requested a password reset for your Divyaang Disha admin account.',
      '',
      'Open this link to set a new password (expires in 1 hour):',
      resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n');
    const safeUrl = escapeHtml(resetUrl);
    const html = `
      <p>You requested a password reset for your Divyaang Disha admin account.</p>
      <p><a href="${safeUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `;
    return this.deliver({ to, subject, text, html }, resetUrl);
  }

  /** Login, registration, and password-reset code. Valid for 10 minutes. */
  async sendOtp(to: string, otp: string) {
    console.log('sendOtp', to, otp);
    const subject = 'Your Divyaang Disha verification code';
    const text = [
      'Your Divyaang Disha verification code is:',
      '',
      otp,
      '',
      'It expires in 10 minutes. If you did not request this, you can ignore this email.',
    ].join('\n');
    const html = `
      <p>Your Divyaang Disha verification code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${escapeHtml(otp)}</p>
      <p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    `;
    return this.deliver({ to, subject, text, html });
  }

  /**
   * Sent when an application is approved or an admin changes the account role.
   * Includes where to sign in and the first steps for that role.
   */
  async sendRoleApproval(
    to: string,
    input: { name?: string | null; role: RoleName },
  ) {
    const guide = this.roleGuide(input.role);
    if (!guide) return { sent: false as const };

    const greeting = input.name?.trim()
      ? `Hello ${input.name.trim()},`
      : 'Hello,';
    const subject = `Your Divyaang Disha ${guide.label} role is approved`;
    const text = [
      greeting,
      '',
      `Your account has been approved as ${guide.label}.`,
      '',
      guide.url ? `Start here: ${guide.url}` : 'Start in the Divyaang Disha mobile app.',
      '',
      'Steps:',
      ...guide.steps.map((step, index) => `${index + 1}. ${step}`),
      '',
      'Sign in with this same email and your current password.',
    ].join('\n');

    const safeUrl = guide.url ? escapeHtml(guide.url) : '';
    const stepsHtml = guide.steps
      .map((step) => `<li>${escapeHtml(step)}</li>`)
      .join('');
    const html = `
      <p>${escapeHtml(greeting)}</p>
      <p>Your account has been approved as <strong>${escapeHtml(guide.label)}</strong>.</p>
      ${
        guide.url
          ? `<p>Start here: <a href="${safeUrl}">${safeUrl}</a></p>`
          : '<p>Start in the Divyaang Disha mobile app.</p>'
      }
      <p>Steps:</p>
      <ol>${stepsHtml}</ol>
      <p>Sign in with this same email and your current password.</p>
    `;
    return this.deliver({ to, subject, text, html }, guide.url);
  }

  private roleGuide(role: RoleName): {
    label: string;
    url?: string;
    steps: string[];
  } | null {
    // Skip localhost so applicants are not sent a developer-only dashboard link.
    const configured = (this.config.get<string>('ADMIN_URL') || '')
      .trim()
      .replace(/\/$/, '');
    const dashboard =
      configured && !/localhost|127\.0\.0\.1/i.test(configured)
        ? configured
        : undefined;

    if (role === RoleName.VOLUNTEER) {
      return {
        label: 'Volunteer',
        steps: [
          'Open the Divyaang Disha mobile app.',
          'Sign in with this email and your current password.',
          'Open the menu. Your account now has the volunteer role.',
          'Use the volunteer options in the menu to help people in your area.',
        ],
      };
    }

    const openDashboard = dashboard
      ? `Open the admin dashboard: ${dashboard}`
      : 'Open the Divyaang Disha admin dashboard.';

    if (role === RoleName.SERVICE_PROVIDER_ADMIN) {
      return {
        label: 'Service provider admin',
        url: dashboard,
        steps: [
          openDashboard,
          'Sign in with this email and your current password.',
          'Open Service providers and select the listing linked to your account.',
          'Update the services and contact details so people can find you.',
        ],
      };
    }

    if (role === RoleName.STATE_ADMIN) {
      return {
        label: 'State admin',
        url: dashboard,
        steps: [
          openDashboard,
          'Sign in with this email and your current password.',
          'You are signed out of the mobile app. State admin work is done on this dashboard.',
          'Review users, listings, and applications for your state.',
        ],
      };
    }

    if (role === RoleName.ADMIN) {
      return {
        label: 'Admin',
        url: dashboard,
        steps: [
          openDashboard,
          'Sign in with this email and your current password.',
          'You are signed out of the mobile app. Admin work is done on this dashboard.',
          'Use the dashboard to manage users, listings, and applications.',
        ],
      };
    }

    return null;
  }

  private async deliver(message: OutboundMail, logDetail?: string) {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured — ${message.subject} for ${message.to}${logDetail ? `: ${logDetail}` : ''}`,
      );
      return { sent: false as const };
    }

    const from =
      this.config.get<string>('MAIL_FROM') ||
      this.config.get<string>('SMTP_USER') ||
      'noreply@divyaangdisha.com';
    try {
      await this.transporter.sendMail({ from, ...message });
      this.logger.log(`${message.subject} email sent to ${message.to}`);
      return { sent: true as const };
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Mail send failed';
      this.logger.error(
        `Failed to send "${message.subject}" to ${message.to}: ${reason}`,
      );
      return { sent: false as const };
    }
  }
}
