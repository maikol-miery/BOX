<script setup>
const { peticion } = usarApi();
const { usuarioActual } = usarSesion();
const notificaciones = useToast();

const catalogoModulos = [
  { clave: 'tablero', nombre: 'Tablero Principal' },
  { clave: 'activos', nombre: 'Parque Informático' },
  { clave: 'etiquetas', nombre: 'Etiquetas QR' },
  { clave: 'mantenimientos', nombre: 'Mantenimiento Preventivo' },
  { clave: 'insumos', nombre: 'Insumos de Impresión' },
  { clave: 'prestamos', nombre: 'Préstamos y Custodia' },
  { clave: 'residuos', nombre: 'Banco de Pruebas y RAEE' }
];

const crearPermisosBase = () => {
  const mapa = {};
  for (const mod of catalogoModulos) {
    mapa[mod.clave] = { ver: true, editar: false };
  }
  return mapa;
};

const listaUsuarios = ref([]);
const modalFormulario = ref(false);
const modalEliminar = ref(false);
const usuarioEditando = ref(null);
const usuarioAEliminar = ref(null);
const guardando = ref(false);

const formulario = reactive({
  nombre_completo: '',
  nombre_usuario: '',
  clave: '',
  rol: 'USUARIO',
  activo: true,
  permisos: crearPermisosBase()
});

const cargarUsuarios = async () => {
  const res = await peticion('/usuarios');
  listaUsuarios.value = res.datos;
};

const abrirCrearUsuario = () => {
  usuarioEditando.value = null;
  formulario.nombre_completo = '';
  formulario.nombre_usuario = '';
  formulario.clave = '';
  formulario.rol = 'USUARIO';
  formulario.activo = true;
  formulario.permisos = crearPermisosBase();
  modalFormulario.value = true;
};

const abrirEditarUsuario = (usuario) => {
  usuarioEditando.value = usuario;
  formulario.nombre_completo = usuario.nombre_completo;
  formulario.nombre_usuario = usuario.nombre_usuario;
  formulario.clave = '';
  formulario.rol = usuario.rol;
  formulario.activo = usuario.activo;
  const permisosCopia = {};
  for (const mod of catalogoModulos) {
    permisosCopia[mod.clave] = {
      ver: Boolean(usuario.permisos?.[mod.clave]?.ver),
      editar: Boolean(usuario.permisos?.[mod.clave]?.editar)
    };
  }
  formulario.permisos = permisosCopia;
  modalFormulario.value = true;
};

const alCambiarVer = (claveModulo, valor) => {
  formulario.permisos[claveModulo].ver = valor;
  if (!valor) {
    formulario.permisos[claveModulo].editar = false;
  }
};

const alCambiarEditar = (claveModulo, valor) => {
  formulario.permisos[claveModulo].editar = valor;
  if (valor) {
    formulario.permisos[claveModulo].ver = true;
  }
};

