<script setup>
const route = useRoute()
const colorMode = useColorMode()
const { peticion } = usarApi()
const menuMovilAbierto = ref(false)
const modalEscaner = ref(false)
const procesandoEscaneo = ref(false)
const estadoServidor = ref('verificando')
let intervaloEstado = null

const verificarEstadoServidor = async () => {
  try {
    const res = await peticion('/estado')
    estadoServidor.value = res?.estado === 'OPERATIVO' || res?.exito ? 'en_linea' : 'sin_conexion'
  } catch {
    estadoServidor.value = 'sin_conexion'
  }
}

onMounted(() => {
  verificarEstadoServidor()
  intervaloEstado = setInterval(verificarEstadoServidor, 30000)
})

onUnmounted(() => {
  if (intervaloEstado) clearInterval(intervaloEstado)
})

const esModoOscuro = computed(() => colorMode.value === 'dark')

const alternarTema = () => {
  colorMode.preference = esModoOscuro.value ? 'light' : 'dark'
}

const enlacesNavegacion = [
  { nombre: 'Tablero Principal', ruta: '/', icono: 'i-heroicons-squares-2x2', descripcion: 'Métricas y alertas' },
  { nombre: 'Parque Informático', ruta: '/activos', icono: 'i-heroicons-computer-desktop', descripcion: 'Activos, QR y Garantías' },
  { nombre: 'Etiquetas QR', ruta: '/activos/etiquetas', icono: 'i-heroicons-qr-code', descripcion: 'Impresión para planta' },
  { nombre: 'Mantenimiento Preventivo', ruta: '/mantenimientos', icono: 'i-heroicons-wrench-screwdriver', descripcion: 'Chequeo, firmas y Excel' },
  { nombre: 'Insumos de Impresión', ruta: '/insumos', icono: 'i-heroicons-swatch', descripcion: 'Tóners y reemplazos' },
  { nombre: 'Préstamos y Custodia', ruta: '/prestamos', icono: 'i-heroicons-arrows-right-left', descripcion: 'Equipos rotativos' },
  { nombre: 'Banco de Pruebas y RAEE', ruta: '/residuos', icono: 'i-heroicons-cpu-chip', descripcion: 'Desincorporación y reciclaje' }
]

const esActivo = (ruta) => route.path === ruta

const alEscanearCodigo = async (codigo) => {
  if (procesandoEscaneo.value) return
  procesandoEscaneo.value = true
  modalEscaner.value = false

  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 150))

  try {
    await navigateTo(`/activos/${encodeURIComponent(codigo)}`)
  } finally {
    procesandoEscaneo.value = false
  }
}

