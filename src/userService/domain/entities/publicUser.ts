/**
 * Proyección reutilizable para toda consulta de usuario destinada a una respuesta.
 * Los secretos deben excluirse en la consulta, no borrarse luego de materializarlos.
 */
export const publicUserOmit = {
  password: true,
} as const;

export const publicUserSelect = {
  id: true,
  name: true,
  lastName: true,
  userName: true,
  birthDate: true,
  email: true,
  nivel: true,
  imgLevel: true,
  level: true,
  rol: true,
  point: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;
