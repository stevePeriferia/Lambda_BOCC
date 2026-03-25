import { User } from "../../domain/user";
import { json } from "../../shared/http-response";
import { AppError } from "../../shared/app-error";
import { ApiGatewayEvent, ApiGatewayResponse } from "../../shared/types";

export interface UseCases {
  createUser: (payload: unknown) => Promise<User>;
  getUser: (id: string) => Promise<User | null>;
  listUsers: () => Promise<User[]>;
  updateUser: (id: string, payload: unknown) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
}

function parseBody(event: ApiGatewayEvent): unknown {
  if (!event.body) return {};
  try {
    return typeof event.body === "string"
      ? JSON.parse(event.body)
      : event.body;
  } catch {
    throw new AppError(400, "JSON invalido en body");
  }
}

function handleError(error: unknown): ApiGatewayResponse {
  if (error instanceof AppError) {
    return json(error.statusCode, { message: error.message });
  }
  const detail = error instanceof Error ? error.message : String(error);
  return json(500, { message: "Error interno", detail });
}

/**
 * Adaptador HTTP: decide el caso de uso según método HTTP + presencia de id.
 * No valida paths para evitar crear recursos adicionales en API Gateway.
 */
export function buildRouter(useCases: UseCases) {
  return async function router(
    event: ApiGatewayEvent,
  ): Promise<ApiGatewayResponse> {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const id = event.queryStringParameters?.id || event.pathParameters?.id;

    try {
      switch (method) {
        case "GET": {
          if (id) {
            const user = await useCases.getUser(id);
            if (!user) return json(404, { message: "No encontrado" });
            return json(200, user);
          }
          const users = await useCases.listUsers();
          return json(200, users);
        }
        case "POST": {
          const body = parseBody(event);
          const created = await useCases.createUser(body);
          return json(201, created);
        }
        case "PUT": {
          if (!id) return json(400, { message: "id es requerido" });
          const body = parseBody(event);
          const updated = await useCases.updateUser(id, body);
          if (!updated) return json(404, { message: "No encontrado" });
          return json(200, updated);
        }
        case "DELETE": {
          if (!id) return json(400, { message: "id es requerido" });
          const deleted = await useCases.deleteUser(id);
          if (!deleted) return json(404, { message: "No encontrado" });
          return json(204, {});
        }
        default:
          return json(405, { message: "Metodo no soportado" });
      }
    } catch (error) {
      return handleError(error);
    }
  };
}
