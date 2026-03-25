import { validateUserInput } from "../../domain/user";

describe("validateUserInput", () => {
  it("devuelve campos normalizados cuando el payload es valido", () => {
    expect(
      validateUserInput({
        name: "  Kevin  ",
        email: " kevin@example.com ",
      })
    ).toEqual({ name: "Kevin", email: "kevin@example.com" });
  });

  it("lanza si body no es objeto", () => {
    expect(() => validateUserInput(null)).toThrow("Body invalido");
  });

  it("exige name y email", () => {
    expect(() => validateUserInput({ name: "", email: "a@b.com" })).toThrow(
      "name es requerido"
    );
    expect(() => validateUserInput({ name: "x", email: "" })).toThrow(
      "email es requerido"
    );
  });

  it("valida longitud maxima de name", () => {
    expect(() =>
      validateUserInput({ name: "x".repeat(151), email: "a@b.com" })
    ).toThrow("name excede 150 caracteres");
  });

  it("valida formato de email", () => {
    expect(() =>
      validateUserInput({ name: "Kevin", email: "no-valido" })
    ).toThrow("email no tiene un formato valido");
  });
});
