import { ZodError } from 'zod';

/**
 * Middleware reutilizable para validar cuerpo (req.body), parámetros (req.params)
 * y consultas (req.query) utilizando esquemas de Zod.
 */
export const validarEsquema = (esquema) => async (req, res, next) => {
  try {
    const datosValidados = await esquema.parseAsync({
      cuerpo: req.body,
      parametros: req.params,
      consulta: req.query
    });

    if (datosValidados.cuerpo) req.body = datosValidados.cuerpo;
    if (datosValidados.parametros) req.params = datosValidados.parametros;
    if (datosValidados.consulta) req.query = datosValidados.consulta;

    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const detallesErrores = error.errors.map((detalle) => ({
        campo: detalle.path.slice(1).join('.') || detalle.path.join('.'),
        mensaje: detalle.message
      }));

      return res.status(400).json({
        exito: false,
        mensaje: 'Error de validación en los datos enviados.',
        errores: detallesErrores
      });
    }

    return res.status(500).json({
      exito: false,
      mensaje: 'Error interno al procesar la validación de datos.'
    });
  }
};
