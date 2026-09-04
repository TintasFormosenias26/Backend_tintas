import jwt from "jsonwebtoken";
import ENV from "../../shared/config/configEnv";

export const generarJWT = (id: string, rol: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const payload = { id, rol };
    jwt.sign(payload, ENV.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: ENV.JWT_EXPIRES_IN_SECONDS,
      issuer: ENV.JWT_ISSUER,
      audience: ENV.JWT_AUDIENCE,
    }, (err, token) => {
      if (err) {
        reject(err);
      } else if (token) {
        resolve(token);
      } else {
        reject(new Error("JWT_SIGN_FAILED"));
      }
    });
  });
};
