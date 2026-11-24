<script setup>
const { peticion } = usarApi();
const notificaciones = useToast();

const listaInsumos = ref([]);
const historialEntregas = ref([]);
const impresorasDisponibles = ref([]);

const modalNuevoInsumo = ref(false);
const modalSalidaToner = ref(false);
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
  BLACK: 'bg-slate-800 text-white border-slate-600',
  CYAN: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  MAGENTA: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  YELLOW: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
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
        <h1 class="text-2xl font-extrabold text-white">
          Control de Insumos de Impresión (Tóners y Cartuchos)
        </h1>
        <p class="text-sm text-slate-400">
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
          color="violet"
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
            <span class="font-mono font-extrabold text-lg text-white">
              {{ insumo.codigo_referencia }}
            </span>
            <span
              class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
              :class="estiloColorToner[insumo.color]"
            >
              {{ insumo.color }}
            </span>
          </div>

          <p class="text-sm font-semibold text-slate-200">
            {{ insumo.nombre_descripcion }}
          </p>
          <p class="text-xs text-slate-400 mt-1">
            Compatibilidad: {{ insumo.modelos_compatibles || insumo.marca }}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-violet-500/20 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-slate-400">Stock Actual / Mínimo</p>
            <p class="text-xl font-black text-white">
              {{ insumo.cantidad_actual }}
              <span class="text-xs font-normal text-slate-400">/ mín. {{ insumo.cantidad_minima }}</span>
            </p>
          </div>
          <UBadge
            :color="insumo.cantidad_actual <= insumo.cantidad_minima ? 'rose' : 'emerald'"
            variant="subtle"
          >
            {{ insumo.cantidad_actual <= insumo.cantidad_minima ? 'STOCK CRÍTICO' : 'DISPONIBLE' }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Historial de Reemplazos en Impresoras -->
    <UCard>
      <template #header>
        <h3 class="font-bold text-white">Historial de Reemplazos de Tóner por Impresora</h3>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-violet-500/20 text-xs uppercase text-violet-300">
              <th class="py-3 px-3">Fecha</th>
              <th class="py-3 px-3">Tóner Entregado</th>
              <th class="py-3 px-3">Impresora Destino</th>
              <th class="py-3 px-3">Departamento / Receptor</th>
              <th class="py-3 px-3">Cant.</th>
              <th class="py-3 px-3">Técnico IT</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="entrega in historialEntregas" :key="entrega.id">
              <td class="py-3 px-3 text-slate-400">
                {{ new Date(entrega.fecha_entrega).toLocaleString() }}
              </td>
              <td class="py-3 px-3 font-bold text-white">
                {{ entrega.insumo?.codigo_referencia }} ({{ entrega.insumo?.color }})
              </td>
              <td class="py-3 px-3 text-violet-300 font-mono">
                {{ entrega.impresora?.codigo }} — {{ entrega.impresora?.modelo }}
              </td>
              <td class="py-3 px-3">
                {{ entrega.departamento_destino }} ({{ entrega.usuario_receptor }})
              </td>
              <td class="py-3 px-3 font-bold text-emerald-400">
                -{{ entrega.cantidad_entregada }}
              </td>
              <td class="py-3 px-3 text-slate-300">{{ entrega.tecnico_entregador }}</td>
            </tr>
            <tr v-if="!historialEntregas.length">
              <td colspan="6" class="py-6 text-center text-slate-500">
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
          <h3 class="font-bold text-white">Registrar Tóner o Cartucho en Catálogo</h3>
        </template>
        <form class="space-y-4" @submit.prevent="guardarInsumo">
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Código Referencia" required>
              <UInput v-model="formularioInsumo.codigo_referencia" placeholder="Ej: W2020A, CF230A" />
            </UFormGroup>
            <UFormGroup label="Color" required>
              <USelect
                v-model="formularioInsumo.color"
                :options="['BLACK', 'CYAN', 'MAGENTA', 'YELLOW']"
              />
            </UFormGroup>
          </div>
          <UFormGroup label="Descripción del Consumible" required>
            <UInput v-model="formularioInsumo.nombre_descripcion" placeholder="Ej: Tóner HP 414A Negro" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Marca" required>
              <UInput v-model="formularioInsumo.marca" />
            </UFormGroup>
            <UFormGroup label="Impresoras Compatibles">
              <UInput v-model="formularioInsumo.modelos_compatibles" placeholder="Ej: LaserJet M254dw" />
            </UFormGroup>
            <UFormGroup label="Stock Inicial" required>
              <UInput v-model.number="formularioInsumo.cantidad_actual" type="number" min="0" />
            </UFormGroup>
            <UFormGroup label="Stock Mínimo (Alerta)" required>
              <UInput v-model.number="formularioInsumo.cantidad_minima" type="number" min="0" />
            </UFormGroup>
          </div>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalNuevoInsumo = false" />
            <UButton type="submit" color="violet" label="Guardar Insumo" :loading="guardando" />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: Registrar Salida / Reemplazo en Impresora -->
    <UModal v-model="modalSalidaToner">
      <UCard>
        <template #header>
          <h3 class="font-bold text-white">Registrar Reemplazo de Tóner en Impresora</h3>
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
              color="violet"
              label="Descontar Stock y Registrar"
              :loading="guardando"
            />
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
