<script setup lang="ts">
import QRCode from 'qrcode';

const { peticion } = usarApi();
const listaActivos = ref<any[]>([]);
const imagenesQr = ref<Record<string, string>>({});
const filtroDepartamento = ref('');

const cargarActivosYGenerarQr = async () => {
  const respuesta = await peticion<{ exito: boolean; datos: any[] }>('/activos');
  listaActivos.value = respuesta.datos;

  for (const activo of listaActivos.value) {
    imagenesQr.value[activo.codigo] = await QRCode.toDataURL(activo.codigo, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  }
};

const activosFiltrados = computed(() => {
  if (!filtroDepartamento.value) return listaActivos.value;
  return listaActivos.value.filter((a) =>
    a.departamento.toLowerCase().includes(filtroDepartamento.value.toLowerCase())
  );
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
    <div class="ocultar-en-impresion flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-white">
          Generador de Etiquetas QR Imprimibles
        </h1>
        <p class="text-sm text-slate-400">
          Cuadrícula adaptable a hoja de papel para etiquetado físico de equipos en Industrias Rodanol, S.A.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <UInput
          v-model="filtroDepartamento"
          placeholder="Filtrar por departamento..."
          icon="i-heroicons-funnel"
        />
        <UButton
          color="violet"
          icon="i-heroicons-printer"
          label="Imprimir Cuadrícula QR"
          @click="imprimirEtiquetas"
        />
      </div>
    </div>

    <!-- Cuadrícula Imprimible (@media print) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
      <div
        v-for="activo in activosFiltrados"
        :key="activo.id"
        class="p-4 rounded-xl bg-white text-slate-950 border-2 border-slate-900 flex flex-col items-center text-center shadow-md print:shadow-none print:break-inside-avoid"
      >
        <p class="text-[11px] font-black uppercase tracking-widest text-violet-900">
          BOX - RODANOL
        </p>
        <p class="text-[9px] font-semibold text-slate-600 mb-1">
          INDUSTRIAS RODANOL, S.A. • IT
        </p>

        <img
          v-if="imagenesQr[activo.codigo]"
          :src="imagenesQr[activo.codigo]"
          :alt="activo.codigo"
          class="w-28 h-28 object-contain my-1"
        />

        <p class="text-2xl font-black tracking-wider font-mono text-slate-950 leading-none mt-1">
          {{ activo.codigo }}
        </p>
        <p class="text-[10px] font-bold text-slate-700 truncate max-w-full mt-1">
          {{ activo.tipo_activo }} {{ activo.marca }}
        </p>
        <p class="text-[9px] text-slate-500 truncate max-w-full">
          {{ activo.departamento }}
        </p>
      </div>
    </div>
  </div>
</template>
