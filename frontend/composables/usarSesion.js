const MODULOS_RUTAS = [
  { modulo: 'tablero', ruta: '/' },
  { modulo: 'activos', ruta: '/activos' },
  { modulo: 'etiquetas', ruta: '/activos/etiquetas' },
  { modulo: 'mantenimientos', ruta: '/mantenimientos' },
  { modulo: 'insumos', ruta: '/insumos' },
  { modulo: 'prestamos', ruta: '/prestamos' },
  { modulo: 'residuos', ruta: '/residuos' }
];

export const usarSesion = () => {
  const tokenSesion = useState('box_token_sesion', () => '');
  const usuarioActual = useState('box_usuario_actual', () => null);
  const sesionInicializada = useState('box_sesion_inicializada', () => false);

  const cargarSesionLocal = () => {
    if (!import.meta.client || sesionInicializada.value) return;
    try {
      const tokenGuardado = localStorage.getItem('box_token') || '';
      const usuarioGuardado = localStorage.getItem('box_usuario');
      tokenSesion.value = tokenGuardado;
      usuarioActual.value = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch {
      tokenSesion.value = '';
      usuarioActual.value = null;
    } finally {
      sesionInicializada.value = true;
    }
  };

  const guardarSesion = (token, usuario) => {
    tokenSesion.value = token;
    usuarioActual.value = usuario;
    sesionInicializada.value = true;
    if (import.meta.client) {
      localStorage.setItem('box_token', token);
      localStorage.setItem('box_usuario', JSON.stringify(usuario));
    }
  };

  const cerrarSesion = async (redirigir = true) => {
    tokenSesion.value = '';
    usuarioActual.value = null;
    sesionInicializada.value = true;
    if (import.meta.client) {
      localStorage.removeItem('box_token');
      localStorage.removeItem('box_usuario');
    }
    if (redirigir) {
      await navigateTo('/acceso');
    }
  };

  const esAdmin = computed(() => usuarioActual.value?.rol === 'ADMIN');

  const tienePermiso = (modulo, accion = 'ver') => {
    if (!usuarioActual.value) return false;
    if (usuarioActual.value.rol === 'ADMIN') return true;
    return Boolean(usuarioActual.value.permisos?.[modulo]?.[accion]);
  };

  const obtenerRutaPermitida = () => {
    if (!usuarioActual.value) return '/acceso';
    if (usuarioActual.value.rol === 'ADMIN') return '/';
    const encontrado = MODULOS_RUTAS.find((item) => tienePermiso(item.modulo, 'ver'));
    return encontrado ? encontrado.ruta : '/acceso';
  };

  return {
    tokenSesion,
    usuarioActual,
    esAdmin,
    cargarSesionLocal,
    guardarSesion,
    cerrarSesion,
    tienePermiso,
    obtenerRutaPermitida
  };
};
