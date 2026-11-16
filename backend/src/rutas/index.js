import { Router } from 'express';
import enrutadorTablero from './rutasTablero.js';
import enrutadorActivos from './rutasActivos.js';
import enrutadorMantenimientos from './rutasMantenimientos.js';
import enrutadorInsumos from './rutasInsumos.js';
import enrutadorPrestamos from './rutasPrestamos.js';
import enrutadorResiduos from './rutasResiduos.js';

const enrutadorPrincipal = Router();

enrutadorPrincipal.use('/tablero', enrutadorTablero);
enrutadorPrincipal.use('/activos', enrutadorActivos);
enrutadorPrincipal.use('/mantenimientos', enrutadorMantenimientos);
enrutadorPrincipal.use('/insumos', enrutadorInsumos);
enrutadorPrincipal.use('/prestamos', enrutadorPrestamos);
enrutadorPrincipal.use('/residuos', enrutadorResiduos);

export default enrutadorPrincipal;
