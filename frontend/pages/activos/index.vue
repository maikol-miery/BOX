<script setup lang="ts">
const { peticion } = usarApi();
const notificaciones = useToast();

const cargando = ref(false);
const listaActivos = ref<any[]>([]);
const busqueda = ref('');
const filtroTipo = ref('');
const filtroEstado = ref('');

const modalFormulario = ref(false);
const modalHojaVida = ref(false);
const activoSeleccionado = ref<any>(null);

const tiposActivo = [
  { label: 'Todos los tipos', value: '' },
  { label: 'SOBREMESA', value: 'SOBREMESA' },
  { label: 'LAPTOP', value: 'LAPTOP' },
  { label: 'SERVIDOR', value: 'SERVIDOR' },
  { label: 'MONITOR', value: 'MONITOR' },
  { label: 'IMPRESORA', value: 'IMPRESORA' },
  { label: 'PERIFERICO', value: 'PERIFERICO' },
  { label: 'CABLE', value: 'CABLE' }
];

const estadosActivo = [
  { label: 'Todos los estados', value: '' },
  { label: 'FUNCIONAL', value: 'FUNCIONAL' },
  { label: 'MANTENIMIENTO', value: 'MANTENIMIENTO' },
  { label: 'DAÑADO', value: 'DAÑADO' },
  { label: 'DESINCORPORADO', value: 'DESINCORPORADO' }
];

const columnasTabla = [
  { key: 'codigo', label: 'Código QR' },
  { key: 'equipo', label: 'Activo / Especificaciones' },
  { key: 'custodio', label: 'Departamento y Custodio' },
  { key: 'garantia', label: 'Semáforo Garantía' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones' }
];

const cargarActivos = async () => {
  cargando.value = true;
  try {
    const parametros = new URLSearchParams();
    if (busqueda.value) parametros.set('busqueda', busqueda.value);
    if (filtroTipo.value) parametros.set('tipo_activo', filtroTipo.value);
    if (filtroEstado.value) parametros.set('estado', filtroEstado.value);

    const respuesta = await peticion<{ exito: boolean; datos: any[] }>(
      `/activos?${parametros.toString()}`
    );
    listaActivos.value = respuesta.datos;
  } catch (error) {
    notificaciones.add({
      title: 'Error al cargar inventario',
      description: 'Verifica que el servidor Backend esté en ejecución.',
      color: 'rose'
    });
  } finally {
    cargando.value = false;
  }
};

const abrirCreacion = () => {
  activoSeleccionado.value = null;
  modalFormulario.value = true;
};

const abrirEdicion = (activo: any) => {
  activoSeleccionado.value = activo;
  modalFormulario.value = true;
};

const abrirHojaVida = async (codigo: string) => {
  try {
    const respuesta = await peticion<{ exito: boolean; datos: any }>(
      `/activos/codigo/${encodeURIComponent(codigo)}`
    );
    activoSeleccionado.value = respuesta.datos;
    modalHojaVida.value = true;
  } catch {
    notificaciones.add({
      title: 'Error',
      description: 'No se pudo obtener la hoja de vida completa.',
      color: 'rose'
    });
  }
};

watch([busqueda, filtroTipo, filtroEstado], () => {
  cargarActivos();
});

onMounted(() => {
  cargarActivos();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-white tracking-tight">
          Parque Informático y Hoja de Vida
        </h1>
        <p class="text-sm text-slate-400">
          Gestión integral de activos, especificaciones técnicas, etiquetas QR y semáforo de garantías
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/activos/etiquetas"
          color="gray"
          variant="soft"
          icon="i-heroicons-printer"
          label="Imprimir Etiquetas QR"
        />
        <UButton
          color="violet"
          icon="i-heroicons-plus"
          label="Nuevo Activo"
          @click="abrirCreacion"
        />
      </div>
    </div>

    <!-- Barra de Filtros -->
    <UCard>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UInput
          v-model="busqueda"
          icon="i-heroicons-magnifying-glass"
          placeholder="Buscar por código (V-01), custodio, marca o departamento..."
        />
        <USelect
          v-model="filtroTipo"
          :options="tiposActivo"
          option-attribute="label"
          value-attribute="value"
        />
        <USelect
          v-model="filtroEstado"
          :options="estadosActivo"
          option-attribute="label"
          value-attribute="value"
        />
      </div>
    </UCard>

    <!-- Tabla Estática de Alta Precisión Operativa -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <UTable
        :rows="listaActivos"
        :columns="columnasTabla"
        :loading="cargando"
        :empty-state="{
          icon: 'i-heroicons-computer-desktop',
          label: 'No se encontraron activos informáticos con los filtros seleccionados.'
        }"
      >
        <template #codigo-data="{ row }">
          <div class="flex items-center gap-2">
            <UBadge color="violet" variant="solid" size="md" class="font-mono font-bold">
              {{ row.codigo }}
            </UBadge>
            <UBadge v-if="row.es_rotativo" color="purple" variant="subtle" size="xs">
              Rotativo
            </UBadge>
          </div>
        </template>

        <template #equipo-data="{ row }">
          <div>
            <p class="font-bold text-white text-sm">
              {{ row.tipo_activo }} — {{ row.marca }} {{ row.modelo }}
            </p>
            <p class="text-xs text-slate-400">
              <span v-if="row.caracteristicas?.procesador">{{ row.caracteristicas.procesador }} • </span>
              <span v-if="row.caracteristicas?.memoria_ram">{{ row.caracteristicas.memoria_ram }} • </span>
              <span v-if="row.caracteristicas?.almacenamiento">{{ row.caracteristicas.almacenamiento }}</span>
              <span v-if="row.caracteristicas?.direccion_ip">IP: {{ row.caracteristicas.direccion_ip }}</span>
            </p>
          </div>
        </template>

        <template #custodio-data="{ row }">
          <div>
            <p class="text-sm font-medium text-slate-200">{{ row.usuario_custodio }}</p>
            <p class="text-xs text-violet-300">{{ row.departamento }}</p>
          </div>
        </template>

        <template #garantia-data="{ row }">
          <ComunInsigniaGarantia
            :fecha-compra="row.fecha_compra"
            :meses-garantia="row.meses_garantia"
          />
        </template>

        <template #estado-data="{ row }">
          <UBadge
            :color="
              row.estado === 'FUNCIONAL'
                ? 'emerald'
                : row.estado === 'MANTENIMIENTO'
                  ? 'amber'
                  : row.estado === 'DAÑADO'
                    ? 'rose'
                    : 'slate'
            "
            variant="subtle"
          >
            {{ row.estado }}
          </UBadge>
        </template>

        <template #acciones-data="{ row }">
          <div class="flex items-center gap-1.5">
            <UButton
              :to="'/activos/' + encodeURIComponent(row.codigo)"
              size="xs"
              color="violet"
              variant="soft"
              icon="i-heroicons-identification"
              label="Hoja de Vida"
            />
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              @click="abrirEdicion(row)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Modales -->
    <ActivosModalFormularioActivo
      v-model="modalFormulario"
      :activo-editar="activoSeleccionado"
      @guardado="cargarActivos"
    />

    <ActivosModalHojaVidaActivo
      v-model="modalHojaVida"
      :activo="activoSeleccionado"
    />
  </div>
</template>
