import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const PERMISOS_POR_DEFECTO = {
  tablero: { ver: true, editar: false },
  activos: { ver: true, editar: false },
  etiquetas: { ver: true, editar: false },
  mantenimientos: { ver: true, editar: false },
  insumos: { ver: true, editar: false },
  prestamos: { ver: true, editar: false },
  residuos: { ver: true, editar: false }
};

export const PERMISOS_COMPLETOS = {
  tablero: { ver: true, editar: true },
  activos: { ver: true, editar: true },
  etiquetas: { ver: true, editar: true },
  mantenimientos: { ver: true, editar: true },
  insumos: { ver: true, editar: true },
  prestamos: { ver: true, editar: true },
  residuos: { ver: true, editar: true }
};

export const Usuario = conexionBaseDatos.define(
  'usuarios',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_completo: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    nombre_usuario: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true
    },
    clave_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('ADMIN', 'USUARIO'),
      allowNull: false,
      defaultValue: 'USUARIO'
    },
    permisos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: PERMISOS_POR_DEFECTO
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'usuarios',
    underscored: true
  }
);
