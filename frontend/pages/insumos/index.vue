<script setup>
const { peticion } = usarApi();
const notificaciones = useToast();

const listaInsumos = ref([]);
const historialEntregas = ref([]);
const impresorasDisponibles = ref([]);

const modalNuevoInsumo = ref(false);
const modalSalidaToner = ref(false);
const modalReponerStock = ref(false);
const modalEliminarInsumo = ref(false);
const insumoAReponer = ref(null);
const insumoAEliminar = ref(null);
const cantidadAReponer = ref(1);
const impresoraCompatibleSelector = ref(undefined);
const guardando = ref(false);

const formularioInsumo = reactive({
  codigo_referencia: '',
  nombre_descripcion: '',
  marca: 'HP',
  modelos_compatibles: '',
  color: 'BLACK',
  cantidad_actual: 4,
  cantidad_minima: 2
});

const formularioEntrega = reactive({
  insumo_id: undefined,
  impresora_id: undefined,
  departamento_destino: '',
  usuario_receptor: '',
  tecnico_entregador: '',
  cantidad_entregada: 1,
  contador_paginas: undefined,
  observaciones: ''
});

const cargarInsumosYEntregas = async () => {
  const [resInsumos, resEntregas, resActivos] = await Promise.all([
    peticion('/insumos'),
    peticion('/insumos/entregas'),
    peticion('/activos?tipo_activo=IMPRESORA')
  ]);
  listaInsumos.value = resInsumos.datos;
  historialEntregas.value = resEntregas.datos;
  impresorasDisponibles.value = resActivos.datos;
};

watch(
  () => formularioEntrega.impresora_id,
  (idImpresora) => {
    const imp = impresorasDisponibles.value.find((i) => i.id === Number(idImpresora));
    if (imp) {
      formularioEntrega.departamento_destino = imp.departamento;
      formularioEntrega.usuario_receptor = imp.usuario_custodio;
    }
  }
);

const insumoExistentePorCodigo = computed(() => {
  const refCodigo = formularioInsumo.codigo_referencia.trim().toUpperCase();
  if (!refCodigo) return null;
  return listaInsumos.value.find((i) => i.codigo_referencia === refCodigo) || null;
});

const opcionesImpresorasRegistradas = computed(() =>
  impresorasDisponibles.value.map((imp) => ({
    label: `${imp.codigo} — ${imp.marca} ${imp.modelo} (${imp.departamento})`,
    valorTexto: `${imp.marca} ${imp.modelo}`
  }))
);

watch(impresoraCompatibleSelector, (modeloTexto) => {
  if (!modeloTexto) return;
  const actual = formularioInsumo.modelos_compatibles.trim();
  if (!actual) {
    formularioInsumo.modelos_compatibles = modeloTexto;
  } else if (!actual.toLowerCase().includes(modeloTexto.toLowerCase())) {
    formularioInsumo.modelos_compatibles = `${actual} / ${modeloTexto}`;
  }
  impresoraCompatibleSelector.value = undefined;
});

const abrirReponerStock = (insumo) => {
  insumoAReponer.value = insumo;
  cantidadAReponer.value = 1;
  modalReponerStock.value = true;
};

const abrirEliminarInsumo = (insumo) => {
  insumoAEliminar.value = insumo;
  modalEliminarInsumo.value = true;
};

