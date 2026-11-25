const resolverModuloPorRuta = (ruta) => {
  if (ruta === '/') return 'tablero';
  if (ruta.startsWith('/activos/etiquetas')) return 'etiquetas';
  if (ruta.startsWith('/activos')) return 'activos';
  if (ruta.startsWith('/mantenimientos')) return 'mantenimientos';
  if (ruta.startsWith('/insumos')) return 'insumos';
  if (ruta.startsWith('/prestamos')) return 'prestamos';
  if (ruta.startsWith('/residuos')) return 'residuos';
  if (ruta.startsWith('/usuarios')) return 'usuarios_admin';
  return null;
};

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const {
    tokenSesion,
    usuarioActual,
    esAdmin,
    cargarSesionLocal,
    tienePermiso,
    obtenerRutaPermitida
  } = usarSesion();

  cargarSesionLocal();

  if (to.path === '/acceso') {
    if (tokenSesion.value && usuarioActual.value) {
      const destino = obtenerRutaPermitida();
      if (destino !== '/acceso') {
        return navigateTo(destino);
      }
    }
    return;
  }

  if (!tokenSesion.value || !usuarioActual.value) {
    return navigateTo('/acceso');
  }

  const modulo = resolverModuloPorRuta(to.path);
  if (!modulo) return;

  if (modulo === 'usuarios_admin') {
    if (!esAdmin.value) {
      return navigateTo(obtenerRutaPermitida());
    }
    return;
  }

  if (!tienePermiso(modulo, 'ver')) {
    const rutaAlternativa = obtenerRutaPermitida();
    if (rutaAlternativa !== to.path) {
      return navigateTo(rutaAlternativa);
    }
  }
});
