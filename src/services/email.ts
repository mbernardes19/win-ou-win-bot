import nodemailer from 'nodemailer';
import path from 'path';
import { log } from '../logger';

const transporter = nodemailer.createTransport({
    // host: process.env.SERVIDOR_SMTP,
    // port: 587,
    // secure: false,
    service: "Outlook365",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD_EMAIL
    }
})

interface EmailOptions {
    from: string,
    to: string,
    subject: string,
    text: string,
    attachments: any[]
}

const sendEmail = async (options: EmailOptions) => {
    const {from, to, subject, text, attachments} = options
    try {
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            attachments
        })
        log(info)
    } catch (err) {
        throw err
    }
}

const sendReportToEmail = async () => {
    try {
        await sendEmail({
            from: process.env.USER_EMAIL,
            to: process.env.TO_EMAIL,
            subject: 'CSV com todos os usuários atualizado!',
            text: 'Segue um CSV com a sua base de usuários atual',
            attachments: [{path: path.join(__dirname, '..', '..', 'reports', 'usuarios.csv')}]
        })
    } catch (err) {
        log(`ERRO AO ENVIAR ARQUIVO CSV POR EMAIL: ${JSON.stringify(err)}`)
    }
}

export { sendReportToEmail }
