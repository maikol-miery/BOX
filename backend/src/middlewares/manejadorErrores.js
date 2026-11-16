/**
 * Middleware centralizado para capturar errores no controlados o de Sequelize
 * y responder en formato JSON estandarizado en español.
 */
export const manejadorErrores = (error, req, res, next) => {
  console.error('❌ [Box - Error en Servidor]:', error);

  if (error.name === 'SequelizeUniqueConstraintError') {
    const campoDuplicado = error.errors?.[0]?.path || 'registro';
    return res.status(409).json({
      exito: false,
      mensaje: `Ya existe un registro con el mismo valor en el campo '${campoDuplicado}'.`
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      exito: false,
      mensaje: 'No se puede completar la operación porque el registro está vinculado a otros datos del sistema.'
    });
  }

  return res.status(error.codigoEstado || 500).json({
    exito: false,
    mensaje: error.message || 'Error interno en el servidor de Box - Industrias Rodanol, S.A.'
  });
};
