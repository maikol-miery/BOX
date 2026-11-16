<script setup lang="ts">
const { peticion, descargarArchivoExcel } = usarApi();
const notificaciones = useToast();

const listaJornadas = ref<any[]>([]);
const listaActivos = ref<any[]>([]);
const jornadaActiva = ref<any | null>(null);

const modalNuevaJornada = ref(false);
const modalRegistrarChequeo = ref(false);
const guardando = ref(false);

const formularioJornada = reactive({
  codigo_formulario: 'IR-SI-FO-001',
  titulo_actividad: 'Revisión de SO, archivos temporales, caché y políticas de uso',
  descripcion_tareas: '',
  departamento_objetivo: 'TODOS LOS DEPARTAMENTOS',
  tecnico_responsable: '',
  fecha_inicio: new Date().toISOString().split('T')[0]
});

const formularioChequeo = reactive({
  activo_id: undefined as number | undefined,
  usuario_atendido: '',
  departamento: '',
  ejecutado: 'SI',
  fecha_ejecucion: new Date().toISOString().split('T')[0],
  observaciones: '',
  firma_conformidad_base64: ''
});

const cargarDatos = async () => {
  const [resJornadas, resActivos] = await Promise.all([
    peticion<{ exito: boolean; datos: any[] }>('/mantenimientos'),
    peticion<{ exito: boolean; datos: any[] }>('/activos')
  ]);
  listaJornadas.value = resJornadas.datos;
  listaActivos.value = resActivos.datos;
  if (listaJornadas.value.length > 0 && !jornadaActiva.value) {
    jornadaActiva.value = listaJornadas.value[0];
  } else if (jornadaActiva.value) {
    jornadaActiva.value =
      listaJornadas.value.find((j) => j.id === jornadaActiva.value.id) || listaJornadas.value[0];
  }
};

// Autocompletar usuario y departamento al seleccionar el activo
watch(
  () => formularioChequeo.activo_id,
  (idSeleccionado) => {
    const activo = listaActivos.value.find((a) => a.id === Number(idSeleccionado));
    if (activo) {
      formularioChequeo.usuario_atendido = activo.usuario_custodio;
      formularioChequeo.departamento = activo.departamento;
    }
  }
);

