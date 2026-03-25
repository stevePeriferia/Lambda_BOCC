import { Pool } from "pg";
import { DbConfig } from "../config/aws-config";

let poolInstance: Pool | undefined;

/** Pool singleton reutilizable entre invocaciones calientes de Lambda. */
export function getPool(config: DbConfig): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }

  return poolInstance;
}
