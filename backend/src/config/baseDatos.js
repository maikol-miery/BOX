import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const nombreBaseDatos = process.env.BD_NOMBRE || 'box_rodanol_bd';
const usuarioBaseDatos = process.env.BD_USUARIO || 'postgres';
const claveBaseDatos = process.env.BD_CLAVE || 'postgres';
const servidorBaseDatos = process.env.BD_SERVIDOR || 'localhost';
const puertoBaseDatos = Number(process.env.BD_PUERTO) || 5432;

const asegurarExistenciaBaseDatos = async () => {
  const clienteAdministrativo = new pg.Client({
    user: usuarioBaseDatos,
    password: claveBaseDatos,
    host: servidorBaseDatos,
    port: puertoBaseDatos,
    database: 'postgres'
  });

  try {
    await clienteAdministrativo.connect();
    const consultaExistencia = await clienteAdministrativo.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [nombreBaseDatos]
    );

    if (consultaExistencia.rowCount === 0) {
      await clienteAdministrativo.query(`CREATE DATABASE "${nombreBaseDatos}"`);
      console.log(`✅ [Box - PostgreSQL]: Base de datos '${nombreBaseDatos}' creada automáticamente.`);
    }
  } catch (error) {
    console.warn('⚠️ [Box - Aviso]: No se pudo verificar/crear automáticamente la base de datos:', error.message);
  } finally {
    await clienteAdministrativo.end().catch(() => {});
  }
};

export const conexionBaseDatos = new Sequelize(
  nombreBaseDatos,
  usuarioBaseDatos,
  claveBaseDatos,
  {
    host: servidorBaseDatos,
    port: puertoBaseDatos,
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: true,
      createdAt: 'fecha_creacion',
      updatedAt: 'fecha_actualizacion'
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const conectarBaseDatos = async () => {
  try {
    await asegurarExistenciaBaseDatos();
    await conexionBaseDatos.authenticate();
    console.log('✅ [Box - PostgreSQL]: Conexión establecida correctamente con la base de datos.');
    await conexionBaseDatos.sync();
    console.log('✅ [Box - Sequelize]: Modelos y tablas sincronizados correctamente.');
  } catch (error) {
    console.error('❌ [Box - Error de Base de Datos]: No se pudo conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
};
