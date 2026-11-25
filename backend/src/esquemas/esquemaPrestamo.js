import { z } from 'zod';

export const esquemaCrearPrestamo = z.object({
  cuerpo: z
    .object({
      activo_id: z.coerce.number().int().positive().optional(),
      activos_ids: z.array(z.coerce.number().int().positive()).optional(),
      trabajador_solicitante: z
        .string({ required_error: 'El nombre del trabajador solicitante es obligatorio.' })
        .trim()
        .min(3, 'Ingrese el nombre completo del trabajador solicitante.'),
      departamento_solicitante: z
        .string({ required_error: 'El departamento del solicitante es obligatorio.' })
        .trim()
        .min(2, 'Ingrese el departamento del solicitante.'),
      motivo_prestamo: z.string().trim().optional().nullable(),
      accesorios_incluidos: z
        .array(z.string().trim())
        .optional()
        .default([]),
      fecha_estimada_devolucion: z
        .string({ required_error: 'La fecha y hora estimada de devolución es obligatoria.' })
        .refine((valor) => !Number.isNaN(Date.parse(valor)), {
          message: 'La fecha estimada de devolución no tiene un formato válido.'
        }),
      firma_recepcion_base64: z
        .string({ required_error: 'La firma digital de recepción es obligatoria.' })
        .min(50, 'El solicitante debe firmar digitalmente la recepción del equipo.')
        .startsWith('data:image/', 'El formato de la firma digital no es válido.'),
      observaciones_entrega: z.string().trim().optional().nullable(),
      tecnico_responsable: z
        .string({ required_error: 'El técnico que entrega el equipo es obligatorio.' })
        .trim()
        .min(2, 'Ingrese el nombre del técnico responsable.')
    })
    .refine(
      (datos) => Boolean(datos.activo_id) || (Array.isArray(datos.activos_ids) && datos.activos_ids.length > 0),
      {
        message: 'Debe seleccionar o escanear al menos un activo para el préstamo.',
        path: ['activos_ids']
      }
    )
});

export const esquemaDevolverPrestamo = z.object({
  parametros: z.object({
    id: z.coerce.number().int().positive('El identificador del préstamo no es válido.')
  }),
  cuerpo: z.object({
    observaciones_devolucion: z
      .string()
      .trim()
      .optional()
      .default('Equipo devuelto conforme y completo.'),
    estado_activo_retorno: z
      .enum(['FUNCIONAL', 'MANTENIMIENTO', 'DAÑADO'])
      .optional()
      .default('FUNCIONAL')
  })
});
