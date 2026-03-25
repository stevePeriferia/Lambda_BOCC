/**
 * Error de aplicación con código HTTP asociado.
 * Permite que cualquier capa señale errores tipados sin depender
 * de convenciones frágiles basadas en mensajes de texto.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
