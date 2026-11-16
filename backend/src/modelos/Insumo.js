import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const Insumo = conexionBaseDatos.define('insumos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_referencia: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Ej: W2020A, W2021A, CF230A, CRG137'
  },
  nombre_descripcion: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  modelos_compatibles: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Impresoras compatibles con este consumible'
  },
  color: {
    type: DataTypes.ENUM('BLACK', 'CYAN', 'MAGENTA', 'YELLOW'),
    allowNull: false,
    defaultValue: 'BLACK'
  },
  cantidad_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  cantidad_minima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  }
});
