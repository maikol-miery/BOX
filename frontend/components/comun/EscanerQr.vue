<script setup lang="ts">
import { Html5Qrcode } from 'html5-qrcode';

const emitir = defineEmits<{
  (e: 'codigo-detectado', codigo: string): void;
}>();

const idContenedorLector = 'visor-camara-qr-box';
const codigoManual = ref('');
const errorCamara = ref('');
const camaraActiva = ref(false);
const procesandoFoto = ref(false);
const inputFoto = ref<HTMLInputElement | null>(null);
let instanciaLector: Html5Qrcode | null = null;

const detenerCamara = async () => {
  if (instanciaLector) {
    try {
      if (instanciaLector.isScanning) {
        await instanciaLector.stop();
      }
      instanciaLector.clear();
    } catch {}
    camaraActiva.value = false;
  }
};

const iniciarCamara = async () => {
  errorCamara.value = '';

  // Verificar si el navegador permite getUserMedia (requiere HTTPS o localhost)
  if (!navigator?.mediaDevices?.getUserMedia) {
    errorCamara.value =
      'Los navegadores móviles requieren HTTPS para transmitir video en vivo. Puedes pulsar el botón "📸 Tomar Foto al Código QR" o ingresar el código abajo.';
    return;
  }

  try {
    await detenerCamara();
    instanciaLector = new Html5Qrcode(idContenedorLector);
    await instanciaLector.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 230, height: 230 }
      },
      async (textoDecodificado) => {
        await detenerCamara();
        emitir('codigo-detectado', textoDecodificado.trim().toUpperCase());
      },
      () => {}
    );
    camaraActiva.value = true;
  } catch (err: any) {
    errorCamara.value =
      'No se pudo iniciar el video en vivo (requiere HTTPS en red local). Usa el botón "📸 Tomar Foto al QR" para abrir tu cámara directamente.';
    camaraActiva.value = false;
  }
};

const abrirCapturaFoto = () => {
  inputFoto.value?.click();
};

const procesarFotoCapturada = async (evento: Event) => {
  const objetivo = evento.target as HTMLInputElement;
  const archivo = objetivo.files?.[0];
  if (!archivo) return;

  procesandoFoto.value = true;
  errorCamara.value = '';
  try {
    if (!instanciaLector) {
      instanciaLector = new Html5Qrcode(idContenedorLector);
    }
    // scanFile con false para no sobrecargar el DOM con la foto completa
    const textoDecodificado = await instanciaLector.scanFile(archivo, false);
    await detenerCamara();
    emitir('codigo-detectado', textoDecodificado.trim().toUpperCase());
  } catch (err: any) {
    errorCamara.value =
      'No se reconoció un código QR en la fotografía tomada. Intenta enfocar más de cerca la etiqueta.';
  } finally {
    procesandoFoto.value = false;
    if (objetivo) objetivo.value = '';
  }
};

const enviarCodigoManual = async () => {
  if (!codigoManual.value.trim()) return;
  await detenerCamara();
  emitir('codigo-detectado', codigoManual.value.trim().toUpperCase());
};

onMounted(() => {
  iniciarCamara();
});

onBeforeUnmount(async () => {
  await detenerCamara();
});
</script>

<template>
  <div class="space-y-4">
    <!-- Input oculto para cámara nativa en caso de HTTP -->
    <input
      ref="inputFoto"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="procesarFotoCapturada"
    />

    <!-- Visor de video de la cámara -->
    <div
      :id="idContenedorLector"
      class="w-full min-h-[220px] rounded-xl overflow-hidden bg-slate-950 border border-violet-500/30 flex items-center justify-center relative"
    >
      <div v-if="!camaraActiva && !errorCamara" class="text-xs text-slate-400 p-4 text-center">
        Iniciando sensor de cámara...
      </div>
    </div>

    <!-- Botón directo de Captura de Foto con Cámara Nativa -->
    <UButton
      block
      size="lg"
      color="violet"
      icon="i-heroicons-camera"
      :loading="procesandoFoto"
      label="📸 Tomar Foto al Código QR con la Cámara"
      class="shadow-lg shadow-violet-500/20 font-bold"
      @click="abrirCapturaFoto"
    />

    <!-- Alerta Informativa -->
    <p v-if="errorCamara" class="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-lg border border-amber-500/30 leading-relaxed">
      {{ errorCamara }}
    </p>

    <!-- Búsqueda Manual / Escáner USB -->
    <div class="pt-2 border-t border-slate-800">
      <label class="block text-xs font-semibold text-slate-300 mb-1.5">
        O ingresa el código del activo manualmente:
      </label>
      <div class="flex gap-2">
        <UInput
          v-model="codigoManual"
          placeholder="Ej: V-01, M-05, P-01"
          class="flex-1 uppercase"
          @keyup.enter="enviarCodigoManual"
        />
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-magnifying-glass"
          label="Buscar"
          @click="enviarCodigoManual"
        />
      </div>
    </div>
  </div>
</template>
