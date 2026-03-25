import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

let cachedConfig: DbConfig | undefined;

async function getParameter(ssm: SSMClient, name: string): Promise<string> {
  const res = await ssm.send(new GetParameterCommand({ Name: name }));
  const value = res.Parameter?.Value;
  if (!value) throw new Error(`Parameter Store: ${name} sin valor`);
  return value;
}

async function getSecret(
  sm: SecretsManagerClient,
  secretArn: string,
): Promise<Record<string, string>> {
  const res = await sm.send(
    new GetSecretValueCommand({ SecretId: secretArn }),
  );
  if (!res.SecretString) throw new Error("Secrets Manager: secreto vacio");
  return JSON.parse(res.SecretString);
}

export async function loadDbConfig(): Promise<DbConfig> {
  if (cachedConfig) return cachedConfig;

  const region = process.env.ENV_REGION || "us-east-1";
  const arnSecret = process.env.ARN_SECRET;
  const port = Number(process.env.ACO_DB_PORT || 5432);

  if (!arnSecret) throw new Error("Variable de entorno ARN_SECRET no definida");

  const ssm = new SSMClient({ region });
  const sm = new SecretsManagerClient({ region });

  const [host, database, secret] = await Promise.all([
    getParameter(ssm, "/ACO/BOCC/dbHost"),
    getParameter(ssm, "/ACO/BOCC/dbName"),
    getSecret(sm, arnSecret),
  ]);

  const user = secret.acoDbUser;
  const password = secret.acoDbPass;

  if (!user || !password) {
    throw new Error("Secreto no contiene acoDbUser o acoDbPass");
  }

  cachedConfig = { host, port, database, user, password };
  return cachedConfig;
}
