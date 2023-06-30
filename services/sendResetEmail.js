import nodemailer from 'nodemailer';

const sendResetEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'knowleecontact@gmail.com',
          pass: 'proyectofinal',
        },
      });

    const mailOptions = {
      from: 'knowleecontact@gmail.com',
      to: email,
      subject: 'Restablecer contraseña',
      html: `<p>To reset your password, click <a href="http://example.com/reset?token=${resetToken}">here</a>.</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${email}`);
  } catch (error) {
    throw new Error('Error al enviar el correo.');
  }
};

export {
    sendResetEmail,
}
