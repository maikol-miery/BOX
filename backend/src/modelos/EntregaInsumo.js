import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const EntregaInsumo = conexionBaseDatos.define('entregas_insumos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  insumo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  impresora_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Referencia al activo de tipo IMPRESORA donde se instaló el tóner'
  },
  departamento_destino: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  usuario_receptor: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  tecnico_entregador: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  cantidad_entregada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  contador_paginas: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});
