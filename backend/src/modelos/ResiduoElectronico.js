import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const ResiduoElectronico = conexionBaseDatos.define('residuos_electronicos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  codigo_acta: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true,
    comment: 'Código único del Acta de Desincorporación (ej. ACTA-RAEE-2026-001)'
  },
  diagnostico_tecnico: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  piezas_faltantes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ej: Falta disco duro, sin memorias RAM'
  },
  componentes_recuperados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ej: Fuente de poder aprovechable, ventilador extraído para canibalización'
  },
  destino_final: {
    type: DataTypes.ENUM('RECICLAJE', 'DONACION', 'DESINCORPORACION'),
    allowNull: false
  },
  fecha_ingreso_banco: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_baja_definitiva: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  tecnico_evaluador: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  autorizado_por: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  observaciones_auditoria: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});
