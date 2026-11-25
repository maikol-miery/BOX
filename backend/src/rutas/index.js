import { Router } from 'express';
import enrutadorAutenticacion from './rutasAutenticacion.js';
import enrutadorUsuarios from './rutasUsuarios.js';
import enrutadorTablero from './rutasTablero.js';
import enrutadorActivos from './rutasActivos.js';
import enrutadorMantenimientos from './rutasMantenimientos.js';
import enrutadorInsumos from './rutasInsumos.js';
import enrutadorPrestamos from './rutasPrestamos.js';
import enrutadorResiduos from './rutasResiduos.js';
import {
  requerirAutenticacion,
  requerirPermisoModulo
} from '../middlewares/autenticacion.js';

const enrutadorPrincipal = Router();

const protegerModulo = (modulo, modulosLecturaAlternativos = []) => [
  requerirAutenticacion,
  (req, res, next) => {
    const accion = req.method === 'GET' ? 'ver' : 'editar';
    if (accion === 'ver' && modulosLecturaAlternativos.length > 0 && req.usuario?.rol !== 'ADMIN') {
      const modulosPermitidos = [modulo, ...modulosLecturaAlternativos];
      const tieneAlguno = modulosPermitidos.some(
        (m) => req.usuario?.permisos?.[m]?.ver || req.usuario?.permisos?.[m]?.editar
      );
      if (tieneAlguno) {
        return next();
      }
    }
    return requerirPermisoModulo(modulo, accion)(req, res, next);
  }
];

enrutadorPrincipal.use('/auth', enrutadorAutenticacion);
enrutadorPrincipal.use('/usuarios', enrutadorUsuarios);
enrutadorPrincipal.use('/tablero', ...protegerModulo('tablero'), enrutadorTablero);
enrutadorPrincipal.use(
  '/activos',
  ...protegerModulo('activos', ['etiquetas', 'prestamos', 'insumos', 'mantenimientos', 'residuos']),
  enrutadorActivos
);
enrutadorPrincipal.use('/mantenimientos', ...protegerModulo('mantenimientos'), enrutadorMantenimientos);
enrutadorPrincipal.use('/insumos', ...protegerModulo('insumos'), enrutadorInsumos);
enrutadorPrincipal.use('/prestamos', ...protegerModulo('prestamos'), enrutadorPrestamos);
enrutadorPrincipal.use('/residuos', ...protegerModulo('residuos'), enrutadorResiduos);

export default enrutadorPrincipal;
