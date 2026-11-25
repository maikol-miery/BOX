import crypto from 'node:crypto';

const SECRETO_TOKEN =
  process.env.SECRETO_JWT || 'box_rodanol_clave_secreta_local_2026';
const DURACION_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

export const hashearClave = (clavePlana) => {
  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(clavePlana, sal, 64).toString('hex');
  return `${sal}:${hash}`;
};

export const verificarClave = (clavePlana, claveHashAlmacenada) => {
  if (!claveHashAlmacenada || !claveHashAlmacenada.includes(':')) {
    return false;
  }
  const [sal, hashOriginalHex] = claveHashAlmacenada.split(':');
  const hashOriginal = Buffer.from(hashOriginalHex, 'hex');
  const hashCalculado = crypto.scryptSync(clavePlana, sal, 64);

  if (hashOriginal.length !== hashCalculado.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashOriginal, hashCalculado);
};

const codificarBase64Url = (objeto) => {
  return Buffer.from(JSON.stringify(objeto)).toString('base64url');
};

export const firmarToken = (datosUsuario) => {
  const encabezado = codificarBase64Url({ alg: 'HS256', typ: 'JWT' });
  const cuerpo = codificarBase64Url({
    ...datosUsuario,
    exp: Date.now() + DURACION_TOKEN_MS
  });
  const firma = crypto
    .createHmac('sha256', SECRETO_TOKEN)
    .update(`${encabezado}.${cuerpo}`)
    .digest('base64url');

  return `${encabezado}.${cuerpo}.${firma}`;
};

export const verificarToken = (token) => {
  try {
    const partes = String(token || '').split('.');
    if (partes.length !== 3) return null;

    const [encabezado, cuerpo, firmaRecibida] = partes;
    const firmaEsperada = crypto
      .createHmac('sha256', SECRETO_TOKEN)
      .update(`${encabezado}.${cuerpo}`)
      .digest('base64url');

    const bufRecibida = Buffer.from(firmaRecibida);
    const bufEsperada = Buffer.from(firmaEsperada);
    if (
      bufRecibida.length !== bufEsperada.length ||
      !crypto.timingSafeEqual(bufRecibida, bufEsperada)
    ) {
      return null;
    }

    const datos = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'));
    if (!datos.exp || Date.now() > datos.exp) {
      return null;
    }

    return datos;
  } catch {
    return null;
  }
};
