import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/vercelEntry.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  outfile: 'api/[...path].cjs',
  // Vercel invokes module.exports as the request handler.
  footer: {
    js: 'module.exports = (module.exports && module.exports.default) || module.exports;',
  },
});
