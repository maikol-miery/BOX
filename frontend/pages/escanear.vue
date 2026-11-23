<script setup lang="ts">
const alDetectarCodigo = async (codigo: string) => {
  await navigateTo(`/activos/${encodeURIComponent(codigo)}`);
};
</script>

<template>
  <div class="max-w-xl mx-auto space-y-4">
    <!-- Barra superior de navegación -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton
          to="/"
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          label="Volver al Inicio"
        />
        <h1 class="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <UIcon name="i-heroicons-qr-code" class="w-5 h-5 text-violet-400" />
          Escáner QR en Planta
        </h1>
      </div>

      <UButton
        to="/activos"
        color="gray"
        variant="ghost"
        icon="i-heroicons-computer-desktop"
        label="Inventario"
      />
    </div>

    <!-- Contenedor del Escáner (Sin ventanas flotantes ni modales pegados) -->
    <UCard>
      <template #header>
        <p class="text-xs text-slate-400">
          Apunta la cámara a la etiqueta QR del activo o escribe su código:
        </p>
      </template>

      <ComunEscanerQr @codigo-detectado="alDetectarCodigo" />
    </UCard>
  </div>
</template>