watch(() => route.fullPath, () => {
  modalEscaner.value = false
  menuMovilAbierto.value = false
})
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Barra lateral (escritorio) -->
    <aside
      class="ocultar-en-impresion hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-[#0B0B0E] border-r border-zinc-200 dark:border-zinc-800 z-30 transition-colors"
    >
      <div class="p-6 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center gap-4">
        <div class="w-11 h-11 rounded-2xl bg-cobalto-500 flex items-center justify-center shadow-md shadow-cobalto-500/25">
          <UIcon name="i-heroicons-cube-transparent" class="w-6 h-6 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-white">BOX</span>
            <UBadge color="primary" variant="subtle" size="xs">PWA IT</UBadge>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Industrias Rodanol, S.A.</p>
        </div>
      </div>

      <div class="px-4 pt-4">
        <UButton
          block
          size="lg"
          color="primary"
          variant="solid"
          icon="i-heroicons-camera"
          label="Escanear Etiqueta QR"
          class="shadow-md shadow-cobalto-500/20 font-semibold"
          @click="modalEscaner = true"
        />
      </div>

      <nav class="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <NuxtLink
          v-for="item in enlacesNavegacion"
          :key="item.ruta"
          :to="item.ruta"
          class="flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-150 group border"
          :class="esActivo(item.ruta)
            ? 'bg-cobalto-50 text-cobalto-600 border-cobalto-200 dark:bg-cobalto-500/15 dark:text-white dark:border-cobalto-500/35'
            : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'"
        >
          <UIcon
            :name="item.icono"
            class="w-5 h-5 shrink-0 transition-colors"
            :class="esActivo(item.ruta)
              ? 'text-cobalto-500 dark:text-cobalto-400'
              : 'text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300'"
          />
          <div class="overflow-hidden">
            <p class="text-sm font-semibold truncate">{{ item.nombre }}</p>
            <p
              class="text-[11px] truncate"
              :class="esActivo(item.ruta) ? 'text-cobalto-500/80 dark:text-cobalto-300/80' : 'text-zinc-400 dark:text-zinc-500'"
            >
              {{ item.descripcion }}
            </p>
          </div>
        </NuxtLink>
      </nav>

      <!-- Pie de barra lateral con selector de tema -->
      <div class="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-3">
        <button
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-cobalto-400 transition-colors"
          @click="alternarTema"
        >
          <span class="flex items-center gap-2">
            <UIcon
              :name="esModoOscuro ? 'i-heroicons-moon' : 'i-heroicons-sun'"
              class="w-4 h-4 text-cobalto-500"
            />
            {{ esModoOscuro ? 'Modo Oscuro' : 'Modo Claro' }}
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            Cambiar
          </span>
        </button>

        <div class="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <span>Departamento de IT</span>
          <button
            type="button"
            class="flex items-center gap-1.5 font-medium cursor-pointer"
            :class="
              estadoServidor === 'en_linea'
                ? 'text-emerald-600 dark:text-emerald-400'
                : estadoServidor === 'sin_conexion'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-amber-600 dark:text-amber-400'
            "
            title="Haz clic para verificar la conexión con el servidor"
            @click="verificarEstadoServidor"
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="
                estadoServidor === 'en_linea'
                  ? 'bg-emerald-500 animate-pulse'
                  : estadoServidor === 'sin_conexion'
                    ? 'bg-rose-500'
                    : 'bg-amber-500 animate-pulse'
              "
            />
            {{
              estadoServidor === 'en_linea'
                ? 'En Línea'
                : estadoServidor === 'sin_conexion'
                  ? 'Sin Conexión'
                  : 'Verificando...'
            }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Barra superior móvil -->
    <header
      class="ocultar-en-impresion lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-[#0B0B0E]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-bars-3"
          aria-label="Abrir menú"
          @click="menuMovilAbierto = true"
        />
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-cobalto-500 flex items-center justify-center">
            <UIcon name="i-heroicons-cube-transparent" class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-sm font-bold text-zinc-950 dark:text-white leading-none">BOX - Rodanol</p>
            <p class="text-[10px] text-zinc-500 dark:text-zinc-400">Gestión Integral IT</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          :icon="esModoOscuro ? 'i-heroicons-sun' : 'i-heroicons-moon'"
          aria-label="Cambiar tema"
          @click="alternarTema"
        />
        <UButton
          color="primary"
          size="sm"
          icon="i-heroicons-qr-code"
          label="Escanear QR"
          @click="modalEscaner = true"
        />
      </div>
    </header>

    <!-- Menú deslizante móvil -->
    <USlideover
      v-model="menuMovilAbierto"
      side="left"
    >
      <div class="p-5 h-full bg-white dark:bg-[#0B0B0E] text-zinc-900 dark:text-zinc-100 flex flex-col">
        <div class="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cobalto-500 flex items-center justify-center">
              <UIcon name="i-heroicons-cube-transparent" class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="font-bold text-zinc-950 dark:text-white">BOX - Rodanol</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Departamento de IT</p>
            </div>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            aria-label="Cerrar menú"
            @click="menuMovilAbierto = false"
          />
        </div>

        <nav class="flex-1 py-4 space-y-2 overflow-y-auto">
          <NuxtLink
            v-for="item in enlacesNavegacion"
            :key="item.ruta"
            :to="item.ruta"
            class="flex items-center gap-3 px-3.5 py-3 rounded-xl border"
            :class="esActivo(item.ruta)
              ? 'bg-cobalto-50 text-cobalto-600 border-cobalto-200 dark:bg-cobalto-500/15 dark:text-white dark:border-cobalto-500/35'
              : 'text-zinc-600 hover:bg-zinc-100 border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900'"
            @click="menuMovilAbierto = false"
          >
            <UIcon :name="item.icono" class="w-5 h-5 text-cobalto-500 dark:text-cobalto-400" />
            <div>
              <p class="text-sm font-semibold">{{ item.nombre }}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.descripcion }}</p>
            </div>
          </NuxtLink>
        </nav>
      </div>
    </USlideover>

    <!-- Contenido principal -->
    <main class="flex-1 lg:pl-72 print:pl-0">
      <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 print:max-w-none print:p-0">
        <slot />
      </div>
    </main>

    <!-- Modal del escáner -->
    <div
      v-if="modalEscaner"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 dark:bg-black/80 backdrop-blur-sm"
      @click.self="modalEscaner = false"
    >
      <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-camera" class="w-5 h-5 text-cobalto-500" />
                <h3 class="font-bold text-zinc-950 dark:text-white text-base">Escáner de Activos QR en Planta</h3>
              </div>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                aria-label="Cerrar escáner"
                @click="modalEscaner = false"
              />
            </div>
          </template>

          <ComunEscanerQr
            @codigo-detectado="alEscanearCodigo"
          />
        </UCard>
      </div>
    </div>
  </div>
</template>
