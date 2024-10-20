const nodemailer = require('nodemailer');
const { EMAIL_FROM, EMAIL_HOST, EMAIL_PASS, EMAIL_PORT } = require('../constants');
const { MailtrapClient } = require("mailtrap");



  //  SEND  VIA  NODE MAILER
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,

   
  };

  return transport.sendMail(mailOptions);
};





const ENDPOINT = "https://send.api.mailtrap.io/";

const client = new MailtrapClient({ endpoint: ENDPOINT, token: EMAIL_PASS });

const sender = {
  email: EMAIL_FROM,
  name: "munaPay",
};
const recipients = [
  {
    email: "kabuguabdul2@gmail.com",
  }
];



    const  sendMail2  =  async (to, templateId, variables)  =>  {
      client
  .send({
    from: sender,
    to: to,
    template_uuid: templateId,
    template_variables: variables
     
    
  })
  .then(console.log, console.error).catch((error)  =>  console.log(error));
      
    }

module.exports = {sendEmail, sendMail2};
