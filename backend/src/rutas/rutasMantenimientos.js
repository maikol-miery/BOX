import { Router } from 'express';
import {
  obtenerJornadasMantenimiento,
  obtenerDetalleJornada,
  crearJornadaMantenimiento,
  eliminarJornadaMantenimiento,
  registrarEjecucionConFirma,
  exportarExcelFormatoInstitucional
} from '../controladores/controladorMantenimientos.js';
import { validarEsquema } from '../middlewares/validarEsquema.js';
import {
  esquemaCrearJornadaMantenimiento,
  esquemaRegistrarEjecucionMantenimiento
} from '../esquemas/esquemaMantenimiento.js';

const enrutadorMantenimientos = Router();

enrutadorMantenimientos.get('/', obtenerJornadasMantenimiento);
enrutadorMantenimientos.get('/:id', obtenerDetalleJornada);
enrutadorMantenimientos.post(
  '/',
  validarEsquema(esquemaCrearJornadaMantenimiento),
  crearJornadaMantenimiento
);
enrutadorMantenimientos.delete('/:id', eliminarJornadaMantenimiento);
enrutadorMantenimientos.post(
  '/:jornadaId/registros',
  validarEsquema(esquemaRegistrarEjecucionMantenimiento),
  registrarEjecucionConFirma
);
enrutadorMantenimientos.get('/:id/exportar-excel', exportarExcelFormatoInstitucional);

export default enrutadorMantenimientos;
