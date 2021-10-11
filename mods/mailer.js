const nodemailer = require('nodemailer');

module.exports = () => {
  const config = {
    host: 'smtp.yandex.ru',
    email: 'automail@camra.ru',
    password: 'heidi879'
  };

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.email,
      pass: config.password
    }
  });

  const send = ({ to, from = `"Yehat Mail" <${config.email}>`, subject = "- no subject -", html }) => new Promise((resolve, reject) => {
    transporter.sendMail({ from, to, subject, html }, (error, info) => {
      if (error) {
        console.log(error)
        return reject(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      resolve();
    });
  });

  return { send };
};