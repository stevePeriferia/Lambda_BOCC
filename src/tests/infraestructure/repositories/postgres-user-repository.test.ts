import { Pool } from "pg";
import { PostgresUserRepository } from "../../../infraestructure/repositories/postgres-user-repository";
import { UserRepository } from "../../../app/ports/user-repository";

describe("PostgresUserRepository", () => {
  const input = { name: "Kevin", email: "kevin@example.com" };
  const row = { id: "uuid", ...input, created_at: "t" };

  function makeRepo(rowsByCall: Record<string, unknown>[][]) {
    const query = jest.fn();
    let i = 0;
    query.mockImplementation(() => {
      const rows = rowsByCall[i] !== undefined ? rowsByCall[i] : rowsByCall[rowsByCall.length - 1];
      i += 1;
      return Promise.resolve({ rows });
    });
    const repo = new PostgresUserRepository({ query } as unknown as Pool);
    return { repo, query };
  }

  it("create inserta y devuelve la fila", async () => {
    const { repo, query } = makeRepo([[row]]);
    const out = await repo.create(input);
    expect(out).toEqual(row);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO users"),
      [input.name, input.email]
    );
  });

  it("findById devuelve null si no hay filas", async () => {
    const { repo } = makeRepo([[]]);
    await expect(repo.findById("x")).resolves.toBeNull();
  });

  it("list devuelve todas las filas", async () => {
    const { repo } = makeRepo([[row, row]]);
    await expect(repo.list()).resolves.toEqual([row, row]);
  });

  it("update devuelve null si no hubo coincidencia", async () => {
    const { repo } = makeRepo([[]]);
    await expect(repo.update("id", input)).resolves.toBeNull();
  });

  it("delete devuelve false si no hubo fila borrada", async () => {
    const { repo } = makeRepo([[]]);
    await expect(repo.delete("id")).resolves.toBe(false);
  });

  it("delete devuelve true si hubo borrado", async () => {
    const { repo } = makeRepo([[{ id: "1" }]]);
    await expect(repo.delete("1")).resolves.toBe(true);
  });

  it("implementa la interfaz UserRepository", () => {
    const { repo } = makeRepo([[]]);
    const methods: (keyof UserRepository)[] = ["create", "findById", "list", "update", "delete"];
    for (const method of methods) {
      expect(typeof repo[method]).toBe("function");
    }
  });
});
