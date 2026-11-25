<script setup>
import QRCode from 'qrcode';

const { peticion } = usarApi();
const listaActivos = ref([]);
const imagenesQr = ref({});
const filtroDepartamento = ref('');
const filtroTipoEquipo = ref('');
const tamanoEtiqueta = ref('pequena');

const opcionesTamano = [
  { label: 'Mini (7 por fila)', value: 'mini' },
  { label: 'Pequeña (6 por fila)', value: 'pequena' },
  { label: 'Mediana (5 por fila)', value: 'mediana' },
  { label: 'Estándar (4 por fila)', value: 'estandar' },
  { label: 'Banderita para Cables (3 por fila)', value: 'banderita' }
];

const estilosPorTamano = {
  mini: {
    cuadricula: 'grid-cols-3 sm:grid-cols-5 md:grid-cols-7 print:grid-cols-7 gap-2 print:gap-1',
    tarjeta: 'p-1.5 rounded-lg border',
    qr: 'w-14 h-14',
    marca: 'text-[8px]',
    empresa: 'hidden',
    codigo: 'text-xs',
    detalle: 'text-[8px]'
  },
  pequena: {
    cuadricula: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 print:grid-cols-6 gap-2.5 print:gap-1.5',
    tarjeta: 'p-2 rounded-lg border',
    qr: 'w-16 h-16',
    marca: 'text-[9px]',
    empresa: 'text-[7px]',
    codigo: 'text-sm',
    detalle: 'text-[8px]'
  },
  mediana: {
    cuadricula: 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 print:grid-cols-5 gap-3 print:gap-2',
    tarjeta: 'p-2.5 rounded-xl border',
    qr: 'w-20 h-20',
    marca: 'text-[10px]',
    empresa: 'text-[8px]',
    codigo: 'text-base',
    detalle: 'text-[9px]'
  },
  estandar: {
    cuadricula: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-4 gap-4 print:gap-3',
    tarjeta: 'p-4 rounded-xl border-2',
    qr: 'w-28 h-28',
    marca: 'text-[11px]',
    empresa: 'text-[9px]',
    codigo: 'text-2xl',
    detalle: 'text-[10px]'
  },
  banderita: {
    cuadricula: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-2 print:gap-1.5'
  }
};

const estiloActual = computed(() => estilosPorTamano[tamanoEtiqueta.value] || estilosPorTamano.pequena);

