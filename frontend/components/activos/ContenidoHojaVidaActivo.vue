<script setup>
const propiedades = defineProps({
  activo: {
    type: Object,
    default: null
  }
});

const coloresEstado = {
  FUNCIONAL: 'emerald',
  MANTENIMIENTO: 'amber',
  DAÑADO: 'rose',
  DESINCORPORADO: 'slate'
};
</script>

<template>
  <div v-if="activo" class="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
    <!-- Resumen de Estado y Garantía -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">Estado Operativo</p>
        <UBadge :color="coloresEstado[activo.estado] || 'slate'" variant="subtle" class="mt-1">
          {{ activo.estado }}
        </UBadge>
      </div>

      <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">Estado de Garantía</p>
        <div class="mt-1">
          <ComunInsigniaGarantia
            :fecha-compra="activo.fecha_compra"
            :meses-garantia="activo.meses_garantia"
          />
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">Proveedor / Factura</p>
        <p class="text-sm font-semibold text-zinc-950 dark:text-white truncate mt-0.5">
          {{ activo.proveedor || 'No registrado' }}
        </p>
        <p class="text-[11px] text-cobalto-600 dark:text-cobalto-400">
          {{ activo.numero_factura || 'Sin factura' }}
        </p>
      </div>
    </div>

    <!-- Especificaciones Técnicas -->
    <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
      <h4 class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400">
        Características Técnicas
      </h4>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span class="text-zinc-500 dark:text-zinc-400 block">Procesador:</span>
          <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.procesador || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-zinc-500 dark:text-zinc-400 block">Memoria RAM:</span>
          <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.memoria_ram || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-zinc-500 dark:text-zinc-400 block">Almacenamiento:</span>
          <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.almacenamiento || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-zinc-500 dark:text-zinc-400 block">Sistema Operativo:</span>
          <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.sistema_operativo || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-zinc-500 dark:text-zinc-400 block">Dirección IP:</span>
          <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.caracteristicas?.direccion_ip || 'N/A' }}</span>
        </div>
        <div>
          <span class="text-zinc-500 dark:text-zinc-400 block">Serial:</span>
          <span class="font-semibold text-zinc-950 dark:text-white">{{ activo.serial || 'S/N' }}</span>
        </div>
      </div>
    </div>

    <!-- Historial de Mantenimientos Preventivos IR-SI-FO-001 -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400">
        Historial de Mantenimientos Preventivos ({{ activo.historial_mantenimientos?.length || 0 }})
      </h4>
      <div
        v-if="activo.historial_mantenimientos?.length"
        class="space-y-2"
      >
        <div
          v-for="reg in activo.historial_mantenimientos"
          :key="reg.id"
          class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
        >
          <div>
            <p class="text-xs font-bold text-zinc-950 dark:text-white">
              {{ reg.jornada?.titulo_actividad || 'Mantenimiento Preventivo' }}
            </p>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
              Fecha: {{ reg.fecha_ejecucion }} | Usuario: {{ reg.usuario_atendido }} | Ejecutado: {{ reg.ejecutado }}
            </p>
            <p v-if="reg.observaciones" class="text-[11px] text-cobalto-600 dark:text-cobalto-400 mt-0.5">
              Obs: {{ reg.observaciones }}
            </p>
          </div>
          <img
            v-if="reg.firma_conformidad_base64"
            :src="reg.firma_conformidad_base64"
            alt="Firma"
            class="h-10 bg-white rounded px-2 py-0.5 border border-zinc-300 dark:border-zinc-700"
          />
        </div>
      </div>
      <p v-else class="text-xs text-zinc-500 italic">
        Este equipo aún no registra ejecuciones de mantenimiento preventivo.
      </p>
    </div>

    <!-- Historial de Préstamos Temporales -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400">
        Historial de Préstamos y Custodia ({{ activo.historial_prestamos?.length || 0 }})
      </h4>
      <div v-if="activo.historial_prestamos?.length" class="space-y-2">
        <div
          v-for="prest in activo.historial_prestamos"
          :key="prest.id"
          class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
        >
          <div>
            <p class="font-semibold text-zinc-950 dark:text-white">
              Solicitante: {{ prest.trabajador_solicitante }} ({{ prest.departamento_solicitante }})
            </p>
            <p class="text-zinc-500 dark:text-zinc-400">
              Salida: {{ new Date(prest.fecha_salida).toLocaleDateString() }}
            </p>
          </div>
          <UBadge
            :color="prest.estado_semaforo === 'ACTIVO' ? 'emerald' : prest.estado_semaforo === 'VENCIDO' ? 'rose' : 'slate'"
            variant="subtle"
          >
            {{ prest.estado_semaforo }}
          </UBadge>
        </div>
      </div>
      <p v-else class="text-xs text-zinc-500 italic">
        Sin registros de préstamos temporales.
      </p>
    </div>
  </div>
</template>
