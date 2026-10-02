import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: {
    health: 'server/handlers/health.ts',
    'calendar/status': 'server/handlers/calendarStatus.ts',
    'calendar/availability': 'server/handlers/calendarAvailability.ts',
    'calendar/book': 'server/handlers/calendarBook.ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outdir: 'api',
});
