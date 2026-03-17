/**
 * Jest manual mock for nodemailer.
 * Prevents TS2307 errors when nodemailer is not installed in local node_modules.
 * The real MailService is always mocked in unit/E2E tests anyway.
 */

const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  verify: jest.fn().mockResolvedValue(true),
};

const nodemailer = {
  createTransport: jest.fn().mockReturnValue(mockTransporter),
  createTestAccount: jest.fn().mockResolvedValue({}),
  getTestMessageUrl: jest.fn().mockReturnValue('https://example.com/message'),
};

export = nodemailer;
