import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.BUSSINESS_EMAIL,
    pass: process.env.APP_PASS,
  },
});

export const sendEmail = async (receiver, subject, mailBody) => {
  const mailOptions = {
    from: `"CareerNest" <${process.env.BUSSINESS_EMAIL}>`,
    to: receiver,
    subject: subject,
    html: mailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    return false;
  }
};
