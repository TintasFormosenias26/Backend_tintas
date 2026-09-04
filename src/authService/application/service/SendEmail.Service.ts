import { Resend } from "resend";
import { PrismaResetTokenStore } from "../../../Token/MongoRepository/TokenMongo";
import { UserFindByEmail } from "../../../userService/infrastructure/userRespositoryMongo";
import ENV from "../../../shared/config/configEnv";

const resend = new Resend(ENV.API_RENDER || "");

const findEmail = new UserFindByEmail();

export const sendEmail = async (email: string) => {
  const user = await findEmail.findByEmail(email);

  if (!user) {
    return;
  }

  const tokenStore = new PrismaResetTokenStore();
  const token = await tokenStore.createToken(email);

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
        ${token}
      </div>

      <p>Este código tiene una validez limitada. Si no solicitaste este cambio, puedes ignorar este correo.</p>

      <hr />

      <p style="font-size: 12px; color: #666;">
        Formosa Tintas no compartirá este código con nadie.
      </p>
    </div>
  `,
  });

};


