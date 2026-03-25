import { UserRepository } from "../ports/user-repository";

/** Caso de uso: eliminar un usuario por id. */
export function buildDeleteUser(userRepository: UserRepository) {
  return async function deleteUser(id: string): Promise<boolean> {
    if (!id) {
      throw new Error("id es requerido");
    }
    return userRepository.delete(id);
  };
}
