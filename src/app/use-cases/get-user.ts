import { User } from "../../domain/user";
import { UserRepository } from "../ports/user-repository";

/** Caso de uso: obtener un usuario por id. */
export function buildGetUser(userRepository: UserRepository) {
  return async function getUser(id: string): Promise<User | null> {
    if (!id) {
      throw new Error("id es requerido");
    }
    return userRepository.findById(id);
  };
}
