import ExcelJS from 'exceljs';
import {
  JornadaMantenimiento,
  RegistroMantenimiento,
  Activo
} from '../modelos/index.js';

export const obtenerJornadasMantenimiento = async (req, res, next) => {
  try {
    const jornadas = await JornadaMantenimiento.findAll({
      include: [
        {
          model: RegistroMantenimiento,
          as: 'registros_ejecucion',
          include: [
            {
              model: Activo,
              as: 'activo',
              attributes: ['id', 'codigo', 'tipo_activo', 'marca', 'modelo']
            }
          ]
        }
      ],
      order: [['fecha_inicio', 'DESC']]
    });

    return res.status(200).json({
      exito: true,
      datos: jornadas
    });
  } catch (error) {
    return next(error);
  }
};

export const obtenerDetalleJornada = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jornada = await JornadaMantenimiento.findByPk(id, {
      include: [
        {
          model: RegistroMantenimiento,
          as: 'registros_ejecucion',
          include: [{ model: Activo, as: 'activo' }]
        }
      ]
    });

    if (!jornada) {
      return res.status(404).json({
        exito: false,
        mensaje: 'La jornada de mantenimiento solicitada no existe.'
      });
    }

    return res.status(200).json({
      exito: true,
      datos: jornada
    });
  } catch (error) {
    return next(error);
  }
};

export const crearJornadaMantenimiento = async (req, res, next) => {
  try {
    const nuevaJornada = await JornadaMantenimiento.create(req.body);
    return res.status(201).json({
      exito: true,
      mensaje: 'Jornada de mantenimiento preventivo creada correctamente.',
      datos: nuevaJornada
    });
  } catch (error) {
    return next(error);
  }
};

export const registrarEjecucionConFirma = async (req, res, next) => {
  try {
    const { jornadaId } = req.params;
    const jornada = await JornadaMantenimiento.findByPk(jornadaId);

    if (!jornada) {
      return res.status(404).json({
        exito: false,
        mensaje: 'La jornada de mantenimiento no existe.'
      });
    }

    const nuevoRegistro = await RegistroMantenimiento.create({
      ...req.body,
      jornada_id: Number(jornadaId)
    });

    const registroCompleto = await RegistroMantenimiento.findByPk(nuevoRegistro.id, {
      include: [{ model: Activo, as: 'activo' }]
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Chequeo y firma digital de conformidad guardados correctamente.',
      datos: registroCompleto
    });
  } catch (error) {
    return next(error);
  }
};

