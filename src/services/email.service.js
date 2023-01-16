const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
exports.sendEmail = (details) => {
    try {    
        const fromEmail = details.data?.fromEmail ? details.data?.fromEmail : process.env.EMAIL_USERNAME
        let mailTransporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 250,
            secure: false,
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        const handlebarOptions = {
            viewEngine: {
                extName: ".handlebars",
                partialsDir: path.resolve(__dirname, `../view/${details.location}`),
                defaultLayout: false,
            },
            viewPath: path.resolve(__dirname, `../view/${details.location}`),
            extName: ".handlebars",
        };
        mailTransporter.use(
            "compile",
            hbs(handlebarOptions)
        );
        let mailDetails = {
            from: fromEmail,
            to: details.email,
            subject: details.data.sellerName ? sellerSubject : buyerSubject,
            template: details.template,
            context: {
                data: details?.data,
            }
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                console.log('Error Occurs: ', err);
            }
        });
    } catch (error) {
        console.log('error', error);
    }
}