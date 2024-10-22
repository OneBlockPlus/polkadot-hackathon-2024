import { DataSource } from "typeorm";

import { config } from "../config";

import { Drip } from "./entity/Drip";
import { migrations } from "./migration/migrations";

export const AppDataSource = ((): DataSource => {
  const dbAdapter = config.Get("DB_ADAPTER");
  if (dbAdapter == "sqlite") {
    return new DataSource({
      type: "sqlite",
      database: config.Get("DB_DATABASE"),
      synchronize: true,
      logging: ["error", "warn"],
      entities: [Drip],
      migrations,
      subscribers: [],
    });
  } else if (dbAdapter == "postgres") {
    return new DataSource({
      type: "postgres",
      host: config.Get("DB_HOST"),
      port: config.Get("DB_PORT"),
      username: config.Get("DB_USERNAME"),
      password: config.Get("DB_PASSWORD"),
      database: config.Get("DB_DATABASE"),
      synchronize: false,
      logging: ["error", "warn"],
      entities: [Drip],
      subscribers: [],
      migrations,
    });
  } else {
    throw new Error(`⭕ Unsupported database adapter. Check the DB_ADAPTER variable.`);
  }
})();
