const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const EmailTemplates = require('email-templates');
const path = require('path');

const { NO_REPLY_EMAIL, NO_REPLY_EMAIL_PASSWORD, FRONTEND_URL } = require('../config');
const emailTemplates = require('../email-template');
const ApiError = require('../error/ApiError');



module.exports = {
  sendEmail: async (receiverMail, emailAction, locals = {}) => {
    const transporter = nodemailer.createTransport({
      from: 'No reply',
      service: 'gmail',
      auth: {
        user: NO_REPLY_EMAIL,
        pass: NO_REPLY_EMAIL_PASSWORD
      }
    });

    const templateInfo = emailTemplates[emailAction];

    if (!templateInfo?.subject || !templateInfo.templateName) {
      throw new ApiError('Wrong template', 500);
    }

    // const options = {
    //   viewEngine: {
    //     defaultLayout: 'main',
    //     layoutsDir: path.join(process.cwd(), 'email-templates', 'layouts'),
    //     partialsDir: path.join(process.cwd(), 'email-templates', 'partials'),
    //     extname: '.hbs',
    //   },
    //   extName: '.hbs',
    //   viewPath: path.join(process.cwd(), 'email-templates', 'views'),
    // }
    //
    // transporter.use('compile', hbs(options));
    // context.frontendURL = FRONTEND_URL;

    const templateRenderer = new EmailTemplates({
      views: {
        root: path.join(process.cwd(), 'email-templates')
      }
    });

    Object.assign(locals || {}, { frontendURL: 'google.com' });

    const html = await templateRenderer.render(templateInfo.templateName, locals);


    return transporter.sendMail({
      to: receiverMail,
      subject: templateInfo.subject,
      template: templateInfo.templateName,
      html,
    });
  }
};
