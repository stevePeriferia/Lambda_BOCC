import { User } from "../../domain/user";
import { UserRepository } from "../ports/user-repository";

/** Caso de uso: listar todos los usuarios. */
export function buildListUsers(userRepository: UserRepository) {
  return async function listUsers(): Promise<User[]> {
    return userRepository.list();
  };
}
