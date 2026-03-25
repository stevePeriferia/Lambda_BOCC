import { loadDbConfig } from "./infraestructure/config/aws-config";
import { getPool } from "./infraestructure/db/postgres-pool";
import { PostgresUserRepository } from "./infraestructure/repositories/postgres-user-repository";
import { buildCreateUser } from "./app/use-cases/create-user";
import { buildGetUser } from "./app/use-cases/get-user";
import { buildListUsers } from "./app/use-cases/list-users";
import { buildUpdateUser } from "./app/use-cases/update-user";
import { buildDeleteUser } from "./app/use-cases/delete-user";
import { buildRouter } from "./infraestructure/http/router";
import { ApiGatewayEvent, ApiGatewayResponse } from "./shared/types";
import { json } from "./shared/http-response";

let routerInstance: ((event: ApiGatewayEvent) => Promise<ApiGatewayResponse>) | undefined;

async function initRouter() {
  if (routerInstance) return routerInstance;

  const config = await loadDbConfig();
  const pool = getPool(config);
  const userRepository = new PostgresUserRepository(pool);

  const useCases = {
    createUser: buildCreateUser(userRepository),
    getUser: buildGetUser(userRepository),
    listUsers: buildListUsers(userRepository),
    updateUser: buildUpdateUser(userRepository),
    deleteUser: buildDeleteUser(userRepository),
  };

  routerInstance = buildRouter(useCases);
  return routerInstance;
}

export async function handler(event: ApiGatewayEvent): Promise<ApiGatewayResponse> {
  try {
    const router = await initRouter();
    return router(event);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return json(500, { message: "Error de inicializacion", detail });
  }
}
