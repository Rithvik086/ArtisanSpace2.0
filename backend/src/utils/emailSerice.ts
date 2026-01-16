import dotenv from "dotenv";
import mail from "nodemailer";
import logger from "./logger.js";
import config from "../config/index.js";

dotenv.config();

const transporter = mail.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,
  socketTimeout: 60000,
});

export const sendMail = async (email: string, subject: string, msg: string) => {
  try {
    const mailOptions = {
      from: '"ArtisanSpace Team" <artisanspace09@gmail.com>',
      to: email,
      subject: subject,
      text: msg,
    };
    const info = await transporter.sendMail(mailOptions);
    logger.info(
      { response: info.response, to: email },
      "Email sent successfully"
    );
    return info.response;
  } catch (error) {
    logger.error(
      { error: (error as Error).message, to: email },
      "Error sending mail"
    );
    throw new Error("Error sending mail");
  }
};
