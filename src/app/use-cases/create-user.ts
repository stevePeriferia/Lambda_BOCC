import { User, validateUserInput } from "../../domain/user";
import { UserRepository } from "../ports/user-repository";

/** Caso de uso: alta de usuario (valida en dominio, persiste por el puerto). */
export function buildCreateUser(userRepository: UserRepository) {
  return async function createUser(payload: unknown): Promise<User> {
    const input = validateUserInput(payload);
    return userRepository.create(input);
  };
}
