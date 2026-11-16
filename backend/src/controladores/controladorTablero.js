import {
  Activo,
  JornadaMantenimiento,
  Insumo,
  Prestamo,
  ResiduoElectronico
} from '../modelos/index.js';

export const obtenerResumenTablero = async (req, res, next) => {
  try {
    const [activos, jornadas, insumos, prestamos, residuos] = await Promise.all([
      Activo.findAll(),
      JornadaMantenimiento.findAll(),
      Insumo.findAll(),
      Prestamo.findAll({ include: [{ model: Activo, as: 'activo' }] }),
      ResiduoElectronico.findAll()
    ]);

    const totalActivos = activos.length;
    const activosFuncionales = activos.filter((a) => a.estado === 'FUNCIONAL').length;
    const activosDanados = activos.filter((a) => a.estado === 'DAÑADO').length;

    const garantiasPorVencer = activos.filter(
      (a) => a.resumen_garantia?.estado_garantia === 'POR VENCER'
    ).length;
    const garantiasVigentes = activos.filter(
      (a) => a.resumen_garantia?.estado_garantia === 'VIGENTE'
    ).length;

    const insumosAlertaStock = insumos.filter(
      (i) => i.cantidad_actual <= i.cantidad_minima
    );

    const prestamosActivos = prestamos.filter(
      (p) => p.estado_semaforo === 'ACTIVO'
    ).length;
    const prestamosVencidos = prestamos.filter(
      (p) => p.estado_semaforo === 'VENCIDO'
    ).length;

    return res.status(200).json({
      exito: true,
      datos: {
        metricas: {
          total_activos: totalActivos,
          activos_funcionales: activosFuncionales,
          activos_danados: activosDanados,
          garantias_vigentes: garantiasVigentes,
          garantias_por_vencer: garantiasPorVencer,
          jornadas_totales: jornadas.length,
          insumos_bajo_stock: insumosAlertaStock.length,
          prestamos_activos: prestamosActivos,
          prestamos_vencidos: prestamosVencidos,
          equipos_raee: residuos.length
        },
        alertas_insumos: insumosAlertaStock,
        prestamos_recientes: prestamos.slice(0, 5)
      }
    });
  } catch (error) {
    return next(error);
  }
};
