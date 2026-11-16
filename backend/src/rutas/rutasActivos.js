import { Router } from 'express';
import {
  obtenerActivos,
  obtenerHojaVidaPorCodigo,
  crearActivo,
  actualizarActivo,
  eliminarActivo
} from '../controladores/controladorActivos.js';
import { validarEsquema } from '../middlewares/validarEsquema.js';
import {
  esquemaCrearActivo,
  esquemaActualizarActivo,
  esquemaParametroCodigoActivo
} from '../esquemas/esquemaActivo.js';

const enrutadorActivos = Router();

enrutadorActivos.get('/', obtenerActivos);
enrutadorActivos.get(
  '/codigo/:codigo',
  validarEsquema(esquemaParametroCodigoActivo),
  obtenerHojaVidaPorCodigo
);
enrutadorActivos.post('/', validarEsquema(esquemaCrearActivo), crearActivo);
enrutadorActivos.put('/:id', validarEsquema(esquemaActualizarActivo), actualizarActivo);
enrutadorActivos.delete('/:id', eliminarActivo);

export default enrutadorActivos;
