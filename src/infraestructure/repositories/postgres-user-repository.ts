import { Pool } from "pg";
import { User, UserInput } from "../../domain/user";
import { UserRepository } from "../../app/ports/user-repository";

/**
 * Implementación del puerto UserRepository contra PostgreSQL.
 * Tabla esperada: users (id, name, email, created_at).
 */
export class PostgresUserRepository implements UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(input: UserInput): Promise<User> {
    const sql = `
      INSERT INTO users (name, email)
      VALUES ($1, $2)
      RETURNING id, name, email, created_at
    `;
    const result = await this.pool.query(sql, [input.name, input.email]);
    return result.rows[0];
  }

  async findById(id: string): Promise<User | null> {
    const sql = `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const result = await this.pool.query(sql, [id]);
    return result.rows[0] || null;
  }

  async list(): Promise<User[]> {
    const sql = `
      SELECT id, name, email, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(sql);
    return result.rows;
  }

  async update(id: string, input: UserInput): Promise<User | null> {
    const sql = `
      UPDATE users
      SET name = $2, email = $3
      WHERE id = $1
      RETURNING id, name, email, created_at
    `;
    const values = [id, input.name, input.email];
    const result = await this.pool.query(sql, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const sql = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `;
    const result = await this.pool.query(sql, [id]);
    return Boolean(result.rows[0]);
  }
}
