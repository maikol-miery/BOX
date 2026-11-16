import { z } from 'zod';

const destinosPermitidos = ['RECICLAJE', 'DONACION', 'DESINCORPORACION'];

export const esquemaCrearResiduo = z.object({
  cuerpo: z.object({
    activo_id: z.coerce.number().int().positive('Debe seleccionar el activo a evaluar o dar de baja.'),
    codigo_acta: z
      .string({ required_error: 'El código de acta es obligatorio.' })
      .trim()
      .min(3, 'Ingrese un código de acta válido (ej. ACTA-RAEE-2026-001).')
      .transform((val) => val.toUpperCase()),
    diagnostico_tecnico: z
      .string({ required_error: 'El diagnóstico técnico es obligatorio.' })
      .trim()
      .min(5, 'Describa el diagnóstico técnico o motivo de baja.'),
    piezas_faltantes: z.string().trim().optional().nullable(),
    componentes_recuperados: z.string().trim().optional().nullable(),
    destino_final: z.enum(destinosPermitidos, {
      errorMap: () => ({
        message: 'El destino final debe ser RECICLAJE, DONACION o DESINCORPORACION.'
      })
    }),
    fecha_ingreso_banco: z
      .string({ required_error: 'La fecha de ingreso al banco de pruebas es obligatoria.' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD.'),
    fecha_baja_definitiva: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD.')
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    tecnico_evaluador: z
      .string({ required_error: 'El técnico evaluador es obligatorio.' })
      .trim()
      .min(3, 'Indique el nombre del técnico evaluador.'),
    autorizado_por: z.string().trim().optional().nullable(),
    observaciones_auditoria: z.string().trim().optional().nullable()
  })
});
