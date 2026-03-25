import { ApiGatewayResponse } from "./types";

/** Respuesta en formato que espera API Gateway (proxy Lambda integration). */
export function json(statusCode: number, body: unknown): ApiGatewayResponse {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}