const crearJornada = async () => {
  guardando.value = true;
  try {
    const respuesta = await peticion<{ exito: boolean; mensaje: string; datos: any }>(
      '/mantenimientos',
      {
        method: 'POST',
        body: formularioJornada
      }
    );
    notificaciones.add({
      title: 'Jornada Creada',
      description: respuesta.mensaje,
      color: 'emerald'
    });
    modalNuevaJornada.value = false;
    await cargarDatos();
    jornadaActiva.value = respuesta.datos;
  } catch (error: any) {
    notificaciones.add({
      title: 'Error',
      description: error?.data?.errores?.[0]?.mensaje || 'No se pudo crear la jornada.',
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const guardarChequeoConFirma = async () => {
  if (!jornadaActiva.value) return;
  guardando.value = true;
  try {
    const respuesta = await peticion<{ exito: boolean; mensaje: string }>(
      `/mantenimientos/${jornadaActiva.value.id}/registros`,
      {
        method: 'POST',
        body: formularioChequeo
      }
    );
    notificaciones.add({
      title: 'Conformidad Registrada',
      description: respuesta.mensaje,
      color: 'emerald'
    });
    modalRegistrarChequeo.value = false;
    formularioChequeo.firma_conformidad_base64 = '';
    formularioChequeo.observaciones = '';
    await cargarDatos();
  } catch (error: any) {
    notificaciones.add({
      title: 'Validación Requerida',
      description:
        error?.data?.errores?.[0]?.mensaje ||
        error?.data?.mensaje ||
        'Verifique los datos y la firma digital.',
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const exportarExcelJornada = async (jornada: any) => {
  try {
    await descargarArchivoExcel(
      `/mantenimientos/${jornada.id}/exportar-excel`,
      `Formato_${jornada.codigo_formulario}_Jornada_${jornada.id}.xlsx`
    );
    notificaciones.add({
      title: 'Libro Excel Generado',
      description: `Se descargó el formato institucional ${jornada.codigo_formulario} con firmas.`,
      color: 'emerald'
    });
  } catch {
    notificaciones.add({
      title: 'Error al exportar Excel',
      description: 'No fue posible descargar el reporte .xlsx.',
      color: 'rose'
    });
  }
};

onMounted(() => {
  cargarDatos();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-extrabold text-white">
            Mantenimiento Preventivo Digital
          </h1>
          <UBadge color="violet" variant="subtle">IR-SI-FO-001</UBadge>
        </div>
        <p class="text-sm text-slate-400">
          Lista de chequeo en planta con captura de firma digital táctil y exportación a Excel multi-pestaña
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-plus-circle"
          label="Nueva Jornada"
          @click="modalNuevaJornada = true"
        />
        <UButton
          v-if="jornadaActiva"
          color="emerald"
          variant="soft"
          icon="i-heroicons-arrow-down-tray"
          label="Exportar Excel IR-SI-FO-001"
          @click="exportarExcelJornada(jornadaActiva)"
        />
        <UButton
          v-if="jornadaActiva"
          color="violet"
          icon="i-heroicons-pencil"
          label="Registrar Chequeo y Firma"
          @click="modalRegistrarChequeo = true"
        />
      </div>
    </div>

    <!-- Selector de Jornadas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="jornada in listaJornadas"
        :key="jornada.id"
        class="p-4 rounded-2xl cursor-pointer transition-all border"
        :class="
          jornadaActiva?.id === jornada.id
            ? 'bg-violet-950/40 border-violet-500 shadow-lg shadow-violet-500/15'
            : 'bg-slate-900/60 border-violet-500/20 hover:border-violet-500/40'
        "
        @click="jornadaActiva = jornada"
      >
        <div class="flex items-center justify-between mb-2">
          <UBadge color="violet" variant="subtle" size="xs">
            {{ jornada.codigo_formulario }}
          </UBadge>
          <span class="text-xs text-slate-400">{{ jornada.fecha_inicio }}</span>
        </div>
        <h3 class="font-bold text-white text-sm line-clamp-2">
          {{ jornada.titulo_actividad }}
        </h3>
        <p class="text-xs text-violet-300 mt-1">
          Técnico: {{ jornada.tecnico_responsable }}
        </p>
        <p class="text-xs text-slate-400 mt-2">
          Equipos chequeados: <strong class="text-white">{{ jornada.registros_ejecucion?.length || 0 }}</strong>
        </p>
      </div>
    </div>

    <!-- Tabla del Formato IR-SI-FO-001 de la Jornada Seleccionada -->
    <UCard v-if="jornadaActiva">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="font-bold text-white">
              Planilla de Ejecución: {{ jornadaActiva.titulo_actividad }}
            </h2>
            <p class="text-xs text-slate-400">
              Departamento objetivo: {{ jornadaActiva.departamento_objetivo }} | Responsable: {{ jornadaActiva.tecnico_responsable }}
            </p>
          </div>
          <UBadge color="emerald" variant="subtle">
            {{ jornadaActiva.registros_ejecucion?.length || 0 }} Firmas Digitales Capturadas
          </UBadge>
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-violet-500/20 text-xs uppercase text-violet-300">
              <th class="py-3 px-3">Activo</th>
              <th class="py-3 px-3">Usuario Custodio</th>
              <th class="py-3 px-3">Departamento</th>
              <th class="py-3 px-3">Ejecutado</th>
              <th class="py-3 px-3">Fecha</th>
              <th class="py-3 px-3">Observaciones</th>
              <th class="py-3 px-3">Firma de Conformidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr
              v-for="reg in jornadaActiva.registros_ejecucion"
              :key="reg.id"
            >
              <td class="py-3 px-3 font-mono font-bold text-violet-300">
                {{ reg.activo?.codigo }} — {{ reg.activo?.marca }}
              </td>
              <td class="py-3 px-3 text-white font-medium">{{ reg.usuario_atendido }}</td>
              <td class="py-3 px-3 text-slate-300">{{ reg.departamento }}</td>
              <td class="py-3 px-3">
                <UBadge :color="reg.ejecutado === 'SI' ? 'emerald' : 'rose'" variant="subtle">
                  {{ reg.ejecutado }}
                </UBadge>
              </td>
              <td class="py-3 px-3 text-slate-400">{{ reg.fecha_ejecucion }}</td>
              <td class="py-3 px-3 text-slate-300">{{ reg.observaciones || 'Conforme' }}</td>
              <td class="py-3 px-3">
                <img
                  :src="reg.firma_conformidad_base64"
                  alt="Firma Digital"
                  class="h-11 bg-white rounded-lg p-1 border border-violet-500/40"
                />
              </td>
            </tr>
            <tr v-if="!jornadaActiva.registros_ejecucion?.length">
              <td colspan="7" class="py-8 text-center text-slate-400">
                Aún no hay equipos firmados en esta jornada. Haz clic en "Registrar Chequeo y Firma".
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Modal: Crear Nueva Jornada -->
    <UModal v-model="modalNuevaJornada">
      <UCard>
        <template #header>
          <h3 class="font-bold text-white">Nueva Jornada de Mantenimiento (IR-SI-FO-001)</h3>
        </template>
        <form class="space-y-4" @submit.prevent="crearJornada">
          <UFormGroup label="Actividad Preventiva" required>
            <UInput
              v-model="formularioJornada.titulo_actividad"
              placeholder="Ej: Limpieza interna y externa de impresoras"
            />
          </UFormGroup>
          <UFormGroup label="Descripción de Tareas">
            <UTextarea v-model="formularioJornada.descripcion_tareas" />
          </UFormGroup>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Departamento Objetivo" required>
              <UInput v-model="formularioJornada.departamento_objetivo" />
            </UFormGroup>
            <UFormGroup label="Técnico Responsable" required>
              <UInput v-model="formularioJornada.tecnico_responsable" placeholder="Nombre del técnico IT" />
            </UFormGroup>
          </div>
          <UFormGroup label="Fecha de Inicio" required>
            <UInput v-model="formularioJornada.fecha_inicio" type="date" />
          </UFormGroup>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalNuevaJornada = false" />
            <UButton type="submit" color="violet" label="Crear Jornada" :loading="guardando" />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: Registrar Ejecución y Capturar Firma Digital Táctil -->
    <UModal v-model="modalRegistrarChequeo" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <h3 class="font-bold text-white">
            Chequeo de Equipo y Firma Digital de Conformidad
          </h3>
        </template>

        <form class="space-y-4" @submit.prevent="guardarChequeoConFirma">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormGroup label="Activo Evaluado" required>
              <USelectMenu
                v-model="formularioChequeo.activo_id"
                :options="
                  listaActivos.map((a) => ({
                    label: `${a.codigo} - ${a.tipo_activo} ${a.marca} (${a.usuario_custodio})`,
                    value: a.id
                  }))
                "
                value-attribute="value"
                option-attribute="label"
                placeholder="Seleccione el activo..."
              />
            </UFormGroup>

            <UFormGroup label="¿Mantenimiento Ejecutado?" required>
              <USelect v-model="formularioChequeo.ejecutado" :options="['SI', 'NO']" />
            </UFormGroup>

            <UFormGroup label="Usuario Atendido" required>
              <UInput v-model="formularioChequeo.usuario_atendido" />
            </UFormGroup>

            <UFormGroup label="Departamento" required>
              <UInput v-model="formularioChequeo.departamento" />
            </UFormGroup>

            <UFormGroup label="Fecha de Ejecución" required>
              <UInput v-model="formularioChequeo.fecha_ejecucion" type="date" />
            </UFormGroup>

            <UFormGroup label="Observaciones Técnicas">
              <UInput v-model="formularioChequeo.observaciones" placeholder="Ej: Limpieza de caché y temporales OK" />
            </UFormGroup>
          </div>

          <!-- Componente Táctil de Firma Digital -->
          <ComunLienzoFirma
            v-model="formularioChequeo.firma_conformidad_base64"
            etiqueta="Firma Digital de Conformidad del Usuario Custodio"
          />

          <div class="flex justify-end gap-2 pt-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalRegistrarChequeo = false" />
            <UButton
              type="submit"
              color="violet"
              icon="i-heroicons-check-badge"
              label="Guardar Chequeo y Firma"
              :loading="guardando"
            />
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
