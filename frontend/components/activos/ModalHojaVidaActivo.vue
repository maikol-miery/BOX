<script setup lang="ts">
const propiedades = defineProps<{
  modelValue: boolean;
  activo: any | null;
}>();

const emitir = defineEmits<{
  (e: 'update:modelValue', valor: boolean): void;
}>();
</script>

<template>
  <UModal
    :model-value="modelValue"
    :ui="{ width: 'sm:max-w-3xl' }"
    @update:model-value="emitir('update:modelValue', $event)"
  >
    <UCard v-if="activo">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="px-3 py-1.5 rounded-xl bg-violet-600/30 border border-violet-400/40 font-extrabold text-white text-lg">
              {{ activo.codigo }}
            </div>
            <div>
              <h3 class="font-bold text-white text-base">
                Hoja de Vida — {{ activo.tipo_activo }} {{ activo.marca }} {{ activo.modelo }}
              </h3>
              <p class="text-xs text-slate-400">
                Custodio: {{ activo.usuario_custodio }} | {{ activo.departamento }}
              </p>
            </div>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="emitir('update:modelValue', false)"
          />
        </div>
      </template>

      <ActivosContenidoHojaVidaActivo :activo="activo" />
    </UCard>
  </UModal>
</template>
