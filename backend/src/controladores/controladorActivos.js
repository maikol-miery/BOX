import { Op } from 'sequelize';
import {
  Activo,
  RegistroMantenimiento,
  JornadaMantenimiento,
  EntregaInsumo,
  Insumo,
  Prestamo,
  ResiduoElectronico
} from '../modelos/index.js';

export const obtenerActivos = async (req, res, next) => {
  try {
    const { busqueda, tipo_activo, departamento, estado, es_rotativo } = req.query;
    const filtro = {};

    if (tipo_activo) filtro.tipo_activo = tipo_activo;
    if (departamento) filtro.departamento = departamento;
    if (estado) filtro.estado = estado;
    if (es_rotativo !== undefined) filtro.es_rotativo = es_rotativo === 'true';

    if (busqueda) {
      filtro[Op.or] = [
        { codigo: { [Op.iLike]: `%${busqueda}%` } },
        { marca: { [Op.iLike]: `%${busqueda}%` } },
        { modelo: { [Op.iLike]: `%${busqueda}%` } },
        { usuario_custodio: { [Op.iLike]: `%${busqueda}%` } },
        { departamento: { [Op.iLike]: `%${busqueda}%` } }
      ];
    }

    const listaActivos = await Activo.findAll({
      where: filtro,
      order: [['codigo', 'ASC']]
    });

    return res.status(200).json({
      exito: true,
      total: listaActivos.length,
      datos: listaActivos
    });
  } catch (error) {
    return next(error);
  }
};

export const obtenerHojaVidaPorCodigo = async (req, res, next) => {
  try {
    const codigoNormalizado = req.params.codigo.trim().toUpperCase();

    const activoEncontrado = await Activo.findOne({
      where: { codigo: codigoNormalizado },
      include: [
        {
          model: RegistroMantenimiento,
          as: 'historial_mantenimientos',
          include: [{ model: JornadaMantenimiento, as: 'jornada' }]
        },
        {
          model: EntregaInsumo,
          as: 'consumos_toner',
          include: [{ model: Insumo, as: 'insumo' }]
        },
        {
          model: Prestamo,
          as: 'historial_prestamos'
        },
        {
          model: ResiduoElectronico,
          as: 'registros_raee'
        }
      ],
      order: [
        [{ model: RegistroMantenimiento, as: 'historial_mantenimientos' }, 'fecha_ejecucion', 'DESC'],
        [{ model: Prestamo, as: 'historial_prestamos' }, 'fecha_salida', 'DESC']
      ]
    });

    if (!activoEncontrado) {
      return res.status(404).json({
        exito: false,
        mensaje: `No se encontró ningún activo registrado con el código QR '${codigoNormalizado}'.`
      });
    }

    return res.status(200).json({
      exito: true,
      datos: activoEncontrado
    });
  } catch (error) {
    return next(error);
  }
};

export const crearActivo = async (req, res, next) => {
  try {
    const nuevoActivo = await Activo.create(req.body);
    return res.status(201).json({
      exito: true,
      mensaje: `Activo '${nuevoActivo.codigo}' registrado exitosamente en el parque informático.`,
      datos: nuevoActivo
    });
  } catch (error) {
    return next(error);
  }
};

export const actualizarActivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activoExistente = await Activo.findByPk(id);

    if (!activoExistente) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El activo solicitado no existe.'
      });
    }

    await activoExistente.update(req.body);

    return res.status(200).json({
      exito: true,
      mensaje: `Activo '${activoExistente.codigo}' actualizado correctamente.`,
      datos: activoExistente
    });
  } catch (error) {
    return next(error);
  }
};

export const eliminarActivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activoExistente = await Activo.findByPk(id);

    if (!activoExistente) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El activo solicitado no existe.'
      });
    }

    await activoExistente.destroy();

    return res.status(200).json({
      exito: true,
      mensaje: `Activo '${activoExistente.codigo}' eliminado del sistema.`
    });
  } catch (error) {
    return next(error);
  }
};
