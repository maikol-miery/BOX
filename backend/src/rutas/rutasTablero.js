import { Router } from 'express';
import { obtenerResumenTablero } from '../controladores/controladorTablero.js';

const enrutadorTablero = Router();

enrutadorTablero.get('/resumen', obtenerResumenTablero);

export default enrutadorTablero;
