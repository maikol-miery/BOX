export const usarApi = () => {
  const configuracion = useRuntimeConfig();

  const obtenerUrlBase = () => {
    // Al usar '/api', Nuxt redirige internamente por proxy a http://localhost:4000/api
    // evitando bloqueos de Mixed Content cuando el frontend corre en HTTPS autofirmado.
    return configuracion.public.urlApiBackend || '/api';
  };

  const obtenerEncabezadosAuth = () => {
    if (!import.meta.client) return {};
    const token = localStorage.getItem('box_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const manejarErrorAuth = async (error) => {
    if (error?.status === 401 && import.meta.client) {
      localStorage.removeItem('box_token');
      localStorage.removeItem('box_usuario');
      const tokenState = useState('box_token_sesion');
      const userState = useState('box_usuario_actual');
      if (tokenState) tokenState.value = '';
      if (userState) userState.value = null;
      if (window.location.pathname !== '/acceso') {
        await navigateTo('/acceso');
      }
    }
    throw error;
  };

  const peticion = async (ruta, opciones = {}) => {
    const urlBase = obtenerUrlBase();
    try {
      return await $fetch(`${urlBase}${ruta}`, {
        ...opciones,
        headers: {
          ...obtenerEncabezadosAuth(),
          ...(opciones.headers || {})
        }
      });
    } catch (error) {
      return await manejarErrorAuth(error);
    }
  };

  const descargarArchivoExcel = async (ruta, nombreArchivoDescarga) => {
    const urlBase = obtenerUrlBase();
    try {
      const respuestaBlob = await $fetch(`${urlBase}${ruta}`, {
        method: 'GET',
        responseType: 'blob',
        headers: {
          ...obtenerEncabezadosAuth()
        }
      });

      const urlObjeto = window.URL.createObjectURL(respuestaBlob);
      const enlace = document.createElement('a');
      enlace.href = urlObjeto;
      enlace.setAttribute('download', nombreArchivoDescarga);
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(urlObjeto);
    } catch (error) {
      return await manejarErrorAuth(error);
    }
  };

  return {
    obtenerUrlBase,
    urlBase: obtenerUrlBase(),
    peticion,
    descargarArchivoExcel
  };
};
