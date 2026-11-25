import { Usuario } from '../modelos/index.js';
import { verificarToken } from '../utilidades/seguridad.js';

export const requerirAutenticacion = async (req, res, next) => {
  try {
    const encabezadoAuth = req.headers.authorization || '';
    const token = encabezadoAuth.startsWith('Bearer ')
      ? encabezadoAuth.slice(7).trim()
      : '';

    if (!token) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Debes iniciar sesión para acceder a este recurso.'
      });
    }

    const datosToken = verificarToken(token);
    if (!datosToken?.id) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Tu sesión ha expirado o es inválida. Inicia sesión nuevamente.'
      });
    }

    const usuario = await Usuario.findByPk(datosToken.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        exito: false,
        mensaje: 'La cuenta de usuario no existe o se encuentra desactivada.'
      });
    }

    req.usuario = usuario;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requerirAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'ADMIN') {
    return res.status(403).json({
      exito: false,
      mensaje: 'Esta acción está reservada para el administrador del sistema.'
    });
  }
  return next();
};

export const requerirPermisoModulo = (modulo, accion = 'ver') => {
  return (req, res, next) => {
    if (req.usuario?.rol === 'ADMIN') {
      return next();
    }

    const permisoModulo = req.usuario?.permisos?.[modulo];
    const tieneAcceso = Boolean(permisoModulo && permisoModulo[accion]);

    if (!tieneAcceso) {
      return res.status(403).json({
        exito: false,
        mensaje: `No tienes permiso para ${accion === 'editar' ? 'modificar' : 'ver'} este módulo (${modulo}).`
      });
    }

    return next();
  };
};
