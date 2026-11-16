import { DataTypes } from 'sequelize';
import { conexionBaseDatos } from '../config/baseDatos.js';

export const JornadaMantenimiento = conexionBaseDatos.define('jornadas_mantenimiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_formulario: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'IR-SI-FO-001'
  },
  titulo_actividad: {
    type: DataTypes.STRING(250),
    allowNull: false,
    comment: 'Ej: Revisión de SO, archivos temporales, caché y políticas de uso'
  },
  descripcion_tareas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  departamento_objetivo: {
    type: DataTypes.STRING(120),
    allowNull: false,
    defaultValue: 'TODOS LOS DEPARTAMENTOS'
  },
  tecnico_responsable: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_cierre: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado_jornada: {
    type: DataTypes.ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA'),
    allowNull: false,
    defaultValue: 'EN_CURSO'
  }
});
