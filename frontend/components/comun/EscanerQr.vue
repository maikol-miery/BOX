<script setup>
const emitir = defineEmits(['codigo-detectado'])

const idContenedorLector = 'visor-camara-qr-box'
const codigoManual = ref('')
const errorCamara = ref('')
const camaraActiva = ref(false)
const procesandoFoto = ref(false)
const inputFoto = ref(null)

let instanciaLector = null
let yaEmitido = false

const crearLector = async () => {
  const { Html5Qrcode } = await import('html5-qrcode')
  return new Html5Qrcode(idContenedorLector)
}

const detenerCamara = async () => {
  if (!instanciaLector) return
  const lector = instanciaLector
  instanciaLector = null
  try {
    if (lector.isScanning) await lector.stop()
    lector.clear()
  } catch {}
  camaraActiva.value = false
}

const emitirCodigo = async (texto) => {
  const codigo = texto.trim().toUpperCase()
  if (!codigo || yaEmitido) return
  yaEmitido = true
  await detenerCamara()
  emitir('codigo-detectado', codigo)
}

const iniciarCamara = async () => {
  errorCamara.value = ''
  yaEmitido = false

  if (!navigator?.mediaDevices?.getUserMedia) {
    errorCamara.value =
      'Los navegadores móviles requieren HTTPS para el video en vivo. Pulsa "Tomar foto del código QR" o ingresa el código manualmente.'
    return
  }

  try {
    await detenerCamara()
    instanciaLector = await crearLector()
    await instanciaLector.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 230, height: 230 } },
      (textoDecodificado) => { emitirCodigo(textoDecodificado) },
      () => {}
    )
    camaraActiva.value = true
  } catch {
    errorCamara.value =
      'No se pudo iniciar el video en vivo (requiere HTTPS en red local). Usa "Tomar foto del código QR" para abrir tu cámara directamente.'
    camaraActiva.value = false
  }
}

const abrirCapturaFoto = () => {
  inputFoto.value?.click()
}

const procesarFotoCapturada = async (evento) => {
  const objetivo = evento.target;
  const archivo = objetivo.files?.[0];
  if (!archivo) return

  procesandoFoto.value = true
  errorCamara.value = ''
  try {
    await detenerCamara()
    const lector = await crearLector()
    try {
      const texto = await lector.scanFile(archivo, false)
      await emitirCodigo(texto)
    } finally {
      try { lector.clear() } catch {}
    }
  } catch {
    errorCamara.value =
      'No se reconoció un código QR en la fotografía. Intenta enfocar más de cerca la etiqueta.'
  } finally {
    procesandoFoto.value = false
    objetivo.value = ''
  }
}

const enviarCodigoManual = () => emitirCodigo(codigoManual.value)

onMounted(iniciarCamara)
onBeforeUnmount(detenerCamara)
</script>

<template>
  <div class="space-y-4">
    <!-- Input oculto para cámara nativa (fallback sin HTTPS) -->
    <input
      ref="inputFoto"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="procesarFotoCapturada"
    >

    <!-- Visor de la cámara -->
    <div
      :id="idContenedorLector"
      class="w-full min-h-[220px] rounded-xl overflow-hidden bg-slate-950 border border-violet-500/30 flex items-center justify-center relative"
    >
      <div v-if="!camaraActiva && !errorCamara" class="text-xs text-slate-400 p-4 text-center">
        Iniciando sensor de cámara...
      </div>
    </div>

    <UButton
      block
      size="lg"
      color="violet"
      icon="i-heroicons-camera"
      :loading="procesandoFoto"
      label="Tomar foto del código QR"
      class="shadow-lg shadow-violet-500/20 font-bold"
      @click="abrirCapturaFoto"
    />

    <UAlert
      v-if="errorCamara"
      color="amber"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :description="errorCamara"
    />

    <!-- Búsqueda manual / escáner USB -->
    <div class="pt-2 border-t border-slate-800">
      <UFormGroup label="O ingresa el código del activo manualmente:">
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
      </UFormGroup>
    </div>
  </div>
</template>