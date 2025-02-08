import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });
const config = {
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
    acccessTokenExpiraryMS: +process.env.ACCESS_TOKEN_EXPIRY_S,
    refreshTokenExpiraryMS: +process.env.REFRESH_TOKEN_EXPIRY_S,
  },
  database: {
    client: process.env.DB_CLIENT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
};
export default config;
