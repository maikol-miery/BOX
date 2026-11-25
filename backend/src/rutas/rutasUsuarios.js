import { Router } from 'express';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controladores/controladorAutenticacion.js';
import { validarEsquema } from '../middlewares/validarEsquema.js';
import {
  esquemaCrearUsuario,
  esquemaActualizarUsuario
} from '../esquemas/esquemaUsuario.js';
import {
  requerirAutenticacion,
  requerirAdmin
} from '../middlewares/autenticacion.js';

const enrutadorUsuarios = Router();

enrutadorUsuarios.use(requerirAutenticacion, requerirAdmin);

enrutadorUsuarios.get('/', listarUsuarios);
enrutadorUsuarios.post('/', validarEsquema(esquemaCrearUsuario), crearUsuario);
enrutadorUsuarios.put('/:id', validarEsquema(esquemaActualizarUsuario), actualizarUsuario);
enrutadorUsuarios.delete('/:id', eliminarUsuario);

export default enrutadorUsuarios;
