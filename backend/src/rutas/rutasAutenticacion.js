import { Router } from 'express';
import {
  estadoInicial,
  registrarAdministradorInicial,
  iniciarSesion,
  obtenerPerfilActual
} from '../controladores/controladorAutenticacion.js';
import { validarEsquema } from '../middlewares/validarEsquema.js';
import {
  esquemaRegistroInicial,
  esquemaIniciarSesion
} from '../esquemas/esquemaUsuario.js';
import { requerirAutenticacion } from '../middlewares/autenticacion.js';

const enrutadorAutenticacion = Router();

enrutadorAutenticacion.get('/estado-inicial', estadoInicial);
enrutadorAutenticacion.post(
  '/registro-inicial',
  validarEsquema(esquemaRegistroInicial),
  registrarAdministradorInicial
);
enrutadorAutenticacion.post(
  '/iniciar-sesion',
  validarEsquema(esquemaIniciarSesion),
  iniciarSesion
);
enrutadorAutenticacion.get('/perfil', requerirAutenticacion, obtenerPerfilActual);

export default enrutadorAutenticacion;
