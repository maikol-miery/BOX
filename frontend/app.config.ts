export default defineAppConfig({
  ui: {
    primary: 'cobalto',
    gray: 'zinc',
    card: {
      background: 'bg-white dark:bg-zinc-900/90',
      ring: 'ring-1 ring-zinc-200/90 dark:ring-zinc-800',
      shadow: 'shadow-sm shadow-zinc-950/5 dark:shadow-none',
      rounded: 'rounded-2xl',
      divide: 'divide-y divide-zinc-100 dark:divide-zinc-800'
    },
    modal: {
      background: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
      overlay: {
        background: 'bg-zinc-950/50 dark:bg-black/80 backdrop-blur-sm'
      }
    },
    table: {
      wrapper: 'relative overflow-x-auto',
      divide: 'divide-y divide-zinc-200 dark:divide-zinc-800',
      tbody: 'divide-y divide-zinc-100 dark:divide-zinc-800/80',
      th: {
        color: 'text-zinc-500 dark:text-zinc-400',
        font: 'font-semibold uppercase tracking-wider text-xs'
      },
      td: {
        color: 'text-zinc-700 dark:text-zinc-200'
      }
    },
    notifications: {
      position: 'top-0 bottom-auto'
    }
  }
});
