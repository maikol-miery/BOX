<script setup>
const { peticion } = usarApi();
const { tienePermiso } = usarSesion();
const notificaciones = useToast();

const listaResiduos = ref([]);
const listaActivos = ref([]);
const modalNuevoResiduo = ref(false);
const actaSeleccionada = ref(null);
const guardando = ref(false);

const formularioResiduo = reactive({
  activo_id: undefined,
  codigo_acta: `ACTA-RAEE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900 + 100))}`,
  diagnostico_tecnico: '',
  piezas_faltantes: '',
  componentes_recuperados: '',
  destino_final: 'DESINCORPORACION',
  fecha_ingreso_banco: new Date().toISOString().split('T')[0],
  fecha_baja_definitiva: new Date().toISOString().split('T')[0],
  tecnico_evaluador: '',
  autorizado_por: 'Gerencia de Tecnología e Información',
  observaciones_auditoria: ''
});

const cargarDatos = async () => {
  const [resRaee, resActivos] = await Promise.all([
    peticion('/residuos'),
    peticion('/activos')
  ]);
  listaResiduos.value = resRaee.datos;
  listaActivos.value = resActivos.datos;
};

const guardarRegistroRaee = async () => {
  guardando.value = true;
  try {
    const res = await peticion('/residuos', {
      method: 'POST',
      body: formularioResiduo
    });
    notificaciones.add({
      title: 'Acta RAEE Generada',
      description: res.mensaje,
      color: 'emerald'
    });
    modalNuevoResiduo.value = false;
    await cargarDatos();
    actaSeleccionada.value = res.datos;
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

const imprimirActaAuditoria = (residuo) => {
  actaSeleccionada.value = residuo;
  setTimeout(() => {
    window.print();
  }, 200);
};

onMounted(() => {
  cargarDatos();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Vista de Gestión en Pantalla (Oculta al imprimir el Acta) -->
    <div class="ocultar-en-impresion space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-zinc-950 dark:text-white">
            Banco de Pruebas y Residuos Electrónicos (RAEE)
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Control de canibalización de piezas, reciclaje electrónico y Actas de Desincorporación para auditoría
          </p>
        </div>

        <UButton
          v-if="tienePermiso('residuos', 'editar')"
          color="primary"
          icon="i-heroicons-document-Check"
          label="Registrar Baja / Acta RAEE"
          @click="modalNuevoResiduo = true"
        />
      </div>

      <!-- Tarjetas del Banco de Pruebas y RAEE -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in listaResiduos"
          :key="item.id"
          class="tarjeta-cristal p-5 space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-cobalto-600 dark:text-cobalto-400 text-sm">
              {{ item.codigo_acta }}
            </span>
            <UBadge
              :color="
                item.destino_final === 'RECICLAJE'
                  ? 'emerald'
                  : item.destino_final === 'DONACION'
                    ? 'amber'
                    : 'rose'
              "
              variant="subtle"
            >
              {{ item.destino_final }}
            </UBadge>
          </div>

          <div>
            <p class="font-bold text-zinc-950 dark:text-white text-base">
              Activo {{ item.activo?.codigo }} — {{ item.activo?.tipo_activo }} {{ item.activo?.marca }} {{ item.activo?.modelo }}
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Diagnóstico: {{ item.diagnostico_tecnico }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <span class="text-rose-600 dark:text-rose-400 font-semibold block">Piezas Faltantes:</span>
              <span class="text-zinc-600 dark:text-zinc-300">{{ item.piezas_faltantes || 'Ninguna' }}</span>
            </div>
            <div>
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold block">Componentes Recuperados:</span>
              <span class="text-zinc-600 dark:text-zinc-300">{{ item.componentes_recuperados || 'Ninguno' }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluador: {{ item.tecnico_evaluador }} ({{ item.fecha_ingreso_banco }})
            </span>
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              icon="i-heroicons-printer"
              label="Imprimir Acta de Desincorporación"
              @click="imprimirActaAuditoria(item)"
            />
          </div>
        </div>
      </div>

      <UCard v-if="!listaResiduos.length" class="text-center py-8">
        <p class="text-zinc-500 dark:text-zinc-400 text-sm">
          No hay equipos registrados en el Banco de Pruebas o Residuos Electrónicos RAEE.
        </p>
      </UCard>
    </div>

    <!-- Vista Imprimible del Acta de Desincorporación para Auditoría -->
    <div v-if="actaSeleccionada" class="hidden mostrar-solo-impresion p-8 bg-white text-black">
      <div class="border-2 border-black p-6 space-y-6">
        <div class="flex justify-between items-center border-b-2 border-black pb-4">
          <div>
            <h1 class="text-xl font-black uppercase">INDUSTRIAS RODANOL, S.A.</h1>
            <p class="text-xs font-bold">DEPARTAMENTO DE TECNOLOGÍA E INFORMACIÓN (SISTEMA BOX)</p>
          </div>
          <div class="text-right text-xs font-bold">
            <p>ACTA N°: {{ actaSeleccionada.codigo_acta }}</p>
            <p>FECHA: {{ actaSeleccionada.fecha_ingreso_banco }}</p>
          </div>
        </div>

        <h2 class="text-center text-lg font-black uppercase underline">
          ACTA DE DESINCORPORACIÓN Y CLASIFICACIÓN DE RESIDUOS ELECTRÓNICOS (RAEE)
        </h2>

        <div class="grid grid-cols-2 gap-4 text-sm border border-black p-4">
          <p><strong>Código del Activo:</strong> {{ actaSeleccionada.activo?.codigo }}</p>
          <p><strong>Tipo de Equipo:</strong> {{ actaSeleccionada.activo?.tipo_activo }}</p>
          <p><strong>Marca / Modelo:</strong> {{ actaSeleccionada.activo?.marca }} {{ actaSeleccionada.activo?.modelo }}</p>
          <p><strong>Serial:</strong> {{ actaSeleccionada.activo?.serial || 'S/N' }}</p>
          <p><strong>Departamento Origen:</strong> {{ actaSeleccionada.activo?.departamento }}</p>
          <p><strong>Destino Final RAEE:</strong> {{ actaSeleccionada.destino_final }}</p>
        </div>

        <div class="space-y-3 text-sm">
          <p><strong>Diagnóstico Técnico de Baja:</strong> {{ actaSeleccionada.diagnostico_tecnico }}</p>
          <p><strong>Piezas Faltantes Identificadas:</strong> {{ actaSeleccionada.piezas_faltantes || 'N/A' }}</p>
          <p><strong>Componentes Recuperados (Canibalización IT):</strong> {{ actaSeleccionada.componentes_recuperados || 'N/A' }}</p>
          <p><strong>Observaciones de Auditoría:</strong> {{ actaSeleccionada.observaciones_auditoria || 'Disposición conforme a normas ambientales RAEE.' }}</p>
        </div>

        <div class="grid grid-cols-2 gap-12 pt-16 text-center text-xs font-bold">
          <div class="border-t border-black pt-2">
            {{ actaSeleccionada.tecnico_evaluador }}<br />
            TÉCNICO EVALUADOR IT
          </div>
          <div class="border-t border-black pt-2">
            {{ actaSeleccionada.autorizado_por || 'GERENCIA DE IT / AUDITORÍA' }}<br />
            AUTORIZADO POR INDUSTRIAS RODANOL, S.A.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Registrar Ingreso al Banco RAEE -->
    <UModal v-model="modalNuevoResiduo" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <h3 class="font-bold text-zinc-950 dark:text-white">Registrar Equipo en Banco de Pruebas / RAEE</h3>
        </template>
        <form class="space-y-4" @submit.prevent="guardarRegistroRaee">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Activo a Evaluar / Desincorporar" required>
              <USelectMenu
                v-model="formularioResiduo.activo_id"
                :options="
                  listaActivos.map((a) => ({
                    label: `${a.codigo} - ${a.tipo_activo} ${a.marca} ${a.modelo}`,
                    value: a.id
                  }))
                "
                value-attribute="value"
                option-attribute="label"
                placeholder="Seleccione el activo..."
              />
            </UFormGroup>

            <UFormGroup label="Código de Acta de Auditoría" required>
              <UInput v-model="formularioResiduo.codigo_acta" />
            </UFormGroup>

            <UFormGroup label="Destino Final del Residuo" required>
              <USelect
                v-model="formularioResiduo.destino_final"
                :options="['DESINCORPORACION', 'RECICLAJE', 'DONACION']"
              />
            </UFormGroup>

            <UFormGroup label="Fecha de Ingreso al Banco" required>
              <UInput v-model="formularioResiduo.fecha_ingreso_banco" type="date" />
            </UFormGroup>
          </div>

          <UFormGroup label="Diagnóstico Técnico" required>
            <UTextarea
              v-model="formularioResiduo.diagnostico_tecnico"
              placeholder="Ej: Tarjeta madre sulfatada sin reparación viable"
            />
          </UFormGroup>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Piezas Faltantes">
              <UInput v-model="formularioResiduo.piezas_faltantes" placeholder="Ej: Falta disco duro" />
            </UFormGroup>
            <UFormGroup label="Componentes Recuperados (Canibalización)">
              <UInput v-model="formularioResiduo.componentes_recuperados" placeholder="Ej: Fuente de poder aprovechable" />
            </UFormGroup>
            <UFormGroup label="Técnico Evaluador" required>
              <UInput v-model="formularioResiduo.tecnico_evaluador" />
            </UFormGroup>
            <UFormGroup label="Autorizado Por">
              <UInput v-model="formularioResiduo.autorizado_por" />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalNuevoResiduo = false" />
            <UButton type="submit" color="primary" label="Generar Acta RAEE" :loading="guardando" />
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
