import { User, UserInput } from "../../domain/user";

/** Contrato del puerto de persistencia para users. */
export interface UserRepository {
  create(input: UserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  list(): Promise<User[]>;
  update(id: string, input: UserInput): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
