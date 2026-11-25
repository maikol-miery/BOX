<script setup>
const propiedades = defineProps({
  modelValue: Boolean,
  activoEditar: {
    type: Object,
    default: null
  }
});

const emitir = defineEmits(['update:modelValue', 'guardado']);

const { peticion } = usarApi();
const { calcularEstadoGarantia } = usarGarantia();
const notificaciones = useToast();
const guardando = ref(false);

const tiposActivo = [
  'SOBREMESA',
  'LAPTOP',
  'SERVIDOR',
  'MONITOR',
  'IMPRESORA',
  'PERIFERICO',
  'CABLE'
];

const estadosActivo = [
  'FUNCIONAL',
  'MANTENIMIENTO',
  'DAÑADO',
  'DESINCORPORADO'
];

const formulario = reactive({
  codigo: '',
  tipo_activo: 'SOBREMESA',
  marca: '',
  modelo: '',
  serial: '',
  departamento: '',
  usuario_custodio: '',
  estado: 'FUNCIONAL',
  es_rotativo: false,
  observaciones: '',
  caracteristicas: {
    procesador: '',
    memoria_ram: '',
    almacenamiento: '',
    direccion_ip: '',
    sistema_operativo: '',
    detalles_adicionales: ''
  },
  // Módulo 6: Control Ligero de Garantías
  proveedor: '',
  numero_factura: '',
  fecha_compra: '',
  meses_garantia: 0
});

const reiniciarFormulario = () => {
  formulario.codigo = '';
  formulario.tipo_activo = 'SOBREMESA';
  formulario.marca = '';
  formulario.modelo = '';
  formulario.serial = '';
  formulario.departamento = '';
  formulario.usuario_custodio = '';
  formulario.estado = 'FUNCIONAL';
  formulario.es_rotativo = false;
  formulario.observaciones = '';
  formulario.caracteristicas = {
    procesador: '',
    memoria_ram: '',
    almacenamiento: '',
    direccion_ip: '',
    sistema_operativo: '',
    detalles_adicionales: ''
  };
  formulario.proveedor = '';
  formulario.numero_factura = '';
  formulario.fecha_compra = '';
  formulario.meses_garantia = 0;
};

watch(
  () => propiedades.activoEditar,
  (activo) => {
    if (activo) {
      formulario.codigo = activo.codigo || '';
      formulario.tipo_activo = activo.tipo_activo || 'SOBREMESA';
      formulario.marca = activo.marca || '';
      formulario.modelo = activo.modelo || '';
      formulario.serial = activo.serial || '';
      formulario.departamento = activo.departamento || '';
      formulario.usuario_custodio = activo.usuario_custodio || '';
      formulario.estado = activo.estado || 'FUNCIONAL';
      formulario.es_rotativo = Boolean(activo.es_rotativo);
      formulario.observaciones = activo.observaciones || '';
      formulario.caracteristicas = {
        procesador: activo.caracteristicas?.procesador || '',
        memoria_ram: activo.caracteristicas?.memoria_ram || '',
        almacenamiento: activo.caracteristicas?.almacenamiento || '',
        direccion_ip: activo.caracteristicas?.direccion_ip || '',
        sistema_operativo: activo.caracteristicas?.sistema_operativo || '',
        detalles_adicionales: activo.caracteristicas?.detalles_adicionales || ''
      };
      formulario.proveedor = activo.proveedor || '';
      formulario.numero_factura = activo.numero_factura || '';
      formulario.fecha_compra = activo.fecha_compra || '';
      formulario.meses_garantia = Number(activo.meses_garantia || 0);
    } else {
      reiniciarFormulario();
    }
  },
  { immediate: true }
);

const vistaPreviaGarantia = computed(() =>
  calcularEstadoGarantia(formulario.fecha_compra, formulario.meses_garantia)
);