const confirmarEliminarInsumo = async () => {
  if (!insumoAEliminar.value) return;
  guardando.value = true;
  try {
    const res = await peticion(`/insumos/${insumoAEliminar.value.id}`, {
      method: 'DELETE'
    });
    notificaciones.add({
      title: 'Insumo Eliminado',
      description: res.mensaje,
      color: 'emerald'
    });
    modalEliminarInsumo.value = false;
    insumoAEliminar.value = null;
    await cargarInsumosYEntregas();
  } catch (error) {
    notificaciones.add({
      title: 'No se pudo eliminar',
      description: error?.data?.mensaje || 'Error al intentar eliminar el insumo.',
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const guardarReposicionStock = async () => {
  if (!insumoAReponer.value || cantidadAReponer.value < 1) return;
  guardando.value = true;
  try {
    const nuevoStock = Number(insumoAReponer.value.cantidad_actual) + Number(cantidadAReponer.value);
    const res = await peticion(`/insumos/${insumoAReponer.value.id}`, {
      method: 'PUT',
      body: { cantidad_actual: nuevoStock }
    });
    notificaciones.add({
      title: 'Stock Actualizado',
      description: res.mensaje,
      color: 'emerald'
    });
    modalReponerStock.value = false;
    await cargarInsumosYEntregas();
  } catch (error) {
    notificaciones.add({
      title: 'Error al reponer stock',
      description: error?.data?.mensaje || 'No se pudo actualizar el stock.',
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const guardarInsumo = async () => {
  guardando.value = true;
  try {
    const res = await peticion('/insumos', {
      method: 'POST',
      body: formularioInsumo
    });
    notificaciones.add({
      title: 'Insumo Registrado',
      description: res.mensaje,
      color: 'emerald'
    });
    modalNuevoInsumo.value = false;
    await cargarInsumosYEntregas();
  } catch (error) {
    notificaciones.add({
      title: 'Error',
      description: error?.data?.errores?.[0]?.mensaje || error?.data?.mensaje,
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const registrarReemplazoToner = async () => {
  guardando.value = true;
  try {
    const res = await peticion('/insumos/entregas', {
      method: 'POST',
      body: formularioEntrega
    });
    notificaciones.add({
      title: 'Tóner Entregado y Descontado',
      description: res.mensaje,
      color: 'emerald'
    });
    modalSalidaToner.value = false;
    await cargarInsumosYEntregas();
  } catch (error) {
    notificaciones.add({
      title: 'No se pudo completar la entrega',
      description: error?.data?.errores?.[0]?.mensaje || error?.data?.mensaje,
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const estiloColorToner = {
  BLACK: 'bg-zinc-900 text-white border-zinc-700 dark:bg-zinc-800 dark:border-zinc-600',
  CYAN: 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40',
  MAGENTA: 'bg-pink-50 text-pink-700 border-pink-300 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40',
  YELLOW: 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40'
};

onMounted(() => {
  cargarInsumosYEntregas();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-zinc-950 dark:text-white">
          Control de Insumos de Impresión (Tóners y Cartuchos)
        </h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          Catálogo por código (W2020A, CF230A, CRG137), alerta de stock mínimo y reemplazo vinculado a impresoras
        </p>
      </div>

      <div class="flex gap-2">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-plus"
          label="Nuevo Modelo de Tóner"
          @click="modalNuevoInsumo = true"
        />
        <UButton
          color="primary"
          icon="i-heroicons-arrow-up-tray"
          label="Registrar Salida / Reemplazo"
          @click="modalSalidaToner = true"
        />
      </div>
    </div>

    <!-- Tarjetas de Stock de Tóners -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="insumo in listaInsumos"
        :key="insumo.id"
        class="tarjeta-antigravity p-5 flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="font-mono font-extrabold text-lg text-zinc-950 dark:text-white">
              {{ insumo.codigo_referencia }}
            </span>
            <span
              class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
              :class="estiloColorToner[insumo.color]"
            >
              {{ insumo.color }}
            </span>
          </div>

          <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {{ insumo.nombre_descripcion }}
          </p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Compatibilidad: {{ insumo.modelos_compatibles || insumo.marca }}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">Stock Actual / Mínimo</p>
              <p class="text-xl font-black text-zinc-950 dark:text-white">
                {{ insumo.cantidad_actual }}
                <span class="text-xs font-normal text-zinc-500 dark:text-zinc-400">/ mín. {{ insumo.cantidad_minima }}</span>
              </p>
            </div>
            <UBadge
              :color="insumo.cantidad_actual <= insumo.cantidad_minima ? 'rose' : 'emerald'"
              variant="subtle"
            >
              {{ insumo.cantidad_actual <= insumo.cantidad_minima ? 'STOCK CRÍTICO' : 'DISPONIBLE' }}
            </UBadge>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              class="flex-1"
              size="xs"
              color="primary"
              variant="soft"
              icon="i-heroicons-plus-circle"
              label="Reponer Stock"
              @click="abrirReponerStock(insumo)"
            />
            <UButton
              size="xs"
              color="rose"
              variant="soft"
              icon="i-heroicons-trash"
              title="Eliminar insumo"
              @click="abrirEliminarInsumo(insumo)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Historial de Reemplazos en Impresoras -->
    <UCard>
      <template #header>
        <h3 class="font-bold text-zinc-950 dark:text-white">Historial de Reemplazos de Tóner por Impresora</h3>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-cobalto-600 dark:text-cobalto-400">
              <th class="py-3 px-3">Fecha</th>
              <th class="py-3 px-3">Tóner Entregado</th>
              <th class="py-3 px-3">Impresora Destino</th>
              <th class="py-3 px-3">Departamento / Receptor</th>
              <th class="py-3 px-3">Cant.</th>
              <th class="py-3 px-3">Técnico IT</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr v-for="entrega in historialEntregas" :key="entrega.id">
              <td class="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                {{ new Date(entrega.fecha_entrega).toLocaleString() }}
              </td>
              <td class="py-3 px-3 font-bold text-zinc-950 dark:text-white">
                {{ entrega.insumo?.codigo_referencia }} ({{ entrega.insumo?.color }})
              </td>
              <td class="py-3 px-3 text-cobalto-600 dark:text-cobalto-400 font-mono">
                {{ entrega.impresora?.codigo }} — {{ entrega.impresora?.modelo }}
              </td>
              <td class="py-3 px-3">
                {{ entrega.departamento_destino }} ({{ entrega.usuario_receptor }})
              </td>
              <td class="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                -{{ entrega.cantidad_entregada }}
              </td>
              <td class="py-3 px-3 text-zinc-600 dark:text-zinc-300">{{ entrega.tecnico_entregador }}</td>
            </tr>
            <tr v-if="!historialEntregas.length">
              <td colspan="6" class="py-6 text-center text-zinc-500 dark:text-zinc-400">
                No se han registrado salidas de consumibles todavía.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Modal: Registrar Nuevo Insumo -->
    <UModal v-model="modalNuevoInsumo">
      <UCard>
        <template #header>
          <h3 class="font-bold text-zinc-950 dark:text-white">Registrar Tóner o Cartucho en Catálogo</h3>
        </template>
        <form class="space-y-4" @submit.prevent="guardarInsumo">
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Código Referencia" required>
              <UInput v-model="formularioInsumo.codigo_referencia" placeholder="Ej: W2020A, CF230A" class="uppercase" />
            </UFormGroup>
            <UFormGroup label="Color" required>
              <USelect
                v-model="formularioInsumo.color"
                :options="['BLACK', 'CYAN', 'MAGENTA', 'YELLOW']"
              />
            </UFormGroup>
          </div>

          <!-- Aviso si el código ya existe para evitar duplicados -->
          <div
            v-if="insumoExistentePorCodigo"
            class="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between gap-2 text-xs"
          >
            <span class="text-amber-800 dark:text-amber-300">
              <strong>{{ insumoExistentePorCodigo.codigo_referencia }}</strong> ya está registrado (Stock: {{ insumoExistentePorCodigo.cantidad_actual }}).
            </span>
            <UButton
              size="2xs"
              color="amber"
              variant="soft"
              label="Reponer Stock"
              @click="modalNuevoInsumo = false; abrirReponerStock(insumoExistentePorCodigo)"
            />
          </div>

          <UFormGroup label="Descripción del Consumible" required>
            <UInput v-model="formularioInsumo.nombre_descripcion" placeholder="Ej: Tóner HP 414A Negro" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Marca" required>
              <UInput v-model="formularioInsumo.marca" />
            </UFormGroup>
            <UFormGroup label="Seleccionar Impresora Existente">
              <USelectMenu
                v-model="impresoraCompatibleSelector"
                :options="opcionesImpresorasRegistradas"
                value-attribute="valorTexto"
                option-attribute="label"
                searchable
                placeholder="Elegir de inventario..."
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Impresoras Compatibles (puedes elegir arriba o escribir una nueva)">
            <UInput v-model="formularioInsumo.modelos_compatibles" placeholder="Ej: HP LaserJet M254dw / Nueva impresora" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Stock Inicial" required>
              <UInput v-model.number="formularioInsumo.cantidad_actual" type="number" min="0" />
            </UFormGroup>
            <UFormGroup label="Stock Mínimo (Alerta)" required>
              <UInput v-model.number="formularioInsumo.cantidad_minima" type="number" min="0" />
            </UFormGroup>
          </div>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalNuevoInsumo = false" />
            <UButton type="submit" color="primary" label="Guardar Insumo" :loading="guardando" />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: Registrar Salida / Reemplazo en Impresora -->
    <UModal v-model="modalSalidaToner">
      <UCard>
        <template #header>
          <h3 class="font-bold text-zinc-950 dark:text-white">Registrar Reemplazo de Tóner en Impresora</h3>
        </template>
        <form class="space-y-4" @submit.prevent="registrarReemplazoToner">
          <UFormGroup label="Tóner a Entregar" required>
            <USelectMenu
              v-model="formularioEntrega.insumo_id"
              :options="
                listaInsumos.map((i) => ({
                  label: `${i.codigo_referencia} (${i.color}) - Stock: ${i.cantidad_actual}`,
                  value: i.id
                }))
              "
              value-attribute="value"
              option-attribute="label"
              placeholder="Seleccione el consumible..."
            />
          </UFormGroup>

          <UFormGroup label="Impresora del Inventario" required>
            <USelectMenu
              v-model="formularioEntrega.impresora_id"
              :options="
                impresorasDisponibles.map((imp) => ({
                  label: `${imp.codigo} - ${imp.marca} ${imp.modelo} (${imp.departamento})`,
                  value: imp.id
                }))
              "
              value-attribute="value"
              option-attribute="label"
              placeholder="Seleccione la impresora..."
            />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Departamento Destino" required>
              <UInput v-model="formularioEntrega.departamento_destino" />
            </UFormGroup>
            <UFormGroup label="Usuario Solicitante/Receptor" required>
              <UInput v-model="formularioEntrega.usuario_receptor" />
            </UFormGroup>
            <UFormGroup label="Técnico IT que Instala" required>
              <UInput v-model="formularioEntrega.tecnico_entregador" />
            </UFormGroup>
            <UFormGroup label="Cantidad" required>
              <UInput v-model.number="formularioEntrega.cantidad_entregada" type="number" min="1" />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalSalidaToner = false" />
            <UButton
              type="submit"
              color="primary"
              label="Descontar Stock y Registrar"
              :loading="guardando"
            />
          </div>
        </form>
      </UCard>
    </UModal>
    <!-- Modal: Reponer Stock de Tóner Existente -->
    <UModal v-model="modalReponerStock">
      <UCard v-if="insumoAReponer">
        <template #header>
          <h3 class="font-bold text-zinc-950 dark:text-white">
            Reponer Stock — {{ insumoAReponer.codigo_referencia }}
          </h3>
        </template>
        <form class="space-y-4" @submit.prevent="guardarReposicionStock">
          <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
            <p class="font-bold text-zinc-950 dark:text-white">{{ insumoAReponer.nombre_descripcion }}</p>
            <p class="text-zinc-500 dark:text-zinc-400">
              Stock actual: <strong class="text-zinc-950 dark:text-white">{{ insumoAReponer.cantidad_actual }}</strong> unidad(es)
            </p>
          </div>
          <UFormGroup label="Cantidad nueva que ingresa al inventario" required>
            <UInput v-model.number="cantidadAReponer" type="number" min="1" />
          </UFormGroup>
          <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Stock resultante: {{ Number(insumoAReponer.cantidad_actual) + Number(cantidadAReponer || 0) }} unidades
          </p>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalReponerStock = false" />
            <UButton type="submit" color="primary" label="Sumar al Stock" :loading="guardando" />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: Confirmar Eliminación de Insumo -->
    <UModal v-model="modalEliminarInsumo">
      <UCard v-if="insumoAEliminar">
        <template #header>
          <h3 class="font-bold text-rose-600 dark:text-rose-400">
            Eliminar Insumo — {{ insumoAEliminar.codigo_referencia }}
          </h3>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-zinc-700 dark:text-zinc-300">
            ¿Estás seguro de que deseas eliminar del catálogo el modelo
            <strong class="text-zinc-950 dark:text-white">{{ insumoAEliminar.nombre_descripcion }}</strong>?
          </p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">
            Solo se pueden eliminar modelos que aún no tengan entregas registradas en el historial.
          </p>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalEliminarInsumo = false" />
            <UButton
              color="rose"
              icon="i-heroicons-trash"
              label="Eliminar"
              :loading="guardando"
              @click="confirmarEliminarInsumo"
            />
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
