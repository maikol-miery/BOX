<script setup lang="ts">
const rutaActual = useRoute();
const menuMovilAbierto = ref(false);
const modalEscaner = ref(false);
const procesandoEscaneo = ref(false);

const enlacesNavegacion = [
  {
    nombre: 'Tablero Principal',
    ruta: '/',
    icono: 'i-heroicons-squares-2x2',
    descripcion: 'Métricas y alertas'
  },
  {
    nombre: 'Parque Informático',
    ruta: '/activos',
    icono: 'i-heroicons-computer-desktop',
    descripcion: 'Activos, QR y Garantías'
  },
  {
    nombre: 'Etiquetas QR',
    ruta: '/activos/etiquetas',
    icono: 'i-heroicons-qr-code',
    descripcion: 'Impresión para planta'
  },
  {
    nombre: 'Mantenimiento IR-SI-FO-001',
    ruta: '/mantenimientos',
    icono: 'i-heroicons-wrench-screwdriver',
    descripcion: 'Chequeo, firmas y Excel'
  },
  {
    nombre: 'Insumos de Impresión',
    ruta: '/insumos',
    icono: 'i-heroicons-ArchiveBox',
    iconoAlterno: 'i-heroicons-swatch',
    descripcion: 'Tóners y reemplazos'
  },
  {
    nombre: 'Préstamos y Custodia',
    ruta: '/prestamos',
    icono: 'i-heroicons-arrows-right-left',
    descripcion: 'Equipos rotativos'
  },
  {
    nombre: 'Banco de Pruebas y RAEE',
    ruta: '/residuos',
    icono: 'i-heroicons-cpu-chip',
    descripcion: 'Desincorporación y reciclaje'
  }
];

// Limpia cualquier modal huérfano que HeadlessUI o Teleport hayan dejado pegado en document.body
const purgarModalesPegados = () => {
  if (typeof document === 'undefined') return;

  Array.from(document.body.children).forEach((elemento) => {
    if (
      elemento.id !== '__nuxt' &&
      (elemento.id === 'headlessui-portal-root' ||
        elemento.hasAttribute('data-headlessui-portal') ||
        elemento.textContent?.includes('Escáner de Activos QR en Planta'))
    ) {
      elemento.remove();
    }
  });

  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
};

if (import.meta.client) {
  purgarModalesPegados();
}

const abrirModalEscaner = () => {
  purgarModalesPegados();
  modalEscaner.value = true;
};

const cerrarModalEscaner = () => {
  modalEscaner.value = false;
  purgarModalesPegados();
};

const alEscanearCodigo = async (codigo: string) => {
  if (procesandoEscaneo.value) return;
  procesandoEscaneo.value = true;

  // 1. Cerrar el modal y limpiar cualquier capa en body
  modalEscaner.value = false;
  purgarModalesPegados();

  // 2. Pequeño delay (300ms) para asegurar que el cierre visual se complete antes de cambiar de ruta
  await new Promise((resolver) => setTimeout(resolver, 300));

  // 3. Redireccionar a la Hoja de Vida del activo escaneado
  try {
    await navigateTo(`/activos/${encodeURIComponent(codigo)}`);
  } finally {
    purgarModalesPegados();
    procesandoEscaneo.value = false;
  }
};

watch(
  () => rutaActual.fullPath,
  () => {
    modalEscaner.value = false;
    purgarModalesPegados();
  }
);

