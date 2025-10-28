const nodeMailer = require("nodemailer");
const asynchandler = require("express-async-handler");
exports.sendEmail = asynchandler(async (to, subject, html) => {
  //1-Create email transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //2-Define mail options
  const mailOptions = {
    from: `"Clinic App" <Clinic@business.com>`,
    to,
    subject,
    html,
  };

  //3-Email sending
  await transporter.sendMail(mailOptions);
});
