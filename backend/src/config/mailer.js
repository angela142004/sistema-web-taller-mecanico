import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: "2201010121@undc.edu.pe", // ⚠️ CAMBIA ESTO POR TU GMAIL
    pass: "aozb lhph imwu vaeo", // ⚠️ CAMBIA ESTO POR LA CONTRASEÑA DE APLICACIÓN (SIN ESPACIOS)
  },
});

transporter.verify().then(() => {
  console.log("📧 Listo para enviar correos");
});
