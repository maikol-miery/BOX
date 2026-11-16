<script setup lang="ts">
const propiedades = defineProps<{
  fechaCompra?: string | null;
  mesesGarantia?: number | null;
}>();

const { calcularEstadoGarantia } = usarGarantia();

const datosGarantia = computed(() =>
  calcularEstadoGarantia(propiedades.fechaCompra, propiedades.mesesGarantia)
);
</script>

<template>
  <UBadge
    :color="datosGarantia.color_insignia"
    variant="subtle"
    size="xs"
    class="font-semibold tracking-wide"
  >
    {{ datosGarantia.etiqueta_texto }}
  </UBadge>
</template>
