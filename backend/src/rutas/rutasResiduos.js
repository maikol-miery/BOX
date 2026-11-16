import { Router } from 'express';
import {
  obtenerResiduosElectronicos,
  crearResiduoElectronico
} from '../controladores/controladorResiduos.js';
import { validarEsquema } from '../middlewares/validarEsquema.js';
import { esquemaCrearResiduo } from '../esquemas/esquemaResiduo.js';

const enrutadorResiduos = Router();

enrutadorResiduos.get('/', obtenerResiduosElectronicos);
enrutadorResiduos.post('/', validarEsquema(esquemaCrearResiduo), crearResiduoElectronico);

export default enrutadorResiduos;