onMounted(() => {
  purgarModalesPegados();
});
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Barra Lateral Izquierda (Escritorio) -->
    <aside
      class="ocultar-en-impresion hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900/75 backdrop-blur-xl border-r border-violet-500/20 z-30"
    >
      <!-- Cabecera de Marca -->
      <div class="p-6 border-b border-violet-500/20 flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30"
        >
          <UIcon name="i-heroicons-cube-transparent" class="w-7 h-7 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl font-extrabold tracking-tight text-white">BOX</span>
            <UBadge color="violet" variant="subtle" size="xs">PWA IT</UBadge>
          </div>
          <p class="text-xs text-violet-300/80 font-medium">Industrias Rodanol, S.A.</p>
        </div>
      </div>

      <!-- Botón de Escáner QR -->
      <div class="px-4 pt-4">
        <UButton
          block
          size="lg"
          color="violet"
          variant="solid"
          icon="i-heroicons-camera"
          label="Escanear Etiqueta QR"
          class="shadow-lg shadow-violet-600/25 font-semibold"
          @click="abrirModalEscaner"
        />
      </div>

      <!-- Menú de Navegación -->
      <nav class="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <NuxtLink
          v-for="item in enlacesNavegacion"
          :key="item.ruta"
          :to="item.ruta"
          class="flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group"
          :class="
            rutaActual.path === item.ruta
              ? 'bg-violet-600/25 text-white border border-violet-500/40 shadow-md shadow-violet-500/10'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
          "
        >
          <UIcon
            :name="item.iconoAlterno || item.icono"
            class="w-5 h-5 shrink-0 transition-colors"
            :class="rutaActual.path === item.ruta ? 'text-violet-400' : 'text-slate-400 group-hover:text-violet-300'"
          />
          <div class="overflow-hidden">
            <p class="text-sm font-semibold truncate">{{ item.nombre }}</p>
            <p class="text-[11px] text-slate-400 truncate">{{ item.descripcion }}</p>
          </div>
        </NuxtLink>
      </nav>

      <!-- Pie de Barra Lateral -->
      <div class="p-4 border-t border-violet-500/20 bg-slate-950/50">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Departamento de IT</span>
          <span class="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            En Línea
          </span>
        </div>
      </div>
    </aside>

    <!-- Barra Superior Móvil / Tablet para Planta -->
    <header
      class="ocultar-en-impresion lg:hidden sticky top-0 z-30 bg-slate-900/85 backdrop-blur-md border-b border-violet-500/20 px-4 py-3 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-bars-3"
          @click="menuMovilAbierto = true"
        />
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <UIcon name="i-heroicons-cube-transparent" class="w-5 h-5 text-white" />
          </div>
          <div>
            <p class="text-sm font-bold text-white leading-none">BOX - Rodanol</p>
            <p class="text-[10px] text-violet-300">Gestión Integral IT</p>
          </div>
        </div>
      </div>

      <UButton
        color="violet"
        size="sm"
        icon="i-heroicons-qr-code"
        label="Escanear QR"
        @click="abrirModalEscaner"
      />
    </header>

    <!-- Menú Deslizante Móvil -->
    <USlideover v-model="menuMovilAbierto" side="left">
      <div class="p-5 h-full bg-slate-900 text-slate-100 flex flex-col">
        <div class="flex items-center justify-between pb-4 border-b border-violet-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <UIcon name="i-heroicons-cube-transparent" class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="font-bold text-white">BOX - Rodanol</p>
              <p class="text-xs text-violet-300">Departamento de IT</p>
            </div>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="menuMovilAbierto = false"
          />
        </div>

        <nav class="flex-1 py-4 space-y-2 overflow-y-auto">
          <NuxtLink
            v-for="item in enlacesNavegacion"
            :key="item.ruta"
            :to="item.ruta"
            class="flex items-center gap-3 px-3.5 py-3 rounded-xl"
            :class="
              rutaActual.path === item.ruta
                ? 'bg-violet-600/30 text-white border border-violet-500/40'
                : 'text-slate-300 hover:bg-slate-800'
            "
            @click="menuMovilAbierto = false"
          >
            <UIcon :name="item.iconoAlterno || item.icono" class="w-5 h-5 text-violet-400" />
            <div>
              <p class="text-sm font-semibold">{{ item.nombre }}</p>
              <p class="text-xs text-slate-400">{{ item.descripcion }}</p>
            </div>
          </NuxtLink>
        </nav>
      </div>
    </USlideover>

    <!-- Contenido Principal -->
    <main class="flex-1 lg:pl-72">
      <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>

    <!-- Único Modal de Escáner QR (Sin Teleport al body para evitar nodos huérfanos) -->
    <div
      v-if="modalEscaner"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85"
      @click.self="cerrarModalEscaner"
    >
      <div class="relative w-full max-w-lg bg-slate-900 border border-violet-500/40 rounded-2xl shadow-2xl p-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-violet-500/20">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-camera" class="w-5 h-5 text-violet-400" />
            <h3 class="font-bold text-white text-base">Escáner de Activos QR en Planta</h3>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="cerrarModalEscaner"
          />
        </div>

        <ComunEscanerQr @codigo-detectado="alEscanearCodigo" />
      </div>
    </div>
  </div>
</template>
