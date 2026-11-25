<script setup>
const ruta = useRoute();
const { peticion } = usarApi();
const notificaciones = useToast();

const listaPrestamos = ref([]);
const filtroFechaDesde = ref('');
const filtroFechaHasta = ref('');
const filtroEstado = ref('');
const rangoRapido = ref('');
const paginaActual = ref(1);
const elementosPorPagina = 10;
const imprimiendo = ref(false);
const activosDisponibles = ref([]);
const modalNuevoPrestamo = ref(false);
const modalDevolucion = ref(false);
const mostrarEscanerEnModal = ref(false);
const activoSelectorId = ref(undefined);
const activosAnexados = ref([]);
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

const formatearFechaLocal = (fecha) => {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};

const aplicarFiltroRapido = (tipo) => {
  const hoy = new Date();
  rangoRapido.value = tipo;

  if (tipo === 'hoy') {
    const fechaHoy = formatearFechaLocal(hoy);
    filtroFechaDesde.value = fechaHoy;
    filtroFechaHasta.value = fechaHoy;
  } else if (tipo === 'semanal') {
    const diaSemana = hoy.getDay();
    const diferenciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + diferenciaLunes);
    const finSemana = new Date(inicioSemana.getFullYear(), inicioSemana.getMonth(), inicioSemana.getDate() + 6);
    filtroFechaDesde.value = formatearFechaLocal(inicioSemana);
    filtroFechaHasta.value = formatearFechaLocal(finSemana);
  } else if (tipo === 'mensual') {
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    filtroFechaDesde.value = formatearFechaLocal(inicioMes);
    filtroFechaHasta.value = formatearFechaLocal(finMes);
  }
};

const prestamosFiltrados = computed(() => {
  return listaPrestamos.value.filter((p) => {
    if (filtroEstado.value && p.estado_semaforo !== filtroEstado.value) {
      return false;
    }

    if (filtroFechaDesde.value || filtroFechaHasta.value) {
      const fechaObj = new Date(p.fecha_salida || p.fecha_estimada_devolucion);
      const fechaLocal = formatearFechaLocal(fechaObj);

      if (filtroFechaDesde.value && fechaLocal < filtroFechaDesde.value) return false;
      if (filtroFechaHasta.value && fechaLocal > filtroFechaHasta.value) return false;
    }

    return true;
  });
});

const prestamosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina;
  return prestamosFiltrados.value.slice(inicio, inicio + elementosPorPagina);
});

watch([filtroFechaDesde, filtroFechaHasta, filtroEstado], () => {
  paginaActual.value = 1;
});

const prestamosVisibles = computed(() => {
  return imprimiendo.value ? prestamosFiltrados.value : prestamosPaginados.value;
});

const imprimirPrestamos = async () => {
  imprimiendo.value = true;
  await nextTick();
  window.print();
  imprimiendo.value = false;
};

const limpiarFiltros = () => {
  filtroFechaDesde.value = '';
  filtroFechaHasta.value = '';
  filtroEstado.value = '';
  rangoRapido.value = '';
  paginaActual.value = 1;
};

const codigosEnPrestamoAbierto = computed(() => {
  const conjunto = new Set();
  for (const p of listaPrestamos.value) {
    if (p.estado_semaforo !== 'DEVUELTO' && p.activo?.id) {
      conjunto.add(p.activo.id);
    }
  }
  return conjunto;
});

const activosParaSelector = computed(() =>
  activosDisponibles.value.filter(
    (a) =>
      !codigosEnPrestamoAbierto.value.has(a.id) &&
      !activosAnexados.value.some((anexado) => anexado.id === a.id)
  )
);

const cargarPrestamos = async () => {
  const [resPrestamos, resActivos] = await Promise.all([
    peticion('/prestamos'),
    peticion('/activos')
  ]);
  listaPrestamos.value = resPrestamos.datos;
  activosDisponibles.value = resActivos.datos.filter((a) => a.estado === 'FUNCIONAL');
};

const anexarActivo = (activo) => {
  if (!activo) return;
  if (activo.estado !== 'FUNCIONAL') {
    notificaciones.add({
      title: 'Equipo no disponible',
      description: `El activo ${activo.codigo} tiene estado ${activo.estado}.`,
      color: 'amber'
    });
    return;
  }
  if (codigosEnPrestamoAbierto.value.has(activo.id)) {
    notificaciones.add({
      title: 'Equipo ya prestado',
      description: `El activo ${activo.codigo} ya tiene un préstamo activo sin devolver.`,
      color: 'rose'
    });
    return;
  }
  if (activosAnexados.value.some((item) => item.id === activo.id)) {
    notificaciones.add({
      title: 'Ya anexado',
      description: `El activo ${activo.codigo} ya está en la lista de este préstamo.`,
      color: 'amber'
    });
    return;
  }

  activosAnexados.value.push(activo);
  notificaciones.add({
    title: `Anexado: ${activo.codigo}`,
    description: `${activo.tipo_activo} ${activo.marca} ${activo.modelo}`,
    color: 'emerald'
  });
};