const cargarActivosYGenerarQr = async () => {
  const respuesta = await peticion('/activos');
  listaActivos.value = respuesta.datos;

  for (const activo of listaActivos.value) {
    imagenesQr.value[activo.codigo] = await QRCode.toDataURL(activo.codigo, {
      width: 220,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  }
};

const opcionesTipoEquipo = computed(() => {
  const tiposUnicos = [...new Set(listaActivos.value.map((a) => a.tipo_activo).filter(Boolean))].sort();
  return [
    { label: 'Todos los equipos', value: '' },
    ...tiposUnicos.map((tipo) => ({ label: tipo, value: tipo }))
  ];
});

const activosFiltrados = computed(() => {
  return listaActivos.value.filter((a) => {
    const coincideDepto =
      !filtroDepartamento.value ||
      (a.departamento || '').toLowerCase().includes(filtroDepartamento.value.toLowerCase());
    const coincideTipo =
      !filtroTipoEquipo.value || a.tipo_activo === filtroTipoEquipo.value;
    return coincideDepto && coincideTipo;
  });
});

const imprimirEtiquetas = () => {
  window.print();
};

onMounted(() => {
  cargarActivosYGenerarQr();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Barra de Controles (Oculta al imprimir) -->
    <div class="ocultar-en-impresion flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-zinc-950 dark:text-white">
          Generador de Etiquetas QR Imprimibles
        </h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          Cuadrícula compacta para aprovechar al máximo cada hoja de papel en Industrias Rodanol, S.A.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <USelect
          v-model="tamanoEtiqueta"
          :options="opcionesTamano"
          option-attribute="label"
          value-attribute="value"
          class="w-48"
        />
        <USelect
          v-model="filtroTipoEquipo"
          :options="opcionesTipoEquipo"
          option-attribute="label"
          value-attribute="value"
          class="w-44"
        />
        <UInput
          v-model="filtroDepartamento"
          placeholder="Filtrar por departamento..."
          icon="i-heroicons-funnel"
        />
        <UButton
          color="primary"
          icon="i-heroicons-printer"
          label="Imprimir Cuadrícula QR"
          @click="imprimirEtiquetas"
        />
      </div>
    </div>

    <!-- Cuadrícula Imprimible (@media print) -->
    <div v-if="tamanoEtiqueta === 'banderita'" class="grid" :class="estiloActual.cuadricula">
      <div
        v-for="activo in activosFiltrados"
        :key="activo.id"
        class="bg-white text-zinc-950 border border-zinc-800 rounded-md p-1.5 flex items-center justify-between gap-1 shadow-sm print:shadow-none print:break-inside-avoid"
      >
        <!-- Cara 1 de la banderita -->
        <div class="flex items-center gap-1.5 flex-1 min-w-0">
          <img
            v-if="imagenesQr[activo.codigo]"
            :src="imagenesQr[activo.codigo]"
            :alt="activo.codigo"
            class="w-11 h-11 object-contain shrink-0"
          />
          <div class="min-w-0 text-left">
            <p class="text-[7px] font-black uppercase text-cobalto-600 leading-none">RODANOL</p>
            <p class="text-xs font-black font-mono text-zinc-950 leading-tight">{{ activo.codigo }}</p>
            <p class="text-[7px] font-bold text-zinc-600 truncate">{{ activo.tipo_activo }}</p>
          </div>
        </div>

        <!-- Zona central para abrazar y doblar sobre el cable -->
        <div class="w-4 self-stretch border-x border-dashed border-zinc-400 flex items-center justify-center shrink-0">
          <span class="text-[7px] text-zinc-400 -rotate-90 whitespace-nowrap select-none">DOBLAR</span>
        </div>

        <!-- Cara 2 de la banderita (visible por detrás al doblar) -->
        <div class="flex items-center justify-end gap-1.5 flex-1 min-w-0">
          <div class="min-w-0 text-right">
            <p class="text-[7px] font-black uppercase text-cobalto-600 leading-none">RODANOL</p>
            <p class="text-xs font-black font-mono text-zinc-950 leading-tight">{{ activo.codigo }}</p>
            <p class="text-[7px] font-bold text-zinc-600 truncate">{{ activo.tipo_activo }}</p>
          </div>
          <img
            v-if="imagenesQr[activo.codigo]"
            :src="imagenesQr[activo.codigo]"
            :alt="activo.codigo"
            class="w-11 h-11 object-contain shrink-0"
          />
        </div>
      </div>
    </div>

    <div v-else class="grid" :class="estiloActual.cuadricula">
      <div
        v-for="activo in activosFiltrados"
        :key="activo.id"
        class="bg-white text-zinc-950 border-zinc-800 flex flex-col items-center text-center shadow-sm print:shadow-none print:break-inside-avoid"
        :class="estiloActual.tarjeta"
      >
        <p class="font-black uppercase tracking-wider text-cobalto-600 leading-tight" :class="estiloActual.marca">
          BOX - RODANOL
        </p>
        <p class="font-semibold text-zinc-500 leading-tight mb-0.5" :class="estiloActual.empresa">
          RODANOL • IT
        </p>

        <img
          v-if="imagenesQr[activo.codigo]"
          :src="imagenesQr[activo.codigo]"
          :alt="activo.codigo"
          class="object-contain my-0.5"
          :class="estiloActual.qr"
        />

        <p class="font-black tracking-wider font-mono text-zinc-950 leading-none mt-0.5" :class="estiloActual.codigo">
          {{ activo.codigo }}
        </p>
        <p class="font-bold text-zinc-700 truncate max-w-full mt-0.5 leading-tight" :class="estiloActual.detalle">
          {{ activo.tipo_activo }} {{ activo.marca }}
        </p>
        <p class="text-zinc-500 truncate max-w-full leading-tight" :class="estiloActual.detalle">
          {{ activo.departamento }}
        </p>
      </div>
    </div>
  </div>
</template>
