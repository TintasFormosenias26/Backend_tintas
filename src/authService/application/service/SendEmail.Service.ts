import { Resend } from "resend";
import { CreateTokenPrisma, FindTokenPrisma } from "../../../Token/MongoRepository/TokenMongo";
import { UserFindByEmail } from "../../../userService/infrastructure/userRespositoryMongo";
import { UpdateUSer } from "../../../userService/application/service/UpdateUser.Service";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const findEmail = new UserFindByEmail();

export const sendEmail = async (email: string) => {
    const user = await findEmail.findByEmail(email);

    if (!user) {
        return null
    }

    const newToken = new CreateTokenPrisma();
    const token = await newToken.createToken(email);

    await resend.emails.send({
        from: "Formosa Tintas <onboarding@resend.dev>",
        to: email,
        subject: "Recuperación de contraseña",
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Recuperación de contraseña</h2>

      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>

      <p>Usa el siguiente código de verificación para continuar con el proceso:</p>

      <div style="
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 2px;
        padding: 10px 15px;
        display: inline-block;
        background: #f4f4f4;
        border-radius: 6px;
        margin: 10px 0;
      ">
        ${token.token}
      </div>

      <p>Este código es válido por <strong>1 minuto</strong>. Si no solicitaste este cambio, puedes ignorar este correo.</p>

      <hr />

      <p style="font-size: 12px; color: #666;">
        Formosa Tintas no compartirá este código con nadie.
      </p>
    </div>
  `,
    });

    console.log("Email sent");
};


