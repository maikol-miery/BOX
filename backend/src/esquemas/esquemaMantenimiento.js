import { z } from 'zod';

export const esquemaCrearJornadaMantenimiento = z.object({
  cuerpo: z.object({
    codigo_formulario: z.string().trim().default('MANT-PREV'),
    titulo_actividad: z
      .string({ required_error: 'El título de la actividad preventiva es obligatorio.' })
      .trim()
      .min(5, 'El título de la actividad debe tener al menos 5 caracteres.'),
    descripcion_tareas: z.string().trim().optional().nullable(),
    departamento_objetivo: z.string().trim().default('TODOS LOS DEPARTAMENTOS'),
    tecnico_responsable: z
      .string({ required_error: 'El técnico responsable es obligatorio.' })
      .trim()
      .min(3, 'Indique el nombre del técnico responsable.'),
    fecha_inicio: z
      .string({ required_error: 'La fecha de inicio es obligatoria.' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de inicio debe tener formato AAAA-MM-DD.'),
    fecha_cierre: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de cierre debe tener formato AAAA-MM-DD.')
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    estado_jornada: z.enum(['PROGRAMADA', 'EN_CURSO', 'FINALIZADA']).optional().default('EN_CURSO')
  })
});

export const esquemaRegistrarEjecucionMantenimiento = z.object({
  parametros: z.object({
    jornadaId: z.coerce.number().int().positive('El ID de la jornada no es válido.')
  }),
  cuerpo: z.object({
    activo_id: z.coerce.number().int().positive('Debe seleccionar un activo válido.'),
    usuario_atendido: z
      .string({ required_error: 'El nombre del usuario atendido es obligatorio.' })
      .trim()
      .min(2, 'Ingrese el nombre del usuario atendido.'),
    departamento: z
      .string({ required_error: 'El departamento es obligatorio.' })
      .trim()
      .min(2, 'Ingrese el departamento.'),
    ejecutado: z.enum(['SI', 'NO'], {
      errorMap: () => ({ message: 'El campo ejecutado debe ser SI o NO.' })
    }),
    fecha_ejecucion: z
      .string({ required_error: 'La fecha de ejecución es obligatoria.' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD.'),
    observaciones: z.string().trim().optional().nullable(),
    firma_conformidad_base64: z
      .string({ required_error: 'La firma digital de conformidad es obligatoria.' })
      .min(50, 'Debe capturar la firma digital del usuario en el lienzo táctil.')
      .startsWith('data:image/', 'El formato de la firma digital no es una imagen Base64 válida.')
  })
});
