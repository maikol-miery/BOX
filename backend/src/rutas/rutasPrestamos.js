import { Router } from 'express';
import {
  obtenerPrestamos,
  crearPrestamo,
  registrarDevolucionPrestamo
} from '../controladores/controladorPrestamos.js';
import { validarEsquema } from '../middlewares/validarEsquema.js';
import {
  esquemaCrearPrestamo,
  esquemaDevolverPrestamo
} from '../esquemas/esquemaPrestamo.js';

const enrutadorPrestamos = Router();

enrutadorPrestamos.get('/', obtenerPrestamos);
enrutadorPrestamos.post('/', validarEsquema(esquemaCrearPrestamo), crearPrestamo);
enrutadorPrestamos.put(
  '/:id/devolver',
  validarEsquema(esquemaDevolverPrestamo),
  registrarDevolucionPrestamo
);

export default enrutadorPrestamos;
