<script setup>
const ruta = useRoute();
const codigoActivo = computed(() => String(ruta.params.codigo || '').toUpperCase());

const { peticion } = usarApi();
const notificaciones = useToast();

const cargando = ref(true);
const activo = ref(null);
const errorMensaje = ref('');

const coloresEstado = {
  FUNCIONAL: 'emerald',
  MANTENIMIENTO: 'amber',
  DAÑADO: 'rose',
  DESINCORPORADO: 'slate'
};

const cargarHojaVida = async () => {
  cargando.value = true;
  errorMensaje.value = '';
  try {
    const respuesta = await peticion(
      `/activos/codigo/${encodeURIComponent(codigoActivo.value)}`
    );
    activo.value = respuesta.datos;
  } catch (err) {
    errorMensaje.value =
      err?.data?.mensaje || `No se encontró ningún activo con el código ${codigoActivo.value}`;
    notificaciones.add({
      title: 'Activo no encontrado',
      description: errorMensaje.value,
      color: 'rose'
    });
  } finally {
    cargando.value = false;
  }
};

watch(codigoActivo, () => {
  cargarHojaVida();
});

onMounted(() => {
  cargarHojaVida();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Barra superior de navegación rápida -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <UButton
          to="/activos"
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          label="Volver al Inventario"
        />
        <UButton
          to="/"
          color="gray"
          variant="ghost"
          icon="i-heroicons-home"
          label="Inicio"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          v-if="activo?.es_rotativo && activo?.estado === 'FUNCIONAL'"
          :to="`/prestamos?codigo=${encodeURIComponent(activo.codigo)}`"
          color="primary"
          icon="i-heroicons-hand-raised"
          label="Prestar este equipo"
          class="shadow-md shadow-cobalto-500/20"
        />
        <UButton
          to="/activos"
          color="primary"
          variant="soft"
          icon="i-heroicons-computer-desktop"
          label="Inventario"
        />
        <UButton
          to="/activos/etiquetas"
          color="gray"
          variant="soft"
          icon="i-heroicons-printer"
          label="Etiqueta QR"
        />
      </div>
    </div>

    <!-- Estado de Carga -->
    <div v-if="cargando" class="p-12 text-center text-zinc-500 dark:text-zinc-400">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto text-cobalto-500 dark:text-cobalto-400 mb-2" />
      <p class="text-sm font-semibold text-zinc-950 dark:text-white">Cargando Hoja de Vida del Activo {{ codigoActivo }}...</p>
    </div>

    <!-- Error Si No Existe -->
    <UCard v-else-if="errorMensaje" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto text-amber-600 dark:text-amber-400 mb-3" />
      <h2 class="text-lg font-bold text-zinc-950 dark:text-white mb-1">Activo no localizado</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{{ errorMensaje }}</p>
      <UButton to="/activos" color="primary" label="Ir a la lista de Activos" />
    </UCard>

    <!-- Ficha Completa del Activo (Firme, limpia y sin animaciones molestas) -->
    <div v-else-if="activo" class="space-y-6">
      <!-- Encabezado del Activo -->
      <UCard>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-4">
            <div class="px-4 py-2.5 rounded-xl bg-cobalto-500 border border-cobalto-600 text-white font-mono font-extrabold text-2xl tracking-wider shadow-sm">
              {{ activo.codigo }}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                  {{ activo.tipo_activo }} — {{ activo.marca }} {{ activo.modelo }}
                </h1>
                <UBadge :color="coloresEstado[activo.estado] || 'slate'" variant="subtle" size="md">
                  {{ activo.estado }}
                </UBadge>
              </div>
              <p class="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                Custodio: <strong class="text-zinc-950 dark:text-white">{{ activo.usuario_custodio }}</strong> • Departamento: <strong class="text-cobalto-600 dark:text-cobalto-400">{{ activo.departamento }}</strong>
              </p>
            </div>
          </div>

          <div>
            <ComunInsigniaGarantia
              :fecha-compra="activo.fecha_compra"
              :meses-garantia="activo.meses_garantia"
            />
          </div>
        </div>
      </UCard>

      <!-- Panel de Datos Técnicos y Garantía -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Especificaciones de Hardware / Red -->
        <UCard>
          <template #header>
            <h3 class="font-bold text-zinc-950 dark:text-white text-sm flex items-center gap-2">
              <UIcon name="i-heroicons-cpu-chip" class="w-4 h-4 text-cobalto-500 dark:text-cobalto-400" />
              Especificaciones de Hardware y Red
            </h3>
          </template>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span class="text-xs text-zinc-500 dark:text-zinc-400 block">Procesador</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.procesador || 'N/D' }}</span>
            </div>
            <div class="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span class="text-xs text-zinc-500 dark:text-zinc-400 block">Memoria RAM</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.memoria_ram || 'N/D' }}</span>
            </div>
            <div class="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span class="text-xs text-zinc-500 dark:text-zinc-400 block">Almacenamiento</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.almacenamiento || 'N/D' }}</span>
            </div>
            <div class="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span class="text-xs text-zinc-500 dark:text-zinc-400 block">Sistema Operativo</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.sistema_operativo || 'N/D' }}</span>
            </div>
            <div class="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span class="text-xs text-zinc-500 dark:text-zinc-400 block">Dirección IP</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.direccion_ip || 'N/D' }}</span>
            </div>
            <div class="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span class="text-xs text-zinc-500 dark:text-zinc-400 block">Serial de Fábrica</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.serial || 'S/N' }}</span>
            </div>
          </div>
        </UCard>

        <!-- Datos de Adquisición y Garantía -->
        <UCard>
          <template #header>
            <h3 class="font-bold text-zinc-950 dark:text-white text-sm flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Datos de Compra y Garantía
            </h3>
          </template>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span class="text-zinc-500 dark:text-zinc-400">Proveedor:</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.proveedor || 'No registrado' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span class="text-zinc-500 dark:text-zinc-400">N° de Factura:</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.numero_factura || 'Sin factura' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span class="text-zinc-500 dark:text-zinc-400">Fecha de Adquisición:</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.fecha_compra || 'No registrada' }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
              <span class="text-zinc-500 dark:text-zinc-400">Meses de Garantía:</span>
              <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.meses_garantia ? `${activo.meses_garantia} meses` : 'Sin garantía' }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-zinc-500 dark:text-zinc-400">Tipo de Uso:</span>
              <UBadge :color="activo.es_rotativo ? 'purple' : 'gray'" variant="subtle" size="xs">
                {{ activo.es_rotativo ? 'Equipo Rotativo (Préstamos)' : 'Activo Fijo Departamental' }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Historial de Mantenimientos Preventivos IR-SI-FO-001 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-zinc-950 dark:text-white text-base">
              Historial de Mantenimiento Preventivo (Formato IR-SI-FO-001)
            </h3>
            <UBadge color="primary" variant="subtle">
              {{ activo.historial_mantenimientos?.length || 0 }} Registros
            </UBadge>
          </div>
        </template>

        <div v-if="activo.historial_mantenimientos?.length" class="space-y-3">
          <div
            v-for="reg in activo.historial_mantenimientos"
            :key="reg.id"
            class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <UBadge :color="reg.ejecutado === 'SI' ? 'emerald' : 'rose'" variant="subtle" size="xs">
                  Ejecutado: {{ reg.ejecutado }}
                </UBadge>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ reg.fecha_ejecucion }}</span>
              </div>
              <p class="font-bold text-zinc-950 dark:text-white text-sm">
                {{ reg.jornada?.titulo_actividad || 'Mantenimiento Preventivo Institucional' }}
              </p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Atendido por técnico a: <span class="text-zinc-950 dark:text-white font-medium">{{ reg.usuario_atendido }}</span> ({{ reg.departamento }})
              </p>
              <p v-if="reg.observaciones" class="text-xs text-cobalto-600 dark:text-cobalto-400">
                Obs: {{ reg.observaciones }}
              </p>
            </div>

            <!-- Firma Digital Capturada -->
            <div class="shrink-0 text-right">
              <span class="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">Firma de Conformidad</span>
              <img
                v-if="reg.firma_conformidad_base64"
                :src="reg.firma_conformidad_base64"
                alt="Firma"
                class="h-12 bg-white rounded-lg px-2 py-1 border border-zinc-300 dark:border-zinc-700 inline-block"
              />
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">
          No hay registros de mantenimientos preventivos realizados en este equipo.
        </p>
      </UCard>

      <!-- Historial de Préstamos Temporales -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-zinc-950 dark:text-white text-base">
              Historial de Préstamos Temporales y Custodia
            </h3>
            <UBadge color="amber" variant="subtle">
              {{ activo.historial_prestamos?.length || 0 }} Préstamos
            </UBadge>
          </div>
        </template>

        <div v-if="activo.historial_prestamos?.length" class="divide-y divide-zinc-200 dark:divide-zinc-800">
          <div
            v-for="prestamo in activo.historial_prestamos"
            :key="prestamo.id"
            class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
          >
            <div>
              <p class="font-bold text-zinc-950 dark:text-white">
                {{ prestamo.trabajador_solicitante }} — <span class="text-cobalto-600 dark:text-cobalto-400">{{ prestamo.departamento_solicitante }}</span>
              </p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Salida: {{ new Date(prestamo.fecha_salida).toLocaleDateString() }} • Retorno Estimado: {{ new Date(prestamo.fecha_estimada_devolucion).toLocaleDateString() }}
              </p>
            </div>
            <UBadge
              :color="prestamo.estado_semaforo === 'ACTIVO' ? 'emerald' : prestamo.estado_semaforo === 'VENCIDO' ? 'rose' : 'slate'"
              variant="subtle"
            >
              {{ prestamo.estado_semaforo }}
            </UBadge>
          </div>
        </div>

        <p v-else class="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6">
          Este equipo no tiene historial de préstamos temporales.
        </p>
      </UCard>
    </div>
  </div>
</template>