const quitarActivoAnexado = (id) => {
  activosAnexados.value = activosAnexados.value.filter((a) => a.id !== id);
};

watch(activoSelectorId, (nuevoId) => {
  if (!nuevoId) return;
  const encontrado = activosDisponibles.value.find((a) => a.id === Number(nuevoId));
  if (encontrado) anexarActivo(encontrado);
  activoSelectorId.value = undefined;
});

const anexarPorCodigoQr = async (codigoDetectado) => {
  const codigoNormalizado = String(codigoDetectado || '').trim().toUpperCase();
  if (!codigoNormalizado) return;

  let encontrado = activosDisponibles.value.find((a) => a.codigo === codigoNormalizado);
  if (!encontrado) {
    try {
      const res = await peticion(`/activos/codigo/${encodeURIComponent(codigoNormalizado)}`);
      encontrado = res.datos;
    } catch {
      notificaciones.add({
        title: 'Código no encontrado',
        description: `No existe ningún activo con el código ${codigoNormalizado}.`,
        color: 'rose'
      });
      return;
    }
  }

  anexarActivo(encontrado);
  mostrarEscanerEnModal.value = false;
};

const abrirNuevoPrestamo = (conEscaner = false) => {
  mostrarEscanerEnModal.value = conEscaner;
  modalNuevoPrestamo.value = true;
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
  if (activosAnexados.value.length === 0) {
    notificaciones.add({
      title: 'Falta seleccionar equipos',
      description: 'Anexa o escanea al menos un equipo o cable para el préstamo.',
      color: 'amber'
    });
    return;
  }

  guardando.value = true;
  try {
    const res = await peticion('/prestamos', {
      method: 'POST',
      body: {
        ...formularioPrestamo,
        activos_ids: activosAnexados.value.map((a) => a.id)
      }
    });
    notificaciones.add({
      title: 'Préstamo Registrado',
      description: res.mensaje,
      color: 'emerald'
    });
    modalNuevoPrestamo.value = false;
    mostrarEscanerEnModal.value = false;
    activosAnexados.value = [];
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

const verificarCodigoEnRuta = async () => {
  const codigoQuery = ruta.query.codigo;
  if (!codigoQuery) return;
  modalNuevoPrestamo.value = true;
  mostrarEscanerEnModal.value = false;
  await anexarPorCodigoQr(String(codigoQuery));
};

onMounted(async () => {
  await cargarPrestamos();
  await verificarCodigoEnRuta();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-zinc-950 dark:text-white">
          Préstamos Temporales y Custodia de Equipos Rotativos
        </h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          Control de salida de laptops, monitores, cables y proyectores (uno o varios en el mismo préstamo) con firma digital
        </p>
      </div>

      <div class="ocultar-en-impresion flex flex-wrap gap-2">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-printer"
          label="Imprimir"
          @click="imprimirPrestamos"
        />
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-qr-code"
          label="Escanear para Prestar"
          @click="abrirNuevoPrestamo(true)"
        />
        <UButton
          color="primary"
          icon="i-heroicons-hand-raised"
          label="Registrar Salida de Préstamo"
          @click="abrirNuevoPrestamo(false)"
        />
      </div>
    </div>

    <!-- Barra de Filtros por Fecha y Estado -->
    <UCard class="ocultar-en-impresion">
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">Rango rápido:</span>
          <UButton
            size="xs"
            :color="rangoRapido === 'hoy' ? 'primary' : 'gray'"
            :variant="rangoRapido === 'hoy' ? 'solid' : 'soft'"
            label="Hoy"
            @click="aplicarFiltroRapido('hoy')"
          />
          <UButton
            size="xs"
            :color="rangoRapido === 'semanal' ? 'primary' : 'gray'"
            :variant="rangoRapido === 'semanal' ? 'solid' : 'soft'"
            label="Semanal"
            @click="aplicarFiltroRapido('semanal')"
          />
          <UButton
            size="xs"
            :color="rangoRapido === 'mensual' ? 'primary' : 'gray'"
            :variant="rangoRapido === 'mensual' ? 'solid' : 'soft'"
            label="Mensual"
            @click="aplicarFiltroRapido('mensual')"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <UFormGroup label="Fecha de Salida (Desde)">
            <UInput v-model="filtroFechaDesde" type="date" @update:model-value="rangoRapido = ''" />
          </UFormGroup>
          <UFormGroup label="Fecha de Salida (Hasta)">
            <UInput v-model="filtroFechaHasta" type="date" @update:model-value="rangoRapido = ''" />
          </UFormGroup>
          <UFormGroup label="Estado del Préstamo">
            <USelect
              v-model="filtroEstado"
              :options="[
                { label: 'Todos los estados', value: '' },
                { label: 'ACTIVO', value: 'ACTIVO' },
                { label: 'VENCIDO', value: 'VENCIDO' },
                { label: 'DEVUELTO', value: 'DEVUELTO' }
              ]"
              option-attribute="label"
              value-attribute="value"
            />
          </UFormGroup>
          <div class="flex justify-end sm:justify-start">
            <UButton
              v-if="filtroFechaDesde || filtroFechaHasta || filtroEstado"
              color="gray"
              variant="soft"
              icon="i-heroicons-x-mark"
              label="Limpiar Filtros"
              @click="limpiarFiltros"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Panel de Préstamos con Semáforo Automático -->
    <UCard>
      <!-- Encabezado visible solo al imprimir -->
      <div class="hidden print:block mb-4 pb-3 border-b border-zinc-300 text-xs text-zinc-700">
        <p class="text-sm font-bold text-zinc-950">Industrias Rodanol, S.A. — Reporte de Préstamos Temporales</p>
        <p class="mt-1">
          Filtros aplicados:
          <span v-if="filtroFechaDesde || filtroFechaHasta">
            Desde {{ filtroFechaDesde || 'Inicio' }} hasta {{ filtroFechaHasta || 'Hoy' }}
          </span>
          <span v-else>Todas las fechas</span>
          · Estado: {{ filtroEstado || 'Todos' }}
          · Total: {{ prestamosFiltrados.length }} registro(s)
        </p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-cobalto-600 dark:text-cobalto-400">
              <th class="py-3 px-3">Semáforo</th>
              <th class="py-3 px-3">Equipo Prestado</th>
              <th class="py-3 px-3">Trabajador / Departamento</th>
              <th class="py-3 px-3">Accesorios Incluidos</th>
              <th class="py-3 px-3">Retorno Estimado</th>
              <th class="py-3 px-3">Firma Recepción</th>
              <th class="py-3 px-3">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr v-for="prestamo in prestamosVisibles" :key="prestamo.id">
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
                <p class="font-mono font-bold text-zinc-950 dark:text-white">{{ prestamo.activo?.codigo }}</p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  {{ prestamo.activo?.tipo_activo }} {{ prestamo.activo?.marca }} {{ prestamo.activo?.modelo }}
                </p>
              </td>
              <td class="py-3 px-3">
                <p class="font-semibold text-zinc-950 dark:text-white">{{ prestamo.trabajador_solicitante }}</p>
                <p class="text-xs text-cobalto-600 dark:text-cobalto-400">{{ prestamo.departamento_solicitante }}</p>
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="acc in prestamo.accesorios_incluidos"
                    :key="acc"
                    color="primary"
                    variant="soft"
                    size="xs"
                  >
                    {{ acc }}
                  </UBadge>
                </div>
              </td>
              <td class="py-3 px-3 text-xs text-zinc-600 dark:text-zinc-300">
                {{ new Date(prestamo.fecha_estimada_devolucion).toLocaleString() }}
              </td>
              <td class="py-3 px-3">
                <img
                  v-if="prestamo.firma_recepcion_base64"
                  :src="prestamo.firma_recepcion_base64"
                  alt="Firma"
                  class="h-10 bg-white rounded p-0.5 border border-zinc-300 dark:border-zinc-700"
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
                <span v-else class="text-xs text-zinc-500 dark:text-zinc-400">
                  Devuelto ({{ prestamo.observaciones_devolucion }})
                </span>
              </td>
            </tr>
            <tr v-if="!prestamosFiltrados.length">
              <td colspan="7" class="py-8 text-center text-zinc-500 dark:text-zinc-400">
                No hay préstamos que coincidan con el filtro seleccionado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="prestamosFiltrados.length"
        class="ocultar-en-impresion mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400"
      >
        <span>
          Mostrando
          {{ (paginaActual - 1) * elementosPorPagina + 1 }}–{{ Math.min(paginaActual * elementosPorPagina, prestamosFiltrados.length) }}
          de {{ prestamosFiltrados.length }} registros
        </span>
        <UPagination
          v-if="prestamosFiltrados.length > elementosPorPagina"
          v-model="paginaActual"
          :page-count="elementosPorPagina"
          :total="prestamosFiltrados.length"
        />
      </div>
    </UCard>

    <!-- Modal: Nuevo Préstamo Múltiple con Escáner QR, Checklist y Firma Digital -->
    <UModal v-model="modalNuevoPrestamo" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-zinc-950 dark:text-white">
              Registrar Salida en Préstamo (Uno o Varios Equipos)
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="modalNuevoPrestamo = false"
            />
          </div>
        </template>

        <form class="space-y-4 max-h-[80vh] overflow-y-auto pr-1" @submit.prevent="registrarSalidaPrestamo">
          <!-- Selector + Botón de Escáner QR para anexar equipos -->
          <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400">
                Equipos / Cables Anexados al Préstamo ({{ activosAnexados.length }})
              </p>
              <UButton
                size="xs"
                :color="mostrarEscanerEnModal ? 'gray' : 'primary'"
                variant="soft"
                :icon="mostrarEscanerEnModal ? 'i-heroicons-x-mark' : 'i-heroicons-qr-code'"
                :label="mostrarEscanerEnModal ? 'Ocultar Escáner' : 'Escanear QR para Anexar'"
                @click="mostrarEscanerEnModal = !mostrarEscanerEnModal"
              />
            </div>

            <!-- Escáner QR integrado dentro del modal de préstamo -->
            <div v-if="mostrarEscanerEnModal" class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-cobalto-300 dark:border-cobalto-500/40">
              <ComunEscanerQr @codigo-detectado="anexarPorCodigoQr" />
            </div>

            <USelectMenu
              v-model="activoSelectorId"
              :options="
                activosParaSelector.map((a) => ({
                  label: `${a.codigo} - ${a.tipo_activo} ${a.marca} ${a.modelo}`,
                  value: a.id
                }))
              "
              value-attribute="value"
              option-attribute="label"
              searchable
              placeholder="+ Seleccionar otro equipo o cable para anexar..."
            />

            <!-- Lista de equipos ya anexados -->
            <div v-if="activosAnexados.length" class="flex flex-wrap gap-2 pt-1">
              <div
                v-for="equipo in activosAnexados"
                :key="equipo.id"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cobalto-50 dark:bg-cobalto-500/15 border border-cobalto-200 dark:border-cobalto-500/35 text-xs"
              >
                <span class="font-mono font-bold text-cobalto-600 dark:text-cobalto-300">{{ equipo.codigo }}</span>
                <span class="text-zinc-700 dark:text-zinc-200">{{ equipo.tipo_activo }} {{ equipo.marca }}</span>
                <button
                  type="button"
                  class="text-zinc-400 hover:text-rose-500 transition-colors"
                  @click="quitarActivoAnexado(equipo.id)"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-zinc-500 dark:text-zinc-400 italic">
              Aún no hay equipos anexados. Selecciona del listado o escanea uno o varios códigos QR.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Trabajador Solicitante" required>
              <UInput v-model="formularioPrestamo.trabajador_solicitante" placeholder="Nombre y apellido" />
            </UFormGroup>

            <UFormGroup label="Departamento Solicitante" required>
              <UInput v-model="formularioPrestamo.departamento_solicitante" placeholder="Ej: Producción, Ventas" />
            </UFormGroup>

            <UFormGroup label="Fecha y Hora Estimada de Devolución" required>
              <UInput v-model="formularioPrestamo.fecha_estimada_devolucion" type="datetime-local" />
            </UFormGroup>

            <UFormGroup label="Técnico IT que Entrega" required>
              <UInput v-model="formularioPrestamo.tecnico_responsable" />
            </UFormGroup>

            <UFormGroup label="Motivo del Préstamo" class="sm:col-span-2">
              <UInput v-model="formularioPrestamo.motivo_prestamo" placeholder="Presentación en sala de juntas..." />
            </UFormGroup>
          </div>

          <!-- Checklist de Accesorios Incluidos -->
          <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
            <p class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400 mb-2">
              Lista de Chequeo de Accesorios Entregados
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="item in catalogoAccesorios"
                :key="item"
                size="xs"
                :color="formularioPrestamo.accesorios_incluidos.includes(item) ? 'primary' : 'gray'"
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
              color="primary"
              :label="`Autorizar Préstamo (${activosAnexados.length})`"
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
          <h3 class="font-bold text-zinc-950 dark:text-white">
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
