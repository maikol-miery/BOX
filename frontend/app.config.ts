export default defineAppConfig({
  ui: {
    primary: 'violet',
    gray: 'slate',
    card: {
      background: 'bg-slate-900/60 backdrop-blur-md',
      ring: 'ring-1 ring-violet-500/20',
      shadow: 'shadow-xl shadow-violet-500/5',
      rounded: 'rounded-2xl'
    },
    modal: {
      background: 'bg-slate-900 border border-violet-500/30',
      overlay: {
        background: 'bg-slate-950/80 backdrop-blur-sm'
      }
    },
    table: {
      wrapper: 'relative overflow-x-auto',
      th: {
        color: 'text-violet-300',
        font: 'font-semibold uppercase tracking-wider text-xs'
      },
      td: {
        color: 'text-slate-200'
      }
    },
    notifications: {
      position: 'top-0 bottom-auto'
    }
  }
});
