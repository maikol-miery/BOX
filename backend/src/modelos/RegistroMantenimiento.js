import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const RegistroMantenimiento = conexionBaseDatos.define('registros_mantenimiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jornada_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  activo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_atendido: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  departamento: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  ejecutado: {
    type: DataTypes.ENUM('SI', 'NO'),
    allowNull: false,
    defaultValue: 'SI'
  },
  fecha_ejecucion: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  firma_conformidad_base64: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Imagen en formato Base64 capturada del lienzo táctil HTML5'
  }
});
