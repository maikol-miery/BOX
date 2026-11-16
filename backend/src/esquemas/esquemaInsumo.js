import { z } from 'zod';

const coloresPermitidos = ['BLACK', 'CYAN', 'MAGENTA', 'YELLOW'];

export const esquemaCrearInsumo = z.object({
  cuerpo: z.object({
    codigo_referencia: z
      .string({ required_error: 'El código del tóner o cartucho es obligatorio.' })
      .trim()
      .min(2, 'Ingrese un código válido (ej. W2020A, CF230A).')
      .transform((val) => val.toUpperCase()),
    nombre_descripcion: z
      .string({ required_error: 'La descripción del insumo es obligatoria.' })
      .trim()
      .min(3, 'Ingrese una descripción válida.'),
    marca: z
      .string({ required_error: 'La marca del insumo es obligatoria.' })
      .trim()
      .min(2, 'Ingrese la marca del insumo.'),
    modelos_compatibles: z.string().trim().optional().nullable(),
    color: z.enum(coloresPermitidos, {
      errorMap: () => ({ message: 'El color debe ser BLACK, CYAN, MAGENTA o YELLOW.' })
    }),
    cantidad_actual: z.coerce
      .number()
      .int()
      .min(0, 'La cantidad actual no puede ser negativa.'),
    cantidad_minima: z.coerce
      .number()
      .int()
      .min(0, 'La cantidad mínima no puede ser negativa.')
      .default(2)
  })
});

export const esquemaActualizarInsumo = z.object({
  parametros: z.object({
    id: z.coerce.number().int().positive('El ID del insumo no es válido.')
  }),
  cuerpo: esquemaCrearInsumo.shape.cuerpo.partial()
});

export const esquemaRegistrarEntregaInsumo = z.object({
  cuerpo: z.object({
    insumo_id: z.coerce.number().int().positive('Debe seleccionar un insumo válido.'),
    impresora_id: z.coerce.number().int().positive('Debe seleccionar la impresora destino.'),
    departamento_destino: z
      .string({ required_error: 'El departamento destino es obligatorio.' })
      .trim()
      .min(2, 'Indique el departamento destino.'),
    usuario_receptor: z
      .string({ required_error: 'El usuario receptor es obligatorio.' })
      .trim()
      .min(2, 'Indique el nombre de quien recibe o solicita el cambio.'),
    tecnico_entregador: z
      .string({ required_error: 'El técnico responsable es obligatorio.' })
      .trim()
      .min(2, 'Indique el técnico que instala o entrega el insumo.'),
    cantidad_entregada: z.coerce
      .number()
      .int()
      .positive('La cantidad entregada debe ser al menos 1.')
      .default(1),
    contador_paginas: z.coerce.number().int().nonnegative().optional().nullable(),
    observaciones: z.string().trim().optional().nullable()
  })
});
