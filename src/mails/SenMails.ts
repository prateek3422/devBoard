import nodemailer from "nodemailer";
import Mailgen from "mailgen";

interface Imail{
    email:string
    subject:string
    MailgenContent:any
}
const sendEmail = async ({email, subject,MailgenContent}:Imail) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "DevBoard",
      link: "http://localhost:5173/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  var emailBody = mailGenerator.generate(MailgenContent);
  var emailText = mailGenerator.generatePlaintext(MailgenContent);

  

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const EmailOption = {
    from: `DevBoard ${process.env.EMAIL_USER}`, // sender address
    to:email, // list of receivers
    subject:subject, // Subject line
    text: emailText, // plain text body
    html: emailBody, // html body
  };

  try {
    await transporter.sendMail(EmailOption);
  } catch (error) {
    ("Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file");
    console.log(error);
  }

};


const SendEmailVerification = (username:string, verifyotp:number) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      dictionary: {
        OTP:verifyotp
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};


const forgotPassword = (username:string, verifyotp:number) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our app! We're very excited to have you on board.",
      dictionary: {
        otp : verifyotp
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  }
}
export { sendEmail , SendEmailVerification, forgotPassword}