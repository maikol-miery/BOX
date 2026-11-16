<script setup lang="ts">
const { peticion } = usarApi();
const cargando = ref(true);

const resumen = ref<any>({
  metricas: {
    total_activos: 0,
    activos_funcionales: 0,
    activos_danados: 0,
    garantias_vigentes: 0,
    garantias_por_vencer: 0,
    jornadas_totales: 0,
    insumos_bajo_stock: 0,
    prestamos_activos: 0,
    prestamos_vencidos: 0,
    equipos_raee: 0
  },
  alertas_insumos: [],
  prestamos_recientes: []
});

const cargarTablero = async () => {
  cargando.value = true;
  try {
    const respuesta = await peticion<{ exito: boolean; datos: any }>('/tablero/resumen');
    resumen.value = respuesta.datos;
  } catch {
    // Mantiene estado vacío si el backend aún no está encendido
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarTablero();
});
</script>

<template>
  <div class="space-y-8">
    <!-- Hero de Bienvenida con Estética Antigravity -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/80 via-slate-900/90 to-purple-950/70 border border-violet-500/30 p-6 sm:p-8 shadow-2xl shadow-violet-500/10"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            <span>Industrias Rodanol, S.A. • Departamento de IT</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Centro de Control <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">BOX</span>
          </h1>
          <p class="text-sm text-slate-300 leading-relaxed">
            Plataforma progresiva (PWA) para la trazabilidad del parque informático, jornadas de mantenimiento preventivo
            <strong>IR-SI-FO-001</strong> con firma digital, control de tóners, préstamos rotativos y gestión RAEE.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton
            to="/activos"
            size="lg"
            color="violet"
            icon="i-heroicons-computer-desktop"
            label="Ver Parque Informático"
          />
          <UButton
            to="/mantenimientos"
            size="lg"
            color="gray"
            variant="soft"
            icon="i-heroicons-wrench-screwdriver"
            label="Formato IR-SI-FO-001"
          />
        </div>
      </div>
    </div>

    <!-- Tarjetas de Métricas Principales (Firmes y directas) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="tarjeta-antigravity p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-violet-300">
            Parque Informático
          </span>
          <div class="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <UIcon name="i-heroicons-computer-desktop" class="w-5 h-5 text-violet-400" />
          </div>
        </div>
        <p class="text-3xl font-black text-white mt-3">
          {{ resumen.metricas.total_activos }}
        </p>
        <p class="text-xs text-emerald-400 mt-1">
          {{ resumen.metricas.activos_funcionales }} equipos operativos en planta
        </p>
      </div>

      <div class="tarjeta-antigravity p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-violet-300">
            Garantías Activas
          </span>
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <p class="text-3xl font-black text-white mt-3">
          {{ resumen.metricas.garantias_vigentes }}
        </p>
        <p class="text-xs text-amber-400 mt-1">
          {{ resumen.metricas.garantias_por_vencer }} garantías por vencer (≤ 30 días)
        </p>
      </div>

      <div class="tarjeta-antigravity p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-violet-300">
            Préstamos y Custodia
          </span>
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <UIcon name="i-heroicons-arrows-right-left" class="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <p class="text-3xl font-black text-white mt-3">
          {{ resumen.metricas.prestamos_activos }}
        </p>
        <p class="text-xs text-rose-400 mt-1">
          {{ resumen.metricas.prestamos_vencidos }} préstamos con fecha vencida
        </p>
      </div>

      <div class="tarjeta-antigravity p-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-violet-300">
            Alertas de Tóner
          </span>
          <div class="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <UIcon name="i-heroicons-swatch" class="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <p class="text-3xl font-black text-white mt-3">
          {{ resumen.metricas.insumos_bajo_stock }}
        </p>
        <p class="text-xs text-slate-400 mt-1">
          Consumibles en o por debajo del stock mínimo
        </p>
      </div>
    </div>

    <!-- Sección Inferior: Alertas de Tóners y Accesos Directos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-white">Alertas de Reposición de Tóners</h3>
            <UButton to="/insumos" size="xs" color="violet" variant="soft" label="Ir a Insumos" />
          </div>
        </template>

        <div v-if="resumen.alertas_insumos?.length" class="space-y-3">
          <div
            v-for="insumo in resumen.alertas_insumos"
            :key="insumo.id"
            class="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 flex items-center justify-between"
          >
            <div>
              <p class="font-mono font-bold text-white">
                {{ insumo.codigo_referencia }} — {{ insumo.nombre_descripcion }}
              </p>
              <p class="text-xs text-slate-400">
                Compatibilidad: {{ insumo.modelos_compatibles }}
              </p>
            </div>
            <UBadge color="rose" variant="subtle">
              Quedan {{ insumo.cantidad_actual }} (Mín: {{ insumo.cantidad_minima }})
            </UBadge>
          </div>
        </div>
        <p v-else class="text-xs text-slate-400 py-4 text-center">
          Todos los consumibles de impresión cuentan con stock suficiente.
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-white">Módulos Operativos del Sistema Box</h3>
            <UBadge color="violet" variant="subtle">6 Módulos Integrados</UBadge>
          </div>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <NuxtLink
            to="/activos"
            class="p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/20 hover:border-violet-400 transition-colors"
          >
            <p class="font-bold text-white">1. Parque Informático + Garantías</p>
            <p class="text-slate-400 mt-0.5">Fichas técnicas, semáforo de garantía y lector QR</p>
          </NuxtLink>

          <NuxtLink
            to="/mantenimientos"
            class="p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/20 hover:border-violet-400 transition-colors"
          >
            <p class="font-bold text-white">2. Mantenimiento IR-SI-FO-001</p>
            <p class="text-slate-400 mt-0.5">Firmas digitales táctiles y exportación Excel</p>
          </NuxtLink>

          <NuxtLink
            to="/insumos"
            class="p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/20 hover:border-violet-400 transition-colors"
          >
            <p class="font-bold text-white">3. Insumos de Impresión</p>
            <p class="text-slate-400 mt-0.5">Tóners W2020A, CF230A, CRG137 y descuento automático</p>
          </NuxtLink>

          <NuxtLink
            to="/prestamos"
            class="p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/20 hover:border-violet-400 transition-colors"
          >
            <p class="font-bold text-white">4. Préstamos y Custodia</p>
            <p class="text-slate-400 mt-0.5">Equipos rotativos, accesorios y semáforo de vencimiento</p>
          </NuxtLink>

          <NuxtLink
            to="/residuos"
            class="p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/20 hover:border-violet-400 transition-colors sm:col-span-2"
          >
            <p class="font-bold text-white">5. Banco de Pruebas y Residuos Electrónicos (RAEE)</p>
            <p class="text-slate-400 mt-0.5">Canibalización de piezas y Acta de Desincorporación imprimible</p>
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>
