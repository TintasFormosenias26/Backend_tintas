import * as dotenv from "dotenv";
dotenv.config();

interface Env {
  PORT: number;
  NODE_ENV: string | undefined;
  CLOUD_NAME: string | undefined;
  API_KEY: string | undefined;
  API_SECRET: string | undefined;
  JWT_SECRET: string | undefined;
  API_RENDER: string | undefined;
  SWAGGER_USER: string | undefined;
  SWAGGER_PASSWORD: string | undefined;
}

const ENV: Env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  API_RENDER: process.env.API_RENDER,
  SWAGGER_USER: process.env.SWAGGER_USER,
  SWAGGER_PASSWORD: process.env.SWAGGER_PASSWORD
};

export default ENV;
