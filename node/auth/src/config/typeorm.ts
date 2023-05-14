import { DataSourceOptions } from "typeorm";
import { TokenEntity } from "../token/token.entity";
import { UserEntity } from "../user/user.entity";

const isProduction = process.env.NODE_ENV === "production";

export const getConfigTypeOrm = (): DataSourceOptions => {
  const baseConfig = {
    type: "postgres",
    synchronize: true,
    logging: false,
    entities: [TokenEntity, UserEntity],
  };
  if (!isProduction) {
    return {
      ...baseConfig,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    } as DataSourceOptions;
  }

  return {
    ...baseConfig,
    type: "postgres",
    url: process.env.DB_URL,
  };
};