const guardarUsuario = async () => {
  guardando.value = true;
  try {
    if (usuarioEditando.value) {
      const cuerpo = {
        nombre_completo: formulario.nombre_completo,
        rol: formulario.rol,
        activo: formulario.activo,
        permisos: formulario.permisos
      };
      if (formulario.clave.trim()) {
        cuerpo.clave = formulario.clave;
      }
      const res = await peticion(`/usuarios/${usuarioEditando.value.id}`, {
        method: 'PUT',
        body: cuerpo
      });
      notificaciones.add({
        title: 'Cuenta Actualizada',
        description: res.mensaje,
        color: 'emerald'
      });
    } else {
      const res = await peticion('/usuarios', {
        method: 'POST',
        body: {
          nombre_completo: formulario.nombre_completo,
          nombre_usuario: formulario.nombre_usuario,
          clave: formulario.clave,
          rol: formulario.rol,
          activo: formulario.activo,
          permisos: formulario.permisos
        }
      });
      notificaciones.add({
        title: 'Cuenta Creada',
        description: res.mensaje,
        color: 'emerald'
      });
    }
    modalFormulario.value = false;
    await cargarUsuarios();
  } catch (error) {
    notificaciones.add({
      title: 'Error',
      description: error?.data?.errores?.[0]?.mensaje || error?.data?.mensaje || 'No se pudo guardar.',
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const abrirEliminar = (usuario) => {
  usuarioAEliminar.value = usuario;
  modalEliminar.value = true;
};

const confirmarEliminar = async () => {
  if (!usuarioAEliminar.value) return;
  guardando.value = true;
  try {
    const res = await peticion(`/usuarios/${usuarioAEliminar.value.id}`, {
      method: 'DELETE'
    });
    notificaciones.add({
      title: 'Cuenta Eliminada',
      description: res.mensaje,
      color: 'emerald'
    });
    modalEliminar.value = false;
    usuarioAEliminar.value = null;
    await cargarUsuarios();
  } catch (error) {
    notificaciones.add({
      title: 'No se pudo eliminar',
      description: error?.data?.mensaje || 'Error al eliminar el usuario.',
      color: 'rose'
    });
  } finally {
    guardando.value = false;
  }
};

const resumenPermisos = (usuario) => {
  if (usuario.rol === 'ADMIN') return 'Acceso total a todos los módulos';
  const visibles = catalogoModulos.filter((m) => usuario.permisos?.[m.clave]?.ver);
  if (!visibles.length) return 'Sin módulos asignados';
  return visibles
    .map((m) => `${m.nombre.split(' ')[0]} (${usuario.permisos?.[m.clave]?.editar ? 'Ver/Editar' : 'Solo Ver'})`)
    .join(' · ');
};

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-zinc-950 dark:text-white">
          Gestión de Cuentas y Permisos
        </h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          Crea cuentas secundarias y controla exactamente qué módulos puede ver o editar cada usuario
        </p>
      </div>

      <UButton
        color="primary"
        icon="i-heroicons-user-plus"
        label="Nueva Cuenta"
        @click="abrirCrearUsuario"
      />
    </div>

    <!-- Tabla de Usuarios -->
    <UCard>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-cobalto-600 dark:text-cobalto-400">
              <th class="py-3 px-3">Nombre</th>
              <th class="py-3 px-3">Usuario</th>
              <th class="py-3 px-3">Rol</th>
              <th class="py-3 px-3">Estado</th>
              <th class="py-3 px-3">Alcance de Módulos</th>
              <th class="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr v-for="usuario in listaUsuarios" :key="usuario.id">
              <td class="py-3 px-3 font-semibold text-zinc-950 dark:text-white">
                {{ usuario.nombre_completo }}
              </td>
              <td class="py-3 px-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                @{{ usuario.nombre_usuario }}
              </td>
              <td class="py-3 px-3">
                <UBadge :color="usuario.rol === 'ADMIN' ? 'primary' : 'gray'" variant="subtle">
                  {{ usuario.rol }}
                </UBadge>
              </td>
              <td class="py-3 px-3">
                <UBadge :color="usuario.activo ? 'emerald' : 'rose'" variant="subtle">
                  {{ usuario.activo ? 'ACTIVO' : 'INACTIVO' }}
                </UBadge>
              </td>
              <td class="py-3 px-3 text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                {{ resumenPermisos(usuario) }}
              </td>
              <td class="py-3 px-3">
                <div class="flex justify-end gap-2">
                  <UButton
                    size="xs"
                    color="gray"
                    variant="soft"
                    icon="i-heroicons-pencil-square"
                    label="Permisos"
                    @click="abrirEditarUsuario(usuario)"
                  />
                  <UButton
                    v-if="usuario.id !== usuarioActual?.id"
                    size="xs"
                    color="rose"
                    variant="soft"
                    icon="i-heroicons-trash"
                    title="Eliminar cuenta"
                    @click="abrirEliminar(usuario)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Modal: Crear / Editar Usuario -->
    <UModal v-model="modalFormulario" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <h3 class="font-bold text-zinc-950 dark:text-white">
            {{ usuarioEditando ? `Editar Cuenta (@${usuarioEditando.nombre_usuario})` : 'Registrar Nueva Cuenta' }}
          </h3>
        </template>

        <form class="space-y-4" @submit.prevent="guardarUsuario">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormGroup label="Nombre Completo" required>
              <UInput v-model="formulario.nombre_completo" placeholder="Ej: Carlos Pérez" />
            </UFormGroup>

            <UFormGroup label="Usuario de Acceso" :required="!usuarioEditando">
              <UInput
                v-model="formulario.nombre_usuario"
                :disabled="Boolean(usuarioEditando)"
                placeholder="Ej: cperez"
              />
            </UFormGroup>

            <UFormGroup
              :label="usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña (mín. 6 caracteres)'"
              :required="!usuarioEditando"
            >
              <UInput v-model="formulario.clave" type="password" placeholder="••••••••" />
            </UFormGroup>

            <UFormGroup label="Rol de Cuenta" required>
              <USelect
                v-model="formulario.rol"
                :options="[
                  { label: 'USUARIO (Permisos por módulo)', value: 'USUARIO' },
                  { label: 'ADMIN (Control total)', value: 'ADMIN' }
                ]"
                option-attribute="label"
                value-attribute="value"
              />
            </UFormGroup>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
            <div>
              <p class="text-sm font-semibold text-zinc-950 dark:text-white">Cuenta Activa</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Desactívala para suspender su acceso sin borrar el historial</p>
            </div>
            <UToggle v-model="formulario.activo" />
          </div>

          <!-- Matriz de Permisos por Módulo -->
          <div
            v-if="formulario.rol === 'USUARIO'"
            class="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div class="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
              <p class="text-xs font-bold uppercase tracking-wider text-cobalto-600 dark:text-cobalto-400">
                Permisos por Módulo
              </p>
            </div>
            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
              <div
                v-for="mod in catalogoModulos"
                :key="mod.clave"
                class="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span class="font-medium text-zinc-800 dark:text-zinc-200">{{ mod.nombre }}</span>
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <UCheckbox
                      :model-value="formulario.permisos[mod.clave].ver"
                      @update:model-value="(val) => alCambiarVer(mod.clave, val)"
                    />
                    Ver
                  </label>
                  <label class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <UCheckbox
                      :model-value="formulario.permisos[mod.clave].editar"
                      @update:model-value="(val) => alCambiarEditar(mod.clave, val)"
                    />
                    Editar
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="p-3 rounded-xl bg-cobalto-50 dark:bg-cobalto-950/40 border border-cobalto-200 dark:border-cobalto-800/60 text-xs text-cobalto-700 dark:text-cobalto-300"
          >
            Los usuarios con rol <strong>ADMIN</strong> tienen acceso completo de lectura, edición y gestión de cuentas.
          </div>

          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalFormulario = false" />
            <UButton
              type="submit"
              color="primary"
              :label="usuarioEditando ? 'Guardar Cambios' : 'Crear Cuenta'"
              :loading="guardando"
            />
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Modal: Confirmar Eliminación -->
    <UModal v-model="modalEliminar">
      <UCard v-if="usuarioAEliminar">
        <template #header>
          <h3 class="font-bold text-rose-600 dark:text-rose-400">
            Eliminar Cuenta (@{{ usuarioAEliminar.nombre_usuario }})
          </h3>
        </template>
        <div class="space-y-4">
          <p class="text-sm text-zinc-700 dark:text-zinc-300">
            ¿Estás seguro de que deseas eliminar la cuenta de
            <strong class="text-zinc-950 dark:text-white">{{ usuarioAEliminar.nombre_completo }}</strong>?
          </p>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" label="Cancelar" @click="modalEliminar = false" />
            <UButton
              color="rose"
              icon="i-heroicons-trash"
              label="Eliminar"
              :loading="guardando"
              @click="confirmarEliminar"
            />
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
