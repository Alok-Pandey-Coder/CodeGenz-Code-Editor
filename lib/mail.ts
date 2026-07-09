import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use host/port for custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password, not your real password
  },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};