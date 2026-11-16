import { ResiduoElectronico, Activo } from '../modelos/index.js';

export const obtenerResiduosElectronicos = async (req, res, next) => {
  try {
    const listaResiduos = await ResiduoElectronico.findAll({
      include: [
        {
          model: Activo,
          as: 'activo'
        }
      ],
      order: [['fecha_ingreso_banco', 'DESC']]
    });

    return res.status(200).json({
      exito: true,
      datos: listaResiduos
    });
  } catch (error) {
    return next(error);
  }
};

export const crearResiduoElectronico = async (req, res, next) => {
  try {
    const { activo_id, destino_final } = req.body;

    const activo = await Activo.findByPk(activo_id);
    if (!activo) {
      return res.status(404).json({
        exito: false,
        mensaje: 'El activo seleccionado no existe.'
      });
    }

    const nuevoResiduo = await ResiduoElectronico.create(req.body);

    if (
      destino_final === 'DESINCORPORACION' ||
      destino_final === 'RECICLAJE' ||
      destino_final === 'DONACION'
    ) {
      activo.estado = 'DESINCORPORADO';
      await activo.save();
    }

    const residuoCompleto = await ResiduoElectronico.findByPk(nuevoResiduo.id, {
      include: [{ model: Activo, as: 'activo' }]
    });

    return res.status(201).json({
      exito: true,
      mensaje: `Acta RAEE '${nuevoResiduo.codigo_acta}' generada y activo actualizado a DESINCORPORADO.`,
      datos: residuoCompleto
    });
  } catch (error) {
    return next(error);
  }
};
