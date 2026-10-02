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
  format: 'cjs',
  packages: 'external',
  outdir: 'api',
  outExtension: { '.js': '.cjs' },
  footer: {
    js: 'module.exports = (module.exports && module.exports.default) || module.exports;',
  },
});
