import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';
import unocssPlugin from "unocss/vite"
import { presetUno, presetAttributify} from 'unocss'

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    unocssPlugin({
      presets: [
        presetAttributify({ /* preset options */}),
        presetUno()
        // ...custom presets
      ]
    }),
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
