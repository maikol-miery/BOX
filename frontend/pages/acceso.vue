<script setup>
definePageMeta({
  layout: false
});

const { peticion } = usarApi();
const { guardarSesion, obtenerRutaPermitida } = usarSesion();
const notificaciones = useToast();

const cargandoEstado = ref(true);
const requiereRegistroInicial = ref(false);
const enviando = ref(false);
const errorFormulario = ref('');

const formularioRegistro = reactive({
  nombre_completo: '',
  nombre_usuario: '',
  clave: '',
  confirmar_clave: ''
});

const formularioAcceso = reactive({
  nombre_usuario: '',
  clave: ''
});

const verificarEstadoInicial = async () => {
  cargandoEstado.value = true;
  try {
    const res = await peticion('/auth/estado-inicial');
    requiereRegistroInicial.value = Boolean(res?.requiere_registro_inicial);
  } catch {
    requiereRegistroInicial.value = false;
  } finally {
    cargandoEstado.value = false;
  }
};

const registrarAdminInicial = async () => {
  errorFormulario.value = '';
  if (formularioRegistro.clave !== formularioRegistro.confirmar_clave) {
    errorFormulario.value = 'Las contraseñas no coinciden.';
    return;
  }

  enviando.value = true;
  try {
    const res = await peticion('/auth/registro-inicial', {
      method: 'POST',
      body: {
        nombre_completo: formularioRegistro.nombre_completo,
        nombre_usuario: formularioRegistro.nombre_usuario,
        clave: formularioRegistro.clave
      }
    });

    guardarSesion(res.datos.token, res.datos.usuario);
    notificaciones.add({
      title: 'Administrador Configurado',
      description: 'Bienvenido a BOX - Rodanol.',
      color: 'emerald'
    });
    await navigateTo('/');
  } catch (error) {
    errorFormulario.value =
      error?.data?.errores?.[0]?.mensaje ||
      error?.data?.mensaje ||
      'No se pudo crear la cuenta de administrador.';
  } finally {
    enviando.value = false;
  }
};

const iniciarSesion = async () => {
  errorFormulario.value = '';
  enviando.value = true;
  try {
    const res = await peticion('/auth/iniciar-sesion', {
      method: 'POST',
      body: formularioAcceso
    });

    guardarSesion(res.datos.token, res.datos.usuario);
    notificaciones.add({
      title: 'Sesión Iniciada',
      description: res.mensaje,
      color: 'emerald'
    });
    await navigateTo(obtenerRutaPermitida());
  } catch (error) {
    errorFormulario.value =
      error?.data?.errores?.[0]?.mensaje ||
      error?.data?.mensaje ||
      'Credenciales inválidas.';
  } finally {
    enviando.value = false;
  }
};

onMounted(() => {
  verificarEstadoInicial();
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#0B0B0E] transition-colors">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center space-y-2">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-cobalto-500 flex items-center justify-center shadow-lg shadow-cobalto-500/30">
          <UIcon name="i-heroicons-cube-transparent" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          BOX · Industrias Rodanol
        </h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          Gestión Integral de Activos IT
        </p>
      </div>

      <UCard>
        <div v-if="cargandoEstado" class="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Verificando configuración del sistema...
        </div>

        <!-- Registro del Primer Administrador -->
        <form
          v-else-if="requiereRegistroInicial"
          class="space-y-4"
          @submit.prevent="registrarAdminInicial"
        >
          <div class="p-3 rounded-xl bg-cobalto-50 dark:bg-cobalto-950/40 border border-cobalto-200 dark:border-cobalto-800/60 text-xs text-cobalto-700 dark:text-cobalto-300">
            <p class="font-bold">Configuración Inicial (Primera Vez)</p>
            <p class="mt-0.5">
              Crea la cuenta principal de <strong>Administrador</strong>. Luego podrás crear otras cuentas y definir qué módulos pueden ver o editar.
            </p>
          </div>

          <UFormGroup label="Nombre Completo" required>
            <UInput
              v-model="formularioRegistro.nombre_completo"
              placeholder="Ej: Maikol Mier"
              icon="i-heroicons-user"
            />
          </UFormGroup>

          <UFormGroup label="Nombre de Usuario" required>
            <UInput
              v-model="formularioRegistro.nombre_usuario"
              placeholder="Ej: admin"
              icon="i-heroicons-at-symbol"
            />
          </UFormGroup>

          <UFormGroup label="Contraseña (mín. 6 caracteres)" required>
            <UInput
              v-model="formularioRegistro.clave"
              type="password"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
            />
          </UFormGroup>

          <UFormGroup label="Confirmar Contraseña" required>
            <UInput
              v-model="formularioRegistro.confirmar_clave"
              type="password"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
            />
          </UFormGroup>

          <p v-if="errorFormulario" class="text-xs font-medium text-rose-600 dark:text-rose-400">
            {{ errorFormulario }}
          </p>

          <UButton
            type="submit"
            block
            color="primary"
            size="lg"
            icon="i-heroicons-shield-check"
            label="Crear Administrador y Entrar"
            :loading="enviando"
          />
        </form>

        <!-- Inicio de Sesión Estándar -->
        <form
          v-else
          class="space-y-4"
          @submit.prevent="iniciarSesion"
        >
          <div>
            <h2 class="text-lg font-bold text-zinc-950 dark:text-white">Iniciar Sesión</h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Ingresa con tu usuario asignado para acceder a tus módulos.
            </p>
          </div>

          <UFormGroup label="Usuario" required>
            <UInput
              v-model="formularioAcceso.nombre_usuario"
              placeholder="Ej: admin"
              icon="i-heroicons-user"
            />
          </UFormGroup>

          <UFormGroup label="Contraseña" required>
            <UInput
              v-model="formularioAcceso.clave"
              type="password"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
            />
          </UFormGroup>

          <p v-if="errorFormulario" class="text-xs font-medium text-rose-600 dark:text-rose-400">
            {{ errorFormulario }}
          </p>

          <UButton
            type="submit"
            block
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right-on-rectangle"
            label="Entrar al Sistema"
            :loading="enviando"
          />
        </form>
      </UCard>
    </div>
  </div>
</template>
