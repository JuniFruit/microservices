import { getConfigTypeOrm } from "../config/typeorm";
import { DataSource } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { TokenEntity } from "../token/token.entity";

const postgresDB = new DataSource(getConfigTypeOrm());

postgresDB
  .initialize()
  .then(() => {
    console.log("success");
  })
  .catch(e => console.log(e));

export const userModel = postgresDB.getRepository(UserEntity);
export const tokenModel = postgresDB.getRepository(TokenEntity);
