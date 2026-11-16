import { z } from 'zod';

const tiposActivoPermitidos = [
  'SOBREMESA',
  'LAPTOP',
  'SERVIDOR',
  'MONITOR',
  'IMPRESORA',
  'PERIFERICO',
  'CABLE'
];

const estadosActivoPermitidos = [
  'FUNCIONAL',
  'MANTENIMIENTO',
  'DAÑADO',
  'DESINCORPORADO'
];

const objetoCaracteristicas = z.object({
  procesador: z.string().optional(),
  memoria_ram: z.string().optional(),
  almacenamiento: z.string().optional(),
  direccion_ip: z.string().optional(),
  sistema_operativo: z.string().optional(),
  detalles_adicionales: z.string().optional()
}).passthrough();

export const esquemaCrearActivo = z.object({
  cuerpo: z.object({
    codigo: z
      .string({ required_error: 'El código del activo es obligatorio.' })
      .trim()
      .min(2, 'El código debe tener al menos 2 caracteres (ej. V-01).')
      .max(30, 'El código no puede exceder 30 caracteres.')
      .transform((valor) => valor.toUpperCase()),
    tipo_activo: z.enum(tiposActivoPermitidos, {
      errorMap: () => ({ message: 'El tipo de activo seleccionado no es válido.' })
    }),
    marca: z
      .string({ required_error: 'La marca es obligatoria.' })
      .trim()
      .min(1, 'La marca no puede estar vacía.'),
    modelo: z
      .string({ required_error: 'El modelo es obligatorio.' })
      .trim()
      .min(1, 'El modelo no puede estar vacío.'),
    serial: z.string().trim().optional().nullable(),
    caracteristicas: objetoCaracteristicas.optional().default({}),
    departamento: z
      .string({ required_error: 'El departamento es obligatorio.' })
      .trim()
      .min(2, 'El departamento es obligatorio.'),
    usuario_custodio: z
      .string({ required_error: 'El usuario custodio es obligatorio.' })
      .trim()
      .min(2, 'El nombre del custodio es obligatorio.'),
    estado: z.enum(estadosActivoPermitidos).optional().default('FUNCIONAL'),
    es_rotativo: z.boolean().optional().default(false),
    observaciones: z.string().trim().optional().nullable(),
    proveedor: z.string().trim().optional().nullable(),
    numero_factura: z.string().trim().optional().nullable(),
    fecha_compra: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de compra debe tener el formato AAAA-MM-DD.')
      .optional()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    meses_garantia: z.coerce
      .number()
      .int('Los meses de garantía deben ser un número entero.')
      .min(0, 'Los meses de garantía no pueden ser negativos.')
      .optional()
      .default(0)
  })
});

export const esquemaActualizarActivo = z.object({
  parametros: z.object({
    id: z.coerce.number().int().positive('El identificador del activo no es válido.')
  }),
  cuerpo: esquemaCrearActivo.shape.cuerpo.partial()
});

export const esquemaParametroCodigoActivo = z.object({
  parametros: z.object({
    codigo: z.string().trim().min(1, 'Debe proporcionar un código QR o de activo válido.')
  })
});
