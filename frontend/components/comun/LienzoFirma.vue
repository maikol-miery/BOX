<script setup>
/**
 * Lienzo HTML5 táctil 100% firme y estático para capturar la firma digital
 * de conformidad de los usuarios en planta (soporta dedo en móvil y mouse en PC).
 */
const propiedades = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  etiqueta: {
    type: String,
    default: ''
  }
});

const emitir = defineEmits(['update:modelValue']);

const referenciaLienzo = ref(null);
const dibujando = ref(false);
const tieneTrazo = ref(false);

const obtenerCoordenadas = (evento) => {
  const lienzo = referenciaLienzo.value;
  if (!lienzo) return { x: 0, y: 0 };
  const rectangulo = lienzo.getBoundingClientRect();

  if ('touches' in evento && evento.touches.length > 0) {
    return {
      x: evento.touches[0].clientX - rectangulo.left,
      y: evento.touches[0].clientY - rectangulo.top
    };
  }

  return {
    x: evento.clientX - rectangulo.left,
    y: evento.clientY - rectangulo.top
  };
};

const iniciarTrazo = (evento) => {
  const lienzo = referenciaLienzo.value;
  if (!lienzo) return;
  const contexto = lienzo.getContext('2d');
  if (!contexto) return;

  dibujando.value = true;
  tieneTrazo.value = true;
  const { x, y } = obtenerCoordenadas(evento);
  contexto.beginPath();
  contexto.moveTo(x, y);
};

const trazarLinea = (evento) => {
  if (!dibujando.value) return;
  const lienzo = referenciaLienzo.value;
  if (!lienzo) return;
  const contexto = lienzo.getContext('2d');
  if (!contexto) return;

  const { x, y } = obtenerCoordenadas(evento);
  contexto.lineWidth = 2.4;
  contexto.lineCap = 'round';
  contexto.lineJoin = 'round';
  contexto.strokeStyle = '#1e1b4b';
  contexto.lineTo(x, y);
  contexto.stroke();
};

const finalizarTrazo = () => {
  if (!dibujando.value) return;
  dibujando.value = false;
  const lienzo = referenciaLienzo.value;
  if (!lienzo) return;
  const base64 = lienzo.toDataURL('image/png');
  emitir('update:modelValue', base64);
};

const limpiarLienzo = () => {
  const lienzo = referenciaLienzo.value;
  if (!lienzo) return;
  const contexto = lienzo.getContext('2d');
  if (!contexto) return;

  contexto.fillStyle = '#ffffff';
  contexto.fillRect(0, 0, lienzo.width, lienzo.height);
  tieneTrazo.value = false;
  emitir('update:modelValue', '');
};

onMounted(() => {
  limpiarLienzo();
});
</script>

<template>
  <div class="space-y-2 select-none">
    <div class="flex items-center justify-between">
      <label class="text-xs font-semibold uppercase tracking-wider text-violet-300">
        {{ etiqueta || 'Firma Digital de Conformidad (Firme con el dedo o puntero)' }}
      </label>
      <UButton
        size="2xs"
        color="gray"
        variant="soft"
        icon="i-heroicons-trash"
        label="Limpiar Firma"
        @click="limpiarLienzo"
      />
    </div>

    <!-- Lienzo 100% Firme sin animaciones de flotación para precisión táctil -->
    <div class="border-2 border-violet-500/40 rounded-xl overflow-hidden bg-white shadow-inner">
      <canvas
        ref="referenciaLienzo"
        width="520"
        height="160"
        class="w-full h-40 touch-none cursor-crosshair block"
        @mousedown="iniciarTrazo"
        @mousemove="trazarLinea"
        @mouseup="finalizarTrazo"
        @mouseleave="finalizarTrazo"
        @touchstart.prevent="iniciarTrazo"
        @touchmove.prevent="trazarLinea"
        @touchend.prevent="finalizarTrazo"
      />
    </div>

    <p class="text-[11px] text-slate-400 flex items-center justify-between">
      <span>La firma se almacena en Base64 para auditoría e incrustación en Excel.</span>
      <span v-if="tieneTrazo" class="text-emerald-400 font-semibold">✓ Firma capturada</span>
      <span v-else class="text-amber-400">Pendiente por firmar</span>
    </p>
  </div>
</template>
