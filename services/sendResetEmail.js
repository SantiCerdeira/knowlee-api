import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendResetEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "knowleecontact@gmail.com",
      to: email,
      subject: "Restablecer contraseña",
      html: `<p>Para restablecer tu contraseña de Knowlee, clickeá <a href="https://knowlee-fw4c.onrender.com/cambiar-contraseña/${encodeURIComponent(
        resetToken
      )}">acá</a>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${email}`);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
    throw new Error("Error al enviar el correo.");
  }
};

export { sendResetEmail };
