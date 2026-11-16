import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const Activo = conexionBaseDatos.define('activos', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    comment: 'Código único de inventario (ej. V-01, M-05, P-01)'
  },
  tipo_activo: {
    type: DataTypes.ENUM(
      'SOBREMESA',
      'LAPTOP',
      'SERVIDOR',
      'MONITOR',
      'IMPRESORA',
      'PERIFERICO',
      'CABLE'
    ),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  serial: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  caracteristicas: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Especificaciones técnicas: procesador, memoria_ram, almacenamiento, direccion_ip, extras'
  },
  departamento: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  usuario_custodio: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM(
      'FUNCIONAL',
      'MANTENIMIENTO',
      'DAÑADO',
      'DESINCORPORADO'
    ),
    allowNull: false,
    defaultValue: 'FUNCIONAL'
  },
  es_rotativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el equipo está habilitado para préstamos temporales'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Módulo 6: Control Ligero de Garantías
  proveedor: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  numero_factura: {
    type: DataTypes.STRING(80),
    allowNull: true
  },
  fecha_compra: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  meses_garantia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  resumen_garantia: {
    type: DataTypes.VIRTUAL,
    get() {
      const fechaCompra = this.getDataValue('fecha_compra');
      const mesesGarantia = Number(this.getDataValue('meses_garantia') || 0);

      if (!fechaCompra || mesesGarantia <= 0) {
        return {
          estado_garantia: 'SIN GARANTIA',
          fecha_vencimiento: null,
          dias_restantes: null
        };
      }

      const [anio, mes, dia] = String(fechaCompra).split('-').map(Number);
      const fechaVencimiento = new Date(anio, mes - 1 + mesesGarantia, dia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaVencimiento.setHours(0, 0, 0, 0);

      const diferenciaMs = fechaVencimiento.getTime() - hoy.getTime();
      const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
      const fechaFormateada = fechaVencimiento.toISOString().split('T')[0];

      let estadoGarantia = 'VIGENTE';
      if (diasRestantes < 0) {
        estadoGarantia = 'VENCIDA';
      } else if (diasRestantes <= 30) {
        estadoGarantia = 'POR VENCER';
      }

      return {
        estado_garantia: estadoGarantia,
        fecha_vencimiento: fechaFormateada,
        dias_restantes: diasRestantes
      };
    }
  }
});
