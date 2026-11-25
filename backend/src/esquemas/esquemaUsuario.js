import { z } from 'zod';

const esquemaPermisoModulo = z.object({
  ver: z.boolean().default(false),
  editar: z.boolean().default(false)
});

const esquemaMapaPermisos = z.object({
  tablero: esquemaPermisoModulo.optional(),
  activos: esquemaPermisoModulo.optional(),
  etiquetas: esquemaPermisoModulo.optional(),
  mantenimientos: esquemaPermisoModulo.optional(),
  insumos: esquemaPermisoModulo.optional(),
  prestamos: esquemaPermisoModulo.optional(),
  residuos: esquemaPermisoModulo.optional()
});

export const esquemaRegistroInicial = z.object({
  cuerpo: z.object({
    nombre_completo: z
      .string({ required_error: 'El nombre completo es obligatorio' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(120),
    nombre_usuario: z
      .string({ required_error: 'El nombre de usuario es obligatorio' })
      .trim()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .max(60)
      .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos y guiones'),
    clave: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100)
  })
});

export const esquemaIniciarSesion = z.object({
  cuerpo: z.object({
    nombre_usuario: z.string({ required_error: 'Ingresa tu usuario' }).trim().min(1),
    clave: z.string({ required_error: 'Ingresa tu contraseña' }).min(1)
  })
});

export const esquemaCrearUsuario = z.object({
  cuerpo: z.object({
    nombre_completo: z.string().trim().min(3).max(120),
    nombre_usuario: z
      .string()
      .trim()
      .min(3)
      .max(60)
      .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos y guiones'),
    clave: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
    rol: z.enum(['ADMIN', 'USUARIO']).default('USUARIO'),
    permisos: esquemaMapaPermisos.optional(),
    activo: z.boolean().default(true)
  })
});

export const esquemaActualizarUsuario = z.object({
  cuerpo: z.object({
    nombre_completo: z.string().trim().min(3).max(120).optional(),
    clave: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100).optional(),
    rol: z.enum(['ADMIN', 'USUARIO']).optional(),
    permisos: esquemaMapaPermisos.optional(),
    activo: z.boolean().optional()
  })
});
