export const usarApi = () => {
  const configuracion = useRuntimeConfig();

  const obtenerUrlBase = (): string => {
    // Al usar '/api', Nuxt redirige internamente por proxy a http://localhost:4000/api
    // evitando bloqueos de Mixed Content cuando el frontend corre en HTTPS autofirmado.
    return configuracion.public.urlApiBackend || '/api';
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
