import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const Prestamo = conexionBaseDatos.define('prestamos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  trabajador_solicitante: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  departamento_solicitante: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  motivo_prestamo: {
    type: DataTypes.STRING(250),
    allowNull: true
  },
  accesorios_incluidos: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    comment: 'Lista de chequeo de accesorios: ["Cargador", "Mouse", "Adaptador HDMI", "Cable Poder"]'
  },
  fecha_salida: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_estimada_devolucion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_real_devolucion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estado_prestamo: {
    type: DataTypes.ENUM('ACTIVO', 'VENCIDO', 'DEVUELTO'),
    allowNull: false,
    defaultValue: 'ACTIVO'
  },
  firma_recepcion_base64: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Firma digital del trabajador al recibir el equipo en calidad de préstamo'
  },
  observaciones_entrega: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observaciones_devolucion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tecnico_responsable: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  estado_semaforo: {
    type: DataTypes.VIRTUAL,
    get() {
      const estadoGuardado = this.getDataValue('estado_prestamo');
      if (estadoGuardado === 'DEVUELTO') {
        return 'DEVUELTO';
      }
      const fechaEstimada = this.getDataValue('fecha_estimada_devolucion');
      if (fechaEstimada && new Date(fechaEstimada).getTime() < Date.now()) {
        return 'VENCIDO';
      }
      return 'ACTIVO';
    }
  }
});
