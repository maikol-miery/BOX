<script setup>
const emitir = defineEmits(['codigo-detectado'])

const sufijoUnico = Math.random().toString(36).slice(2, 8)
const idContenedorLector = `visor-camara-qr-${sufijoUnico}`
const idContenedorFoto = `visor-foto-qr-${sufijoUnico}`

const codigoManual = ref('')
const errorCamara = ref('')
const camaraActiva = ref(false)
const procesandoFoto = ref(false)
const inputFoto = ref(null)

let instanciaLector = null
let yaEmitido = false

const detenerCamara = async () => {
  if (!instanciaLector) return
  const lector = instanciaLector
  instanciaLector = null
  camaraActiva.value = false
  try {
    if (lector.isScanning) {
      await Promise.race([
        lector.stop(),
        new Promise((r) => setTimeout(r, 250))
      ])
    }
    lector.clear()
  } catch {}
}

const emitirCodigo = (texto) => {
  const codigo = String(texto || '').trim().toUpperCase()
  if (!codigo || yaEmitido) return
  yaEmitido = true
  detenerCamara()
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
    const { Html5Qrcode } = await import('html5-qrcode')
    if (!document.getElementById(idContenedorLector)) return
    instanciaLector = new Html5Qrcode(idContenedorLector)
    await instanciaLector.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 230, height: 230 } },
      (textoDecodificado) => {
        emitirCodigo(textoDecodificado)
      },
      () => {}
    )
    camaraActiva.value = true
  } catch {
    errorCamara.value =
      'No se pudo iniciar la cámara en vivo en este dispositivo. Usa "Tomar foto del código QR" o busca el código manualmente abajo.'
    camaraActiva.value = false
  }
}

const abrirCapturaFoto = () => {
  inputFoto.value?.click()
}

const procesarFotoCapturada = async (evento) => {
  const objetivo = evento.target
  const archivo = objetivo?.files?.[0]
  if (!archivo) return

  procesandoFoto.value = true
  errorCamara.value = ''
  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    const lectorFoto = new Html5Qrcode(idContenedorFoto)
    const texto = await lectorFoto.scanFile(archivo, false)
    try {
      lectorFoto.clear()
    } catch {}
    emitirCodigo(texto)
  } catch {
    errorCamara.value =
      'No se reconoció un código QR en la imagen seleccionada. Intenta con una foto más clara o ingresa el código manualmente.'
  } finally {
    procesandoFoto.value = false
    if (objetivo) objetivo.value = ''
  }
}

const enviarCodigoManual = () => {
  emitirCodigo(codigoManual.value)
}

onMounted(() => {
  iniciarCamara()
})

onBeforeUnmount(() => {
  detenerCamara()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Input oculto para cámara nativa / selección de foto -->
    <input
      ref="inputFoto"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="procesarFotoCapturada"
    >

    <!-- Contenedor oculto exclusivo para scanFile (sin hijos de Vue) -->
    <div :id="idContenedorFoto" class="hidden" />

    <!-- Visor de la cámara: el div de Html5Qrcode está vacío para que nunca borre nodos de Vue -->
    <div class="w-full min-h-[220px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative">
      <div :id="idContenedorLector" class="w-full" />

      <div
        v-if="!camaraActiva && !errorCamara"
        class="absolute inset-0 flex items-center justify-center text-xs text-zinc-400 p-4 text-center pointer-events-none"
      >
        Iniciando sensor de cámara...
      </div>
    </div>

    <UButton
      block
      size="lg"
      color="primary"
      icon="i-heroicons-camera"
      :loading="procesandoFoto"
      label="Tomar foto del código QR"
      class="shadow-md shadow-cobalto-500/20 font-bold"
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
    <form class="pt-2 border-t border-zinc-200 dark:border-zinc-800" @submit.prevent="enviarCodigoManual">
      <UFormGroup label="O ingresa el código del activo manualmente:">
        <div class="flex gap-2">
          <UInput
            v-model="codigoManual"
            placeholder="Ej: V-01, M-05, P-01"
            class="flex-1 uppercase"
          />
          <UButton
            type="submit"
            color="primary"
            variant="soft"
            icon="i-heroicons-magnifying-glass"
            label="Buscar"
            @click="enviarCodigoManual"
          />
        </div>
      </UFormGroup>
    </form>
  </div>
</template>
