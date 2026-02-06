import dotenv from "dotenv";
import mail from "nodemailer";

dotenv.config();

const transporter = mail.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
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
    console.log("Email sent: " + info.response);
    return info.response;
  } catch (error) {
    console.log("Error sending mail: ", error);
    throw new Error("Error sending mail");
  }
};
