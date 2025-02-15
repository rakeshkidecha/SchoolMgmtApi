const nodemailer = require('nodemailer');

module.exports = async (email,sub,content)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: "workrakesh04@gmail.com",
          pass: "xgmcrpdyhkkhnazp",
        },
    });


    const info = await transporter.sendMail({
        from: 'workrakesh04@gmail.com', // sender address
        to: email, // list of receivers
        subject: sub, // Subject line
        html: content, // html body
    });

    return info;
}