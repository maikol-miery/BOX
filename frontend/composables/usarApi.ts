export const usarApi = () => {
  const configuracion = useRuntimeConfig();

  const obtenerUrlBase = (): string => {
    let url = configuracion.public.urlApiBackend || 'http://localhost:4000/api';

    // Si estamos en el navegador del cliente (móvil, tablet u otra PC en red)
    if (import.meta.client && typeof window !== 'undefined') {
      const anfitrionActual = window.location.hostname;
      // Si entraste por la IP de la red local (ej. 192.168.1.115), apunta al backend en esa misma IP
      if (anfitrionActual && anfitrionActual !== 'localhost' && anfitrionActual !== '127.0.0.1') {
        url = url.replace(/localhost|127\.0\.0\.1/, anfitrionActual);
      }
    }

    return url;
  };

  const peticion = async <T = any>(
    ruta: string,
    opciones: Record<string, any> = {}
  ): Promise<T> => {
    const urlBase = obtenerUrlBase();
    return await $fetch<T>(`${urlBase}${ruta}`, {
      ...opciones,
      headers: {
        ...(opciones.headers || {})
      }
    });
  };

  const descargarArchivoExcel = async (ruta: string, nombreArchivoDescarga: string) => {
    const urlBase = obtenerUrlBase();
    const respuestaBlob = await $fetch<Blob>(`${urlBase}${ruta}`, {
      method: 'GET',
      responseType: 'blob'
    });

    const urlObjeto = window.URL.createObjectURL(respuestaBlob);
    const enlace = document.createElement('a');
    enlace.href = urlObjeto;
    enlace.setAttribute('download', nombreArchivoDescarga);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.URL.revokeObjectURL(urlObjeto);
  };

  return {
    obtenerUrlBase,
    urlBase: obtenerUrlBase(),
    peticion,
    descargarArchivoExcel
  };
};
