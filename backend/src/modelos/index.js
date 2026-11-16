import { conexionBaseDatos } from '../config/baseDatos.js';
import { Activo } from './Activo.js';
import { JornadaMantenimiento } from './JornadaMantenimiento.js';
import { RegistroMantenimiento } from './RegistroMantenimiento.js';
import { Insumo } from './Insumo.js';
import { EntregaInsumo } from './EntregaInsumo.js';
import { Prestamo } from './Prestamo.js';
import { ResiduoElectronico } from './ResiduoElectronico.js';

// 1. Relaciones de Mantenimiento Preventivo (IR-SI-FO-001)
JornadaMantenimiento.hasMany(RegistroMantenimiento, {
  foreignKey: 'jornada_id',
  as: 'registros_ejecucion',
  onDelete: 'CASCADE'
});
RegistroMantenimiento.belongsTo(JornadaMantenimiento, {
  foreignKey: 'jornada_id',
  as: 'jornada'
});

Activo.hasMany(RegistroMantenimiento, {
  foreignKey: 'activo_id',
  as: 'historial_mantenimientos',
  onDelete: 'RESTRICT'
});
RegistroMantenimiento.belongsTo(Activo, {
  foreignKey: 'activo_id',
  as: 'activo'
});

// 2. Relaciones de Insumos de Impresión (Tóners y Cartuchos)
Insumo.hasMany(EntregaInsumo, {
  foreignKey: 'insumo_id',
  as: 'historial_entregas',
  onDelete: 'RESTRICT'
});
EntregaInsumo.belongsTo(Insumo, {
  foreignKey: 'insumo_id',
  as: 'insumo'
});

Activo.hasMany(EntregaInsumo, {
  foreignKey: 'impresora_id',
  as: 'consumos_toner',
  onDelete: 'RESTRICT'
});
EntregaInsumo.belongsTo(Activo, {
  foreignKey: 'impresora_id',
  as: 'impresora'
});

// 3. Relaciones de Préstamos Temporales y Custodia
Activo.hasMany(Prestamo, {
  foreignKey: 'activo_id',
  as: 'historial_prestamos',
  onDelete: 'RESTRICT'
});
Prestamo.belongsTo(Activo, {
  foreignKey: 'activo_id',
  as: 'activo'
});

// 4. Relaciones de Banco de Pruebas y Residuos Electrónicos (RAEE)
Activo.hasMany(ResiduoElectronico, {
  foreignKey: 'activo_id',
  as: 'registros_raee',
  onDelete: 'RESTRICT'
});
ResiduoElectronico.belongsTo(Activo, {
  foreignKey: 'activo_id',
  as: 'activo'
});

export {
  conexionBaseDatos,
  Activo,
  JornadaMantenimiento,
  RegistroMantenimiento,
  Insumo,
  EntregaInsumo,
  Prestamo,
  ResiduoElectronico
};