const guardarActivo = async () => {
  guardando.value = true;
  try {
    const esEdicion = Boolean(propiedades.activoEditar?.id);
    const ruta = esEdicion ? `/activos/${propiedades.activoEditar.id}` : '/activos';
    const metodo = esEdicion ? 'PUT' : 'POST';

    const respuesta = await peticion(ruta, {
      method: metodo,
      body: formulario
    });

    notificaciones.add({
      title: 'Operación Exitosa',
      description: respuesta.mensaje,
      color: 'emerald'
    });

    emitir('guardado');
    emitir('update:modelValue', false);
  } catch (error) {
    const detalle =
      error?.data?.errores?.[0]?.mensaje ||
      error?.data?.mensaje ||
      'No se pudo guardar el activo.';
    notificaciones.add({
      title: 'Error de Validación',
      description: detalle,
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <UModal
    :model-value="modelValue"
    :ui="{ width: 'sm:max-w-3xl' }"
    @update:model-value="emitir('update:modelValue', $event)"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-zinc-950 dark:text-white">
              {{ activoEditar ? `Editar Activo ${activoEditar.codigo}` : 'Registrar Nuevo Activo Informático' }}
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Ficha técnica de hardware y control ligero de garantía
            </p>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="emitir('update:modelValue', false)"
          />
        </div>
      </template>

      <form class="space-y-5" @submit.prevent="guardarActivo">
        <!-- Sección 1: Identificación y Custodia -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UFormGroup label="Código Único (QR)" required>
            <UInput v-model="formulario.codigo" placeholder="Ej: V-01, M-05, P-01" class="uppercase" />
          </UFormGroup>

          <UFormGroup label="Tipo de Activo" required>
            <USelect v-model="formulario.tipo_activo" :options="tiposActivo" />
          </UFormGroup>

          <UFormGroup label="Estado Operativo" required>
            <USelect v-model="formulario.estado" :options="estadosActivo" />
          </UFormGroup>

          <UFormGroup label="Marca" required>
            <UInput v-model="formulario.marca" placeholder="Ej: HP, VIT, Dell, Lenovo" />
          </UFormGroup>

          <UFormGroup label="Modelo" required>
            <UInput v-model="formulario.modelo" placeholder="Ej: ProBook 450 G8" />
          </UFormGroup>

          <UFormGroup label="Número de Serial">
            <UInput v-model="formulario.serial" placeholder="Serial de fábrica" />
          </UFormGroup>

          <UFormGroup label="Departamento Asignado" required>
            <UInput v-model="formulario.departamento" placeholder="Ej: Ventas, Administración, Planta" />
          </UFormGroup>

          <UFormGroup label="Usuario Custodio" required>
            <UInput v-model="formulario.usuario_custodio" placeholder="Nombre del trabajador responsable" />
          </UFormGroup>

          <UFormGroup label="¿Equipo Rotativo (Préstamos)?">
            <div class="pt-2">
              <UCheckbox
                v-model="formulario.es_rotativo"
                label="Habilitar para préstamos temporales"
              />
            </div>
          </UFormGroup>
        </div>

        <!-- Sección 2: Características Técnicas -->
        <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <p class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400">
            Especificaciones Técnicas (Hardware / Red)
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <UFormGroup label="Procesador (CPU)">
              <UInput v-model="formulario.caracteristicas.procesador" placeholder="Ej: Intel Core i5 11va Gen" />
            </UFormGroup>
            <UFormGroup label="Memoria RAM">
              <UInput v-model="formulario.caracteristicas.memoria_ram" placeholder="Ej: 16 GB DDR4" />
            </UFormGroup>
            <UFormGroup label="Almacenamiento">
              <UInput v-model="formulario.caracteristicas.almacenamiento" placeholder="Ej: SSD NVMe 512 GB" />
            </UFormGroup>
            <UFormGroup label="Sistema Operativo">
              <UInput v-model="formulario.caracteristicas.sistema_operativo" placeholder="Ej: Windows 11 Pro" />
            </UFormGroup>
            <UFormGroup label="Dirección IP (Impresoras/Servidores)">
              <UInput v-model="formulario.caracteristicas.direccion_ip" placeholder="Ej: 192.168.10.45" />
            </UFormGroup>
            <UFormGroup label="Detalles Adicionales">
              <UInput v-model="formulario.caracteristicas.detalles_adicionales" placeholder="Pulgadas, puertos, tóner..." />
            </UFormGroup>
          </div>
        </div>

        <!-- Sección 3: Módulo 6 - Control Ligero de Garantías -->
        <div class="p-4 rounded-xl bg-cobalto-50/60 dark:bg-cobalto-500/10 border border-cobalto-200 dark:border-cobalto-500/30 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400">
              Módulo 6: Control Ligero de Garantía
            </p>
            <UBadge :color="vistaPreviaGarantia.color_insignia" variant="subtle" size="xs">
              {{ vistaPreviaGarantia.etiqueta_texto }}
            </UBadge>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <UFormGroup label="Proveedor">
              <UInput v-model="formulario.proveedor" placeholder="Empresa proveedora" />
            </UFormGroup>
            <UFormGroup label="Fecha de Compra">
              <UInput v-model="formulario.fecha_compra" type="date" />
            </UFormGroup>
            <UFormGroup label="Meses de Garantía">
              <UInput v-model.number="formulario.meses_garantia" type="number" min="0" />
            </UFormGroup>
            <UFormGroup label="N° Factura (Opcional)">
              <UInput v-model="formulario.numero_factura" placeholder="Ej: FAC-00412" />
            </UFormGroup>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <UButton
            color="gray"
            variant="ghost"
            label="Cancelar"
            @click="emitir('update:modelValue', false)"
          />
          <UButton
            type="submit"
            color="primary"
            icon="i-heroicons-check"
            :loading="guardando"
            :label="activoEditar ? 'Guardar Cambios' : 'Registrar Activo'"
          />
        </div>
      </form>
    </UCard>
  </UModal>
</template>
