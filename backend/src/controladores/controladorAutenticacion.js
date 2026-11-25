import { Usuario } from '../modelos/index.js';
import {
  PERMISOS_COMPLETOS,
  PERMISOS_POR_DEFECTO
} from '../modelos/Usuario.js';
import {
  firmarToken,
  hashearClave,
  verificarClave
} from '../utilidades/seguridad.js';

const normalizarPermisos = (permisosEntrada = {}, rol = 'USUARIO') => {
  if (rol === 'ADMIN') {
    return PERMISOS_COMPLETOS;
  }

  const resultado = {};
  for (const modulo of Object.keys(PERMISOS_POR_DEFECTO)) {
    const entrada = permisosEntrada?.[modulo] || {};
    const editar = Boolean(entrada.editar);
    const ver = editar ? true : Boolean(entrada.ver);
    resultado[modulo] = { ver, editar };
  }
  return resultado;
};

const sanitizarUsuario = (usuario) => ({
  id: usuario.id,
  nombre_completo: usuario.nombre_completo,
  nombre_usuario: usuario.nombre_usuario,
  rol: usuario.rol,
  permisos: usuario.rol === 'ADMIN' ? PERMISOS_COMPLETOS : usuario.permisos,
  activo: usuario.activo,
  createdAt: usuario.createdAt
});

export const estadoInicial = async (req, res, next) => {
  try {
    const totalUsuarios = await Usuario.count();
    return res.status(200).json({
      exito: true,
      requiere_registro_inicial: totalUsuarios === 0
    });
  } catch (error) {
    return next(error);
  }
};

export const registrarAdministradorInicial = async (req, res, next) => {
  try {
    const totalUsuarios = await Usuario.count();
    if (totalUsuarios > 0) {
      return res.status(403).json({
        exito: false,
        mensaje: 'El sistema ya cuenta con un administrador inicial.'
      });
    }

    const nombreUsuario = req.body.nombre_usuario.trim().toLowerCase();
    const admin = await Usuario.create({
      nombre_completo: req.body.nombre_completo.trim(),
      nombre_usuario: nombreUsuario,
      clave_hash: hashearClave(req.body.clave),
      rol: 'ADMIN',
      permisos: PERMISOS_COMPLETOS,
      activo: true
    });

    const token = firmarToken({
      id: admin.id,
      nombre_usuario: admin.nombre_usuario,
      rol: admin.rol
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Cuenta de administrador inicial creada correctamente.',
      datos: {
        token,
        usuario: sanitizarUsuario(admin)
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const iniciarSesion = async (req, res, next) => {
  try {
    const nombreUsuario = req.body.nombre_usuario.trim().toLowerCase();
    const usuario = await Usuario.findOne({
      where: { nombre_usuario: nombreUsuario }
    });

    if (!usuario || !verificarClave(req.body.clave, usuario.clave_hash)) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Usuario o contraseña incorrectos.'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Tu cuenta se encuentra desactivada. Contacta al administrador.'
      });
    }

    const token = firmarToken({
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol
    });

    return res.status(200).json({
      exito: true,
      mensaje: `Bienvenido, ${usuario.nombre_completo}.`,
      datos: {
        token,
        usuario: sanitizarUsuario(usuario)
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const obtenerPerfilActual = async (req, res) => {
  return res.status(200).json({
    exito: true,
    datos: sanitizarUsuario(req.usuario)
  });
};

export const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      order: [
        ['rol', 'ASC'],
        ['nombre_completo', 'ASC']
      ]
    });

    return res.status(200).json({
      exito: true,
      datos: usuarios.map(sanitizarUsuario)
    });
  } catch (error) {
    return next(error);
  }
};

export const crearUsuario = async (req, res, next) => {
  try {
    const nombreUsuario = req.body.nombre_usuario.trim().toLowerCase();
    const existente = await Usuario.findOne({
      where: { nombre_usuario: nombreUsuario }
    });

    if (existente) {
      return res.status(409).json({
        exito: false,
        mensaje: `El nombre de usuario '${nombreUsuario}' ya está en uso.`
      });
    }

    const rol = req.body.rol || 'USUARIO';
    const nuevoUsuario = await Usuario.create({
      nombre_completo: req.body.nombre_completo.trim(),
      nombre_usuario: nombreUsuario,
      clave_hash: hashearClave(req.body.clave),
      rol,
      permisos: normalizarPermisos(req.body.permisos, rol),
      activo: req.body.activo !== undefined ? Boolean(req.body.activo) : true
    });

    return res.status(201).json({
      exito: true,
      mensaje: `Cuenta '${nuevoUsuario.nombre_usuario}' creada correctamente.`,
      datos: sanitizarUsuario(nuevoUsuario)
    });
  } catch (error) {
    return next(error);
  }
};

export const actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El usuario solicitado no existe.'
      });
    }

    const nuevoRol = req.body.rol || usuario.rol;
    const nuevoActivo =
      req.body.activo !== undefined ? Boolean(req.body.activo) : usuario.activo;

    if (usuario.rol === 'ADMIN' && (nuevoRol !== 'ADMIN' || !nuevoActivo)) {
      const adminsActivos = await Usuario.count({
        where: { rol: 'ADMIN', activo: true }
      });
      if (adminsActivos <= 1) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Debe quedar al menos un administrador activo en el sistema.'
        });
      }
    }

    const cambios = {
      nombre_completo: req.body.nombre_completo?.trim() || usuario.nombre_completo,
      rol: nuevoRol,
      activo: nuevoActivo,
      permisos: normalizarPermisos(
        req.body.permisos !== undefined ? req.body.permisos : usuario.permisos,
        nuevoRol
      )
    };

    if (req.body.clave) {
      cambios.clave_hash = hashearClave(req.body.clave);
    }

    await usuario.update(cambios);

    return res.status(200).json({
      exito: true,
      mensaje: `Datos y permisos de '${usuario.nombre_usuario}' actualizados.`,
      datos: sanitizarUsuario(usuario)
    });
  } catch (error) {
    return next(error);
  }
};

export const eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.usuario.id) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No puedes eliminar tu propia cuenta mientras tienes sesión iniciada.'
      });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El usuario solicitado no existe.'
      });
    }

    if (usuario.rol === 'ADMIN') {
      const totalAdmins = await Usuario.count({ where: { rol: 'ADMIN' } });
      if (totalAdmins <= 1) {
        return res.status(400).json({
          exito: false,
          mensaje: 'No puedes eliminar al único administrador del sistema.'
        });
      }
    }

    const nombre = usuario.nombre_usuario;
    await usuario.destroy();

    return res.status(200).json({
      exito: true,
      mensaje: `Usuario '${nombre}' eliminado correctamente.`
    });
  } catch (error) {
    return next(error);
  }
};