export const exportarExcelFormatoInstitucional = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jornada = await JornadaMantenimiento.findByPk(id, {
      include: [
        {
          model: RegistroMantenimiento,
          as: 'registros_ejecucion',
          include: [{ model: Activo, as: 'activo' }]
        }
      ]
    });

    if (!jornada) {
      return res.status(404).json({
        exito: false,
        mensaje: 'La jornada de mantenimiento no fue encontrada para exportar.'
      });
    }

    const libroExcel = new ExcelJS.Workbook();
    libroExcel.creator = 'Sistema Box - Industrias Rodanol, S.A.';
    libroExcel.created = new Date();

    const registros = jornada.registros_ejecucion || [];
    const totalEquipos = registros.length;
    const totalEjecutadosSi = registros.filter((r) => r.ejecutado === 'SI').length;
    const totalEjecutadosNo = registros.filter((r) => r.ejecutado === 'NO').length;
    const porcentajeCumplimiento =
      totalEquipos > 0 ? Math.round((totalEjecutadosSi / totalEquipos) * 100) : 0;

    // PESTAÑA 1: RESUMEN GENERAL DE LA JORNADA
    const hojaResumen = libroExcel.addWorksheet('Resumen General', {
      views: [{ showGridLines: true }]
    });

    hojaResumen.columns = [
      { key: 'concepto', width: 38 },
      { key: 'valor', width: 55 }
    ];

    hojaResumen.mergeCells('A1:B1');
    const celdaTituloResumen = hojaResumen.getCell('A1');
    celdaTituloResumen.value = 'INDUSTRIAS RODANOL, S.A. - DEPARTAMENTO DE IT (SISTEMA BOX)';
    celdaTituloResumen.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    celdaTituloResumen.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4C1D95' }
    };
    celdaTituloResumen.alignment = { vertical: 'middle', horizontal: 'center' };
    hojaResumen.getRow(1).height = 30;

    hojaResumen.mergeCells('A2:B2');
    const celdaSubtituloResumen = hojaResumen.getCell('A2');
    celdaSubtituloResumen.value = `RESUMEN EJECUTIVO DE MANTENIMIENTO PREVENTIVO (${jornada.codigo_formulario})`;
    celdaSubtituloResumen.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFEDE9FE' } };
    celdaSubtituloResumen.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6D28D9' }
    };
    celdaSubtituloResumen.alignment = { vertical: 'middle', horizontal: 'center' };
    hojaResumen.getRow(2).height = 24;

    const filasResumen = [
      ['Código del Formulario Institucional', jornada.codigo_formulario],
      ['Actividad de Mantenimiento Preventivo', jornada.titulo_actividad],
      ['Descripción de Tareas Realizadas', jornada.descripcion_tareas || 'N/A'],
      ['Departamento Objetivo', jornada.departamento_objetivo],
      ['Técnico Responsable', jornada.tecnico_responsable],
      ['Fecha de Inicio de Jornada', jornada.fecha_inicio],
      ['Fecha de Cierre de Jornada', jornada.fecha_cierre || 'En curso'],
      ['Estado de la Jornada', jornada.estado_jornada],
      ['Total de Equipos Evaluados', totalEquipos],
      ['Mantenimientos Ejecutados (SI)', totalEjecutadosSi],
      ['Mantenimientos Pendientes/No Ejecutados (NO)', totalEjecutadosNo],
      ['Porcentaje de Cumplimiento Operativo', `${porcentajeCumplimiento}%`]
    ];

    hojaResumen.addRow([]);
    filasResumen.forEach(([concepto, valor]) => {
      const fila = hojaResumen.addRow({ concepto, valor });
      fila.height = 22;
      fila.getCell(1).font = { bold: true, color: { argb: 'FF1E293B' } };
      fila.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3E8FF' }
      };
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
        celda.alignment = { vertical: 'middle', wrapText: true };
      });
    });

    // PESTAÑA 2: DETALLE DE EJECUCIÓN (FORMATO INSTITUCIONAL IR-SI-FO-001)
    const hojaDetalle = libroExcel.addWorksheet('Formato IR-SI-FO-001', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
    });

    hojaDetalle.mergeCells('A1:F2');
    const celdaEmpresa = hojaDetalle.getCell('A1');
    celdaEmpresa.value = 'INDUSTRIAS RODANOL, S.A.\nREGISTRO DE MANTENIMIENTO PREVENTIVO DE ACTIVOS INFORMÁTICOS';
    celdaEmpresa.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    celdaEmpresa.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4C1D95' }
    };
    celdaEmpresa.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    hojaDetalle.mergeCells('G1:I2');
    const celdaCodigoFormato = hojaDetalle.getCell('G1');
    celdaCodigoFormato.value = `CÓDIGO: ${jornada.codigo_formulario}\nFECHA: ${jornada.fecha_inicio}\nTÉCNICO: ${jornada.tecnico_responsable}`;
    celdaCodigoFormato.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E1B4B' } };
    celdaCodigoFormato.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDD6FE' }
    };
    celdaCodigoFormato.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    hojaDetalle.getRow(1).height = 24;
    hojaDetalle.getRow(2).height = 24;

    hojaDetalle.mergeCells('A3:I3');
    const celdaActividad = hojaDetalle.getCell('A3');
    celdaActividad.value = `ACTIVIDAD PREVENTIVA: ${jornada.titulo_actividad} | DEPARTAMENTO: ${jornada.departamento_objetivo}`;
    celdaActividad.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF311068' } };
    celdaActividad.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F3FF' }
    };
    celdaActividad.alignment = { vertical: 'middle', horizontal: 'left' };
    hojaDetalle.getRow(3).height = 24;

    const cabecerasDetalle = [
      'N°',
      'CÓDIGO ACTIVO',
      'EQUIPO / MODELO',
      'USUARIO CUSTODIO',
      'DEPARTAMENTO',
      'EJECUTADO (SI/NO)',
      'FECHA',
      'OBSERVACIONES',
      'FIRMA DE CONFORMIDAD'
    ];

    const filaCabecera = hojaDetalle.getRow(4);
    filaCabecera.values = cabecerasDetalle;
    filaCabecera.height = 26;

    const anchosColumnas = [6, 16, 28, 25, 24, 18, 15, 34, 26];
    anchosColumnas.forEach((ancho, indice) => {
      hojaDetalle.getColumn(indice + 1).width = ancho;
    });

    filaCabecera.eachCell((celda) => {
      celda.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      celda.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B21B6' }
      };
      celda.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      celda.border = {
        top: { style: 'thin', color: { argb: 'FF4C1D95' } },
        left: { style: 'thin', color: { argb: 'FF4C1D95' } },
        bottom: { style: 'thin', color: { argb: 'FF4C1D95' } },
        right: { style: 'thin', color: { argb: 'FF4C1D95' } }
      };
    });

    registros.forEach((registro, indice) => {
      const numeroFila = indice + 5;
      const equipoTexto = registro.activo
        ? `${registro.activo.tipo_activo} ${registro.activo.marca} ${registro.activo.modelo}`
        : 'Activo N/D';

      const fila = hojaDetalle.getRow(numeroFila);
      fila.values = [
        indice + 1,
        registro.activo ? registro.activo.codigo : 'N/A',
        equipoTexto,
        registro.usuario_atendido,
        registro.departamento,
        registro.ejecutado,
        registro.fecha_ejecucion,
        registro.observaciones || 'Sin novedades',
        ''
      ];
      fila.height = 48;

      fila.eachCell({ includeEmpty: true }, (celda, colNumber) => {
        celda.alignment = {
          vertical: 'middle',
          horizontal: [1, 2, 6, 7].includes(colNumber) ? 'center' : 'left',
          wrapText: true
        };
        celda.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });

      if (
        registro.firma_conformidad_base64 &&
        registro.firma_conformidad_base64.startsWith('data:image/')
      ) {
        try {
          const idImagenFirma = libroExcel.addImage({
            base64: registro.firma_conformidad_base64,
            extension: 'png'
          });
          hojaDetalle.addImage(idImagenFirma, {
            tl: { col: 8.1, row: numeroFila - 1 + 0.1 },
            ext: { width: 130, height: 40 }
          });
        } catch (errImagen) {
          fila.getCell(9).value = 'Firmado Digitalmente';
        }
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Formato_${jornada.codigo_formulario}_Jornada_${jornada.id}.xlsx"`
    );

    await libroExcel.xlsx.write(res);
    return res.end();
  } catch (error) {
    return next(error);
  }
};
