import { defineConfig } from 'vite';
export default defineConfig({base:'/anatomia-livre/',build:{rollupOptions:{input:{main:'index.html',catalog:'catalog.html'}}}});
