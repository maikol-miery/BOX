<script setup>
const { peticion } = usarApi();
const notificaciones = useToast();

const listaPrestamos = ref([]);
const activosDisponibles = ref([]);
const modalNuevoPrestamo = ref(false);
const modalDevolucion = ref(false);
const prestamoSeleccionado = ref(null);
const guardando = ref(false);

const catalogoAccesorios = [
  'Cargador Original',
  'Mouse Óptico',
  'Adaptador HDMI / VGA',
  'Cable de Poder',
  'Maletín de Transporte',
  'Cable XLR / RCA'
];

const formularioPrestamo = reactive({
  activo_id: undefined,
  trabajador_solicitante: '',
  departamento_solicitante: '',
  motivo_prestamo: '',
  accesorios_incluidos: ['Cargador Original', 'Mouse Óptico'],
  fecha_estimada_devolucion: '',
  tecnico_responsable: '',
  observaciones_entrega: '',
  firma_recepcion_base64: ''
});

const formularioDevolucion = reactive({
  observaciones_devolucion: 'Equipo devuelto completo y operativo.',
  estado_activo_retorno: 'FUNCIONAL'
});

const cargarPrestamos = async () => {
  const [resPrestamos, resActivos] = await Promise.all([
    peticion('/prestamos'),
    peticion('/activos')
  ]);
  listaPrestamos.value = resPrestamos.datos;
  activosDisponibles.value = resActivos.datos.filter((a) => a.estado === 'FUNCIONAL');
};

const alternarAccesorio = (accesorio) => {
  const indice = formularioPrestamo.accesorios_incluidos.indexOf(accesorio);
  if (indice >= 0) {
    formularioPrestamo.accesorios_incluidos.splice(indice, 1);
  } else {
    formularioPrestamo.accesorios_incluidos.push(accesorio);
  }
};

