export interface ResultadoGarantia {
  estado_garantia: 'VIGENTE' | 'POR VENCER' | 'VENCIDA' | 'SIN GARANTIA';
  fecha_vencimiento: string | null;
  dias_restantes: number | null;
  color_insignia: 'emerald' | 'amber' | 'slate';
  etiqueta_texto: string;
}

export const usarGarantia = () => {
  const calcularEstadoGarantia = (
    fechaCompra?: string | null,
    mesesGarantia?: number | null
  ): ResultadoGarantia => {
    const meses = Number(mesesGarantia || 0);
    if (!fechaCompra || meses <= 0) {
      return {
        estado_garantia: 'SIN GARANTIA',
        fecha_vencimiento: null,
        dias_restantes: null,
        color_insignia: 'slate',
        etiqueta_texto: 'SIN GARANTÍA'
      };
    }

    const partes = String(fechaCompra).split('-').map(Number);
    if (partes.length !== 3) {
      return {
        estado_garantia: 'SIN GARANTIA',
        fecha_vencimiento: null,
        dias_restantes: null,
        color_insignia: 'slate',
        etiqueta_texto: 'SIN GARANTÍA'
      };
    }

    const [anio, mes, dia] = partes;
    const fechaVencimiento = new Date(anio, mes - 1 + meses, dia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);

    const diferenciaMs = fechaVencimiento.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    const fechaFormateada = fechaVencimiento.toISOString().split('T')[0];

    if (diasRestantes < 0) {
      return {
        estado_garantia: 'VENCIDA',
        fecha_vencimiento: fechaFormateada,
        dias_restantes: diasRestantes,
        color_insignia: 'slate',
        etiqueta_texto: `⚪ VENCIDA (${fechaFormateada})`
      };
    }

    if (diasRestantes <= 30) {
      return {
        estado_garantia: 'POR VENCER',
        fecha_vencimiento: fechaFormateada,
        dias_restantes: diasRestantes,
        color_insignia: 'amber',
        etiqueta_texto: `🟡 POR VENCER (${diasRestantes} días)`
      };
    }

    return {
      estado_garantia: 'VIGENTE',
      fecha_vencimiento: fechaFormateada,
      dias_restantes: diasRestantes,
      color_insignia: 'emerald',
      etiqueta_texto: `🟢 VIGENTE (${diasRestantes} días)`
    };
  };

  return {
    calcularEstadoGarantia
  };
};
