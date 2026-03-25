import { AppError } from "../shared/app-error";

export interface UserInput {
  name: string;
  email: string;
}

export interface User extends UserInput {
  id: string;
  created_at: string;
}

export function validateUserInput(payload: unknown): UserInput {
  if (!payload || typeof payload !== "object") {
    throw new AppError(400, "Body invalido");
  }

  const obj = payload as Record<string, unknown>;
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  const email = typeof obj.email === "string" ? obj.email.trim() : "";

  if (!name) throw new AppError(400, "name es requerido");
  if (!email) throw new AppError(400, "email es requerido");
  if (name.length > 150) throw new AppError(400, "name excede 150 caracteres");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(400, "email no tiene un formato valido");
  }

  return { name, email };
}
