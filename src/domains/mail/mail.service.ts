import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Thin SMTP wrapper.
 *
 * Required environment variables:
 *   SMTP_HOST       — e.g. smtp.sendgrid.net
 *   SMTP_PORT       — e.g. 587
 *   SMTP_USER       — e.g. apikey (SendGrid) or SMTP username
 *   SMTP_PASS       — SMTP password / API key
 *   SMTP_FROM       — "FixGuide <noreply@fixguide.com>"
 *
 * When SMTP_HOST is not set, emails are logged to console only (development).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: string;

  constructor() {
    this.from = process.env['SMTP_FROM'] ?? 'FixGuide <noreply@fixguide.com>';

    const host = process.env['SMTP_HOST'];
    if (!host) {
      this.transporter = null;
      this.logger.warn('SMTP_HOST not configured — emails will be logged to console only');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env['SMTP_PORT'] ?? '587', 10),
      secure: process.env['SMTP_PORT'] === '465',
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    });
  }

  async send(opts: SendOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[DEV EMAIL] To: ${opts.to} | Subject: ${opts.subject}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<void> {
    await this.send({
      to,
      subject: 'Verify your FixGuide email',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
          <h2 style="color:#0f172a;margin:0 0 8px;">Welcome to FixGuide, ${name}!</h2>
          <p style="color:#475569;font-size:15px;margin:0 0 24px;">
            Click the button below to verify your email and activate your account.
          </p>
          <a href="${verifyUrl}"
             style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
            Verify email
          </a>
          <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">
            This link expires in 24 hours. If you didn't create an account, ignore this email.
          </p>
        </div>
      `,
    });
  }

  async sendMechanicWelcomeEmail(to: string, name: string, verifyUrl: string): Promise<void> {
    await this.send({
      to,
      subject: 'Verify your FixGuide mechanic account',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
          <h2 style="color:#0f172a;margin:0 0 8px;">Welcome to FixGuide, ${name}!</h2>
          <p style="color:#475569;font-size:15px;margin:0 0 8px;">
            Your mechanic profile has been created. Verify your email to activate your listing.
          </p>
          <p style="color:#475569;font-size:15px;margin:0 0 24px;">
            Once verified, your profile will appear in driver searches matching your skills.
          </p>
          <a href="${verifyUrl}"
             style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
            Verify email & activate profile
          </a>
          <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">
            This link expires in 24 hours.
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    await this.send({
      to,
      subject: 'Reset your FixGuide password',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
          <h2 style="color:#0f172a;margin:0 0 8px;">Reset your password</h2>
          <p style="color:#475569;font-size:15px;margin:0 0 24px;">
            Hi ${name}, click the button below to set a new password for your FixGuide account.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
            Reset password
          </a>
          <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">
            This link expires in 1 hour. If you didn't request a reset, ignore this email.
          </p>
        </div>
      `,
    });
  }
}
