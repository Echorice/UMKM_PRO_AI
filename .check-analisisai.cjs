const esbuild = require('esbuild');
esbuild.build({
  entryPoints: ['resources/js/Components/Organisms/AnalisisAI.jsx'],
  bundle: true,
  jsx: 'automatic',
  loader: { '.jsx': 'jsx' },
  external: ['react', 'react-dom', 'recharts', 'lucide-react', '@inertiajs/react', 'laravel-vite-plugin'],
  write: false,
  logLevel: 'error',
}).then(() => {
  console.log('BUNDLE OK');
}).catch((e) => {
  console.error('FAIL');
  console.error(e.message);
  process.exit(1);
});