const registrarSalidaPrestamo = async () => {
  guardando.value = true;
  try {
    const res = await peticion('/prestamos', {
      method: 'POST',
      body: formularioPrestamo
    });
    notificaciones.add({
      title: 'Préstamo Registrado',
      description: res.mensaje,
      color: 'emerald'
    });
    modalNuevoPrestamo.value = false;
    formularioPrestamo.firma_recepcion_base64 = '';
    await cargarPrestamos();
  } catch (error) {
    notificaciones.add({
      title: 'Error al registrar préstamo',
      description: error?.data?.errores?.[0]?.mensaje || error?.data?.mensaje,
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const abrirModalDevolucion = (prestamo) => {
  prestamoSeleccionado.value = prestamo;
  modalDevolucion.value = true;
};

const confirmarDevolucion = async () => {
  if (!prestamoSeleccionado.value) return;
  guardando.value = true;
  try {
    const res = await peticion(
      `/prestamos/${prestamoSeleccionado.value.id}/devolver`,
      {
        method: 'PUT',
        body: formularioDevolucion
      }
    );
    notificaciones.add({
      title: 'Equipo Devuelto',
      description: res.mensaje,
      color: 'emerald'
    });
    modalDevolucion.value = false;
    await cargarPrestamos();
  } catch (error) {
    notificaciones.add({
      title: 'Error',
      description: error?.data?.mensaje,
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

onMounted(() => {
  cargarPrestamos();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-white">
          Préstamos Temporales y Custodia de Equipos Rotativos
        </h1>
        <p class="text-sm text-slate-400">
          Control de salida de laptops VIT/HP, monitores, cables y proyectores con checklist y firma digital
        </p>
      </div>

      <UButton
        color="violet"
        icon="i-heroicons-hand-raised"
        label="Registrar Salida de Préstamo"
        @click="modalNuevoPrestamo = true"
      />
    </div>

    <!-- Panel de Préstamos con Semáforo Automático -->
    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-violet-500/20 text-xs uppercase text-violet-300">
              <th class="py-3 px-3">Semáforo</th>
              <th class="py-3 px-3">Equipo Prestado</th>
              <th class="py-3 px-3">Trabajador / Departamento</th>
              <th class="py-3 px-3">Accesorios Incluidos</th>
              <th class="py-3 px-3">Retorno Estimado</th>
              <th class="py-3 px-3">Firma Recepción</th>
              <th class="py-3 px-3">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="prestamo in listaPrestamos" :key="prestamo.id">
              <td class="py-3 px-3">
                <UBadge
                  :color="
                    prestamo.estado_semaforo === 'ACTIVO'
                      ? 'emerald'
                      : prestamo.estado_semaforo === 'VENCIDO'
                        ? 'rose'
                        : 'slate'
                  "
                  variant="subtle"
                  class="font-bold"
                >
                  {{ prestamo.estado_semaforo }}
                </UBadge>
              </td>
              <td class="py-3 px-3">
                <p class="font-mono font-bold text-white">{{ prestamo.activo?.codigo }}</p>
                <p class="text-xs text-slate-400">
                  {{ prestamo.activo?.tipo_activo }} {{ prestamo.activo?.marca }} {{ prestamo.activo?.modelo }}
                </p>
              </td>
              <td class="py-3 px-3">
                <p class="font-semibold text-white">{{ prestamo.trabajador_solicitante }}</p>
                <p class="text-xs text-violet-300">{{ prestamo.departamento_solicitante }}</p>
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="acc in prestamo.accesorios_incluidos"
                    :key="acc"
                    color="violet"
                    variant="soft"
                    size="xs"
                  >
                    {{ acc }}
                  </UBadge>
                </div>
              </td>
              <td class="py-3 px-3 text-xs text-slate-300">
                {{ new Date(prestamo.fecha_estimada_devolucion).toLocaleString() }}
              </td>
              <td class="py-3 px-3">
                <img
                  v-if="prestamo.firma_recepcion_base64"
                  :src="prestamo.firma_recepcion_base64"
                  alt="Firma"
                  class="h-10 bg-white rounded p-0.5 border border-violet-500/40"
                />
              </td>
              <td class="py-3 px-3">
                <UButton
                  v-if="prestamo.estado_semaforo !== 'DEVUELTO'"
                  size="xs"
                  color="emerald"
                  variant="soft"
                  icon="i-heroicons-arrow-uturn-left"
                  label="Recibir Devolución"
                  @click="abrirModalDevolucion(prestamo)"
                />
                <span v-else class="text-xs text-slate-500">
                  Devuelto ({{ prestamo.observaciones_devolucion }})
                </span>
              </td>
            </tr>
            <tr v-if="!listaPrestamos.length">
              <td colspan="7" class="py-8 text-center text-slate-500">
                No hay préstamos registrados actualmente.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Modal: Nuevo Préstamo con Checklist y Firma Digital -->
    <UModal v-model="modalNuevoPrestamo" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <h3 class="font-bold text-white">Registrar Salida de Equipo en Préstamo</h3>
        </template>

        <form class="space-y-4" @submit.prevent="registrarSalidaPrestamo">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Activo a Prestar" required>
              <USelectMenu
                v-model="formularioPrestamo.activo_id"
                :options="
                  activosDisponibles.map((a) => ({
                    label: `${a.codigo} - ${a.tipo_activo} ${a.marca} ${a.modelo}`,
                    value: a.id
                  }))
                "
                value-attribute="value"
                option-attribute="label"
                placeholder="Seleccione el activo..."
              />
            </UFormGroup>

            <UFormGroup label="Fecha y Hora Estimada de Devolución" required>
              <UInput v-model="formularioPrestamo.fecha_estimada_devolucion" type="datetime-local" />
            </UFormGroup>

            <UFormGroup label="Trabajador Solicitante" required>
              <UInput v-model="formularioPrestamo.trabajador_solicitante" placeholder="Nombre y apellido" />
            </UFormGroup>

            <UFormGroup label="Departamento Solicitante" required>
              <UInput v-model="formularioPrestamo.departamento_solicitante" placeholder="Ej: Producción, Ventas" />
            </UFormGroup>

            <UFormGroup label="Técnico IT que Entrega" required>
              <UInput v-model="formularioPrestamo.tecnico_responsable" />
            </UFormGroup>

            <UFormGroup label="Motivo del Préstamo">
              <UInput v-model="formularioPrestamo.motivo_prestamo" placeholder="Presentación en sala de juntas..." />
            </UFormGroup>
          </div>

          <!-- Checklist de Accesorios Incluidos -->
          <div class="p-3.5 rounded-xl bg-slate-950/70 border border-violet-500/20">
            <p class="text-xs font-bold uppercase tracking-wider text-violet-300 mb-2">
              Lista de Chequeo de Accesorios Entregados
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="item in catalogoAccesorios"
                :key="item"
                size="xs"
                :color="formularioPrestamo.accesorios_incluidos.includes(item) ? 'violet' : 'gray'"
                :variant="formularioPrestamo.accesorios_incluidos.includes(item) ? 'solid' : 'soft'"
                :label="item"
                @click="alternarAccesorio(item)"
              />
            </div>
          </div>

          <!-- Firma Digital del Solicitante -->
          <ComunLienzoFirma
            v-model="formularioPrestamo.firma_recepcion_base64"
            etiqueta="Firma Digital de Recepción y Custodia Temporal"
          />

          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalNuevoPrestamo = false" />
            <UButton
              type="submit"
              color="violet"
              label="Autorizar Salida de Préstamo"
              :loading="guardando"
            />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: Devolución de Préstamo -->
    <UModal v-model="modalDevolucion">
      <UCard>
        <template #header>
          <h3 class="font-bold text-white">
            Recepción de Equipo Devuelto ({{ prestamoSeleccionado?.activo?.codigo }})
          </h3>
        </template>
        <form class="space-y-4" @submit.prevent="confirmarDevolucion">
          <UFormGroup label="Estado Físico en que Retorna el Activo" required>
            <USelect
              v-model="formularioDevolucion.estado_activo_retorno"
              :options="['FUNCIONAL', 'MANTENIMIENTO', 'DAÑADO']"
            />
          </UFormGroup>
          <UFormGroup label="Observaciones de Recepción">
            <UTextarea v-model="formularioDevolucion.observaciones_devolucion" />
          </UFormGroup>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalDevolucion = false" />
            <UButton type="submit" color="emerald" label="Confirmar Devolución" :loading="guardando" />
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
