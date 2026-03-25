import { buildRouter, UseCases } from "../../../infraestructure/http/router";
import { ApiGatewayEvent, ApiGatewayResponse } from "../../../shared/types";

function parseBody(res: ApiGatewayResponse): Record<string, unknown> {
  return JSON.parse(res.body);
}

function mockUseCases(overrides: Partial<UseCases> = {}): UseCases {
  return {
    listUsers: jest.fn(),
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    ...overrides,
  };
}

describe("buildRouter", () => {
  const user = { id: "1", name: "Kevin", email: "kevin@example.com", created_at: "t" };

  it("GET sin id lista usuarios", async () => {
    const listUsers = jest.fn().mockResolvedValue([user]);
    const router = buildRouter(mockUseCases({ listUsers }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "GET" } },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(200);
    expect(parseBody(res)).toEqual([user]);
    expect(listUsers).toHaveBeenCalled();
  });

  it("GET con id obtiene un usuario", async () => {
    const getUser = jest.fn().mockResolvedValue(user);
    const router = buildRouter(mockUseCases({ getUser }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "GET" } },
      pathParameters: { id: "1" },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(200);
    expect(parseBody(res)).toEqual(user);
    expect(getUser).toHaveBeenCalledWith("1");
  });

  it("GET con id devuelve 404 si no existe", async () => {
    const router = buildRouter(mockUseCases({ getUser: jest.fn().mockResolvedValue(null) }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "GET" } },
      pathParameters: { id: "abc" },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(404);
  });

  it("POST crea usuario con body JSON", async () => {
    const createUser = jest.fn().mockResolvedValue(user);
    const router = buildRouter(mockUseCases({ createUser }));
    const payload = { name: "Kevin", email: "kevin@example.com" };
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify(payload),
    };
    const res = await router(event);
    expect(res.statusCode).toBe(201);
    expect(createUser).toHaveBeenCalledWith(payload);
  });

  it("PUT con id en queryStringParameters actualiza usuario", async () => {
    const updateUser = jest.fn().mockResolvedValue(user);
    const router = buildRouter(mockUseCases({ updateUser }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "PUT" } },
      queryStringParameters: { id: "1" },
      body: JSON.stringify({ name: "Kevin", email: "kevin@example.com" }),
    };
    const res = await router(event);
    expect(res.statusCode).toBe(200);
    expect(updateUser).toHaveBeenCalledWith("1", expect.any(Object));
  });

  it("PUT con id en pathParameters actualiza usuario", async () => {
    const updateUser = jest.fn().mockResolvedValue(user);
    const router = buildRouter(mockUseCases({ updateUser }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "PUT" } },
      pathParameters: { id: "2" },
      body: JSON.stringify({ name: "Kevin", email: "kevin@example.com" }),
    };
    const res = await router(event);
    expect(res.statusCode).toBe(200);
    expect(updateUser).toHaveBeenCalledWith("2", expect.any(Object));
  });

  it("PUT sin id devuelve 400", async () => {
    const router = buildRouter(mockUseCases());
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "PUT" } },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(400);
    expect(parseBody(res).message).toBe("id es requerido");
  });

  it("DELETE con id en queryStringParameters devuelve 204", async () => {
    const deleteUser = jest.fn().mockResolvedValue(true);
    const router = buildRouter(mockUseCases({ deleteUser }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "DELETE" } },
      queryStringParameters: { id: "1" },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(204);
  });

  it("DELETE con id en pathParameters devuelve 204", async () => {
    const deleteUser = jest.fn().mockResolvedValue(true);
    const router = buildRouter(mockUseCases({ deleteUser }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "DELETE" } },
      pathParameters: { id: "1" },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(204);
  });

  it("DELETE sin id devuelve 400", async () => {
    const router = buildRouter(mockUseCases());
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "DELETE" } },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(400);
    expect(parseBody(res).message).toBe("id es requerido");
  });

  it("metodo no soportado -> 405", async () => {
    const router = buildRouter(mockUseCases());
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "PATCH" } },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(405);
  });

  it("JSON invalido en body -> 400", async () => {
    const router = buildRouter(mockUseCases());
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "POST" } },
      body: "{",
    };
    const res = await router(event);
    expect(res.statusCode).toBe(400);
    expect(parseBody(res).message).toMatch(/JSON invalido/);
  });

  it("error no controlado del caso de uso -> 500", async () => {
    const listUsers = jest.fn().mockRejectedValue(new Error("fallo db"));
    const router = buildRouter(mockUseCases({ listUsers }));
    const event: ApiGatewayEvent = {
      requestContext: { http: { method: "GET" } },
    };
    const res = await router(event);
    expect(res.statusCode).toBe(500);
    expect(parseBody(res).message).toBe("Error interno");
  });
});
