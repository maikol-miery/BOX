import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { conectarBaseDatos } from './config/baseDatos.js';
import enrutadorPrincipal from './rutas/index.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';
import { Activo, Insumo, JornadaMantenimiento } from './modelos/index.js';

dotenv.config();

const aplicacion = express();
const puertoServidor = Number(process.env.PUERTO_SERVIDOR) || 4000;

aplicacion.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    exposedHeaders: ['Content-Disposition']
  })
);
aplicacion.use(express.json({ limit: '15mb' }));
aplicacion.use(express.urlencoded({ extended: true, limit: '15mb' }));

aplicacion.get('/api/estado', (req, res) => {
  res.status(200).json({
    exito: true,
    sistema: 'Box - Gestión Integral de Activos IT',
    empresa: 'Industrias Rodanol, S.A.',
    estado: 'OPERATIVO'
  });
});

aplicacion.use('/api', enrutadorPrincipal);
aplicacion.use(manejadorErrores);

const sembrarDatosIniciales = async () => {
  const cantidadActivos = await Activo.count();
  if (cantidadActivos === 0) {
    await Activo.bulkCreate([
      {
        codigo: 'V-01',
        tipo_activo: 'LAPTOP',
        marca: 'VIT',
        modelo: 'M2420',
        serial: 'VIT-998821',
        caracteristicas: {
          procesador: 'Intel Core i5',
          memoria_ram: '8 GB DDR3',
          almacenamiento: 'SSD 240 GB',
          sistema_operativo: 'Windows 10 Pro'
        },
        departamento: 'Ventas y Comercialización',
        usuario_custodio: 'Carlos Mendoza',
        estado: 'FUNCIONAL',
        es_rotativo: true,
        proveedor: 'Suministros Tecnológicos Valencia C.A.',
        numero_factura: 'FAC-2026-00412',
        fecha_compra: '2026-06-15',
        meses_garantia: 12
      },
      {
        codigo: 'M-05',
        tipo_activo: 'MONITOR',
        marca: 'HP',
        modelo: 'V22v G5',
        serial: 'HP-MON-4451',
        caracteristicas: {
          detalles_adicionales: 'Monitor LED 21.5 pulgadas FHD HDMI/VGA'
        },
        departamento: 'Control de Calidad',
        usuario_custodio: 'María Fernanda Pérez',
        estado: 'FUNCIONAL',
        es_rotativo: true,
        proveedor: 'CompuMayor Industrial',
        numero_factura: 'FAC-2025-1190',
        fecha_compra: '2025-11-25',
        meses_garantia: 12
      },
      {
        codigo: 'P-01',
        tipo_activo: 'IMPRESORA',
        marca: 'HP',
        modelo: 'Color LaserJet Pro M254dw',
        serial: 'VNB3K11229',
        caracteristicas: {
          direccion_ip: '192.168.10.45',
          detalles_adicionales: 'Impresora Láser a Color Departamental (Usa W2020A-W2023A)'
        },
        departamento: 'Administración y Finanzas',
        usuario_custodio: 'Uso Compartido Administración',
        estado: 'FUNCIONAL',
        es_rotativo: false,
        proveedor: 'OfiTech Venezuela',
        numero_factura: 'FAC-2024-0812',
        fecha_compra: '2024-05-10',
        meses_garantia: 12
      }
    ]);

    await Insumo.bulkCreate([
      {
        codigo_referencia: 'W2020A',
        nombre_descripcion: 'Tóner HP 414A Negro Original',
        marca: 'HP',
        modelos_compatibles: 'HP Color LaserJet Pro M254dw / M479fdw',
        color: 'BLACK',
        cantidad_actual: 5,
        cantidad_minima: 2
      },
      {
        codigo_referencia: 'W2021A',
        nombre_descripcion: 'Tóner HP 414A Cian Original',
        marca: 'HP',
        modelos_compatibles: 'HP Color LaserJet Pro M254dw / M479fdw',
        color: 'CYAN',
        cantidad_actual: 1,
        cantidad_minima: 2
      },
      {
        codigo_referencia: 'CF230A',
        nombre_descripcion: 'Tóner HP 30A Negro LaserJet',
        marca: 'HP',
        modelos_compatibles: 'HP LaserJet Pro M203dw / MFP M227fdw',
        color: 'BLACK',
        cantidad_actual: 4,
        cantidad_minima: 2
      },
      {
        codigo_referencia: 'CRG137',
        nombre_descripcion: 'Tóner Canon 137 Negro',
        marca: 'Canon',
        modelos_compatibles: 'Canon imageCLASS MF232w / MF244dw',
        color: 'BLACK',
        cantidad_actual: 2,
        cantidad_minima: 2
      }
    ]);

    await JornadaMantenimiento.create({
      codigo_formulario: 'IR-SI-FO-001',
      titulo_actividad: 'Revisión de SO, archivos temporales, caché y políticas de uso',
      descripcion_tareas:
        'Depuración de carpetas Temp/%temp%, optimización de arranque, verificación de antivirus corporativo y limpieza física.',
      departamento_objetivo: 'Administración y Ventas',
      tecnico_responsable: 'Departamento Soporte IT - Rodanol',
      fecha_inicio: '2026-11-11',
      estado_jornada: 'EN_CURSO'
    });

    console.log('🌱 [Box - Semilla]: Datos iniciales de Industrias Rodanol, S.A. cargados.');
  }
};

const iniciarServidor = async () => {
  await conectarBaseDatos();
  await sembrarDatosIniciales();

  aplicacion.listen(puertoServidor, '0.0.0.0', () => {
    console.log(`🚀 [Box - Backend]: Servidor API ejecutándose en http://0.0.0.0:${puertoServidor}`);
  });
};

iniciarServidor();
