import { Prestamo, Activo } from '../modelos/index.js';

export const obtenerPrestamos = async (req, res, next) => {
  try {
    const listaPrestamos = await Prestamo.findAll({
      include: [
        {
          model: Activo,
          as: 'activo',
          attributes: ['id', 'codigo', 'tipo_activo', 'marca', 'modelo', 'estado']
        }
      ],
      order: [['fecha_salida', 'DESC']]
    });

    const ahora = Date.now();
    for (const prestamo of listaPrestamos) {
      if (
        prestamo.estado_prestamo === 'ACTIVO' &&
        new Date(prestamo.fecha_estimada_devolucion).getTime() < ahora
      ) {
        prestamo.estado_prestamo = 'VENCIDO';
        await prestamo.save();
      }
    }

    return res.status(200).json({
      exito: true,
      datos: listaPrestamos
    });
  } catch (error) {
    return next(error);
  }
};

export const crearPrestamo = async (req, res, next) => {
  try {
    const { activo_id } = req.body;

    const activo = await Activo.findByPk(activo_id);
    if (!activo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El activo seleccionado no existe en el inventario.'
      });
    }

    const prestamoAbierto = await Prestamo.findOne({
      where: {
        activo_id,
        estado_prestamo: ['ACTIVO', 'VENCIDO']
      }
    });

    if (prestamoAbierto) {
      return res.status(400).json({
        exito: false,
        mensaje: `El equipo '${activo.codigo}' ya se encuentra en préstamo activo a nombre de ${prestamoAbierto.trabajador_solicitante}.`
      });
    }

    const nuevoPrestamo = await Prestamo.create({
      ...req.body,
      estado_prestamo: 'ACTIVO'
    });

    const prestamoConActivo = await Prestamo.findByPk(nuevoPrestamo.id, {
      include: [{ model: Activo, as: 'activo' }]
    });

    return res.status(201).json({
      exito: true,
      mensaje: `Salida de préstamo registrada para el activo '${activo.codigo}'.`,
      datos: prestamoConActivo
    });
  } catch (error) {
    return next(error);
  }
};

export const registrarDevolucionPrestamo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { observaciones_devolucion, estado_activo_retorno } = req.body;

    const prestamo = await Prestamo.findByPk(id, {
      include: [{ model: Activo, as: 'activo' }]
    });

    if (!prestamo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El registro de préstamo no existe.'
      });
    }

    if (prestamo.estado_prestamo === 'DEVUELTO') {
      return res.status(400).json({
        exito: false,
        mensaje: 'Este préstamo ya fue marcado como devuelto anteriormente.'
      });
    }

    prestamo.estado_prestamo = 'DEVUELTO';
    prestamo.fecha_real_devolucion = new Date();
    prestamo.observaciones_devolucion = observaciones_devolucion;
    await prestamo.save();

    if (prestamo.activo && estado_activo_retorno) {
      prestamo.activo.estado = estado_activo_retorno;
      await prestamo.activo.save();
    }

    return res.status(200).json({
      exito: true,
      mensaje: `Devolución del equipo '${prestamo.activo?.codigo}' registrada correctamente.`,
      datos: prestamo
    });
  } catch (error) {
    return next(error);
  }
};
