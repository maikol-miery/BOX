import { conexionBaseDatos, Prestamo, Activo } from '../modelos/index.js';

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
  const transaccion = await conexionBaseDatos.transaction();
  try {
    const { activo_id, activos_ids, ...datosComunes } = req.body;
    const listaIds = Array.isArray(activos_ids) && activos_ids.length > 0
      ? [...new Set(activos_ids.map(Number))]
      : [Number(activo_id)];

    const codigosRegistrados = [];
    const prestamosCreados = [];
    const fechaSalidaComun = new Date();

    for (const idActual of listaIds) {
      const activo = await Activo.findByPk(idActual, { transaction: transaccion });
      if (!activo) {
        await transaccion.rollback();
        return res.status(404).json({
          exito: false,
          mensaje: `Uno de los activos seleccionados (ID ${idActual}) no existe en el inventario.`
        });
      }

      const prestamoAbierto = await Prestamo.findOne({
        where: {
          activo_id: idActual,
          estado_prestamo: ['ACTIVO', 'VENCIDO']
        },
        transaction: transaccion
      });

      if (prestamoAbierto) {
        await transaccion.rollback();
        return res.status(400).json({
          exito: false,
          mensaje: `El equipo '${activo.codigo}' ya se encuentra en préstamo activo a nombre de ${prestamoAbierto.trabajador_solicitante}.`
        });
      }

      const nuevoPrestamo = await Prestamo.create(
        {
          ...datosComunes,
          activo_id: idActual,
          fecha_salida: fechaSalidaComun,
          estado_prestamo: 'ACTIVO'
        },
        { transaction: transaccion }
      );

      codigosRegistrados.push(activo.codigo);
      prestamosCreados.push(nuevoPrestamo.id);
    }

    await transaccion.commit();

    const registrosCompletos = await Prestamo.findAll({
      where: { id: prestamosCreados },
      include: [{ model: Activo, as: 'activo' }]
    });

    return res.status(201).json({
      exito: true,
      mensaje: `Préstamo registrado para ${codigosRegistrados.length} equipo(s): ${codigosRegistrados.join(', ')}.`,
      datos: registrosCompletos
    });
  } catch (error) {
    await transaccion.rollback();
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
