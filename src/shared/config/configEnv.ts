import * as dotenv from "dotenv";
dotenv.config();

interface Env {
  PORT: number;
  CLOUD_NAME: string | undefined;
  API_KEY: string | undefined;
  API_SECRET: string | undefined;
  JWT_SECRET: string | undefined;
  API_RENDER: string | undefined;
}

const ENV: Env = {
  PORT: Number(process.env.PORT) || 3000,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  API_RENDER: process.env.API_RENDER
};

export default ENV;
