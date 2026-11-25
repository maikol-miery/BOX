import { Router } from 'express';
import {
  obtenerInsumos,
  obtenerHistorialEntregasInsumos,
  crearInsumo,
  actualizarInsumo,
  registrarSalidaInsumo,
  eliminarInsumo
} from '../controladores/controladorInsumos.js';
import { validarEsquema } from '../middlewares/validarEsquema.js';
import {
  esquemaCrearInsumo,
  esquemaActualizarInsumo,
  esquemaRegistrarEntregaInsumo
} from '../esquemas/esquemaInsumo.js';

const enrutadorInsumos = Router();

enrutadorInsumos.get('/', obtenerInsumos);
enrutadorInsumos.get('/entregas', obtenerHistorialEntregasInsumos);
enrutadorInsumos.post('/', validarEsquema(esquemaCrearInsumo), crearInsumo);
enrutadorInsumos.put('/:id', validarEsquema(esquemaActualizarInsumo), actualizarInsumo);
enrutadorInsumos.delete('/:id', eliminarInsumo);
enrutadorInsumos.post(
  '/entregas',
  validarEsquema(esquemaRegistrarEntregaInsumo),
  registrarSalidaInsumo
);

export default enrutadorInsumos;
