import { User, validateUserInput } from "../../domain/user";
import { UserRepository } from "../ports/user-repository";

/** Caso de uso: actualizar un usuario existente. */
export function buildUpdateUser(userRepository: UserRepository) {
  return async function updateUser(id: string, payload: unknown): Promise<User | null> {
    if (!id) {
      throw new Error("id es requerido");
    }
    const input = validateUserInput(payload);
    return userRepository.update(id, input);
  };
}
