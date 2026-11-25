import {
  conexionBaseDatos,
  Insumo,
  EntregaInsumo,
  Activo
} from '../modelos/index.js';

export const obtenerInsumos = async (req, res, next) => {
  try {
    const listaInsumos = await Insumo.findAll({
      include: [
        {
          model: EntregaInsumo,
          as: 'historial_entregas',
          limit: 5,
          order: [['fecha_entrega', 'DESC']],
          include: [
            {
              model: Activo,
              as: 'impresora',
              attributes: ['id', 'codigo', 'marca', 'modelo', 'departamento']
            }
          ]
        }
      ],
      order: [['codigo_referencia', 'ASC']]
    });

    return res.status(200).json({
      exito: true,
      datos: listaInsumos
    });
  } catch (error) {
    return next(error);
  }
};

export const obtenerHistorialEntregasInsumos = async (req, res, next) => {
  try {
    const entregas = await EntregaInsumo.findAll({
      include: [
        { model: Insumo, as: 'insumo' },
        {
          model: Activo,
          as: 'impresora',
          attributes: ['id', 'codigo', 'marca', 'modelo', 'departamento']
        }
      ],
      order: [['fecha_entrega', 'DESC']]
    });

    return res.status(200).json({
      exito: true,
      datos: entregas
    });
  } catch (error) {
    return next(error);
  }
};

export const crearInsumo = async (req, res, next) => {
  try {
    const nuevoInsumo = await Insumo.create(req.body);
    return res.status(201).json({
      exito: true,
      mensaje: `Insumo '${nuevoInsumo.codigo_referencia}' registrado correctamente.`,
      datos: nuevoInsumo
    });
  } catch (error) {
    return next(error);
  }
};

export const actualizarInsumo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const insumo = await Insumo.findByPk(id);

    if (!insumo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El insumo solicitado no existe.'
      });
    }

    await insumo.update(req.body);
    return res.status(200).json({
      exito: true,
      mensaje: `Stock/datos del insumo '${insumo.codigo_referencia}' actualizados.`,
      datos: insumo
    });
  } catch (error) {
    return next(error);
  }
};

export const registrarSalidaInsumo = async (req, res, next) => {
  const transaccion = await conexionBaseDatos.transaction();
  try {
    const {
      insumo_id,
      impresora_id,
      departamento_destino,
      usuario_receptor,
      tecnico_entregador,
      cantidad_entregada,
      contador_paginas,
      observaciones
    } = req.body;

    const insumo = await Insumo.findByPk(insumo_id, { transaction: transaccion });
    if (!insumo) {
      await transaccion.rollback();
      return res.status(404).json({
        exito: false,
        mensaje: 'El tóner o cartucho seleccionado no existe.'
      });
    }

    if (insumo.cantidad_actual < cantidad_entregada) {
      await transaccion.rollback();
      return res.status(400).json({
        exito: false,
        mensaje: `Stock insuficiente para '${insumo.codigo_referencia}'. Disponible: ${insumo.cantidad_actual}.`
      });
    }

    const impresora = await Activo.findByPk(impresora_id, { transaction: transaccion });
    if (!impresora) {
      await transaccion.rollback();
      return res.status(404).json({
        exito: false,
        mensaje: 'La impresora seleccionada no existe en el inventario.'
      });
    }

    insumo.cantidad_actual -= cantidad_entregada;
    await insumo.save({ transaction: transaccion });

    const nuevaEntrega = await EntregaInsumo.create(
      {
        insumo_id,
        impresora_id,
        departamento_destino,
        usuario_receptor,
        tecnico_entregador,
        cantidad_entregada,
        contador_paginas,
        observaciones
      },
      { transaction: transaccion }
    );

    await transaccion.commit();

    return res.status(201).json({
      exito: true,
      mensaje: `Reemplazo de tóner '${insumo.codigo_referencia}' registrado. Stock restante: ${insumo.cantidad_actual}.`,
      datos: nuevaEntrega
    });
  } catch (error) {
    await transaccion.rollback();
    return next(error);
  }
};

export const eliminarInsumo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const insumo = await Insumo.findByPk(id);

    if (!insumo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El insumo solicitado no existe.'
      });
    }

    const totalEntregas = await EntregaInsumo.count({ where: { insumo_id: id } });
    if (totalEntregas > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: `No se puede eliminar '${insumo.codigo_referencia}' porque tiene ${totalEntregas} entrega(s) registrada(s) en el historial.`
      });
    }

    const codigo = insumo.codigo_referencia;
    await insumo.destroy();

    return res.status(200).json({
      exito: true,
      mensaje: `Insumo '${codigo}' eliminado del catálogo.`
    });
  } catch (error) {
    return next(error);
  }
};
