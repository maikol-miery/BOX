<script setup>
const propiedades = defineProps({
  fechaCompra: {
    type: String,
    default: null
  },
  mesesGarantia: {
    type: Number,
    default: 0
  }
});

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
