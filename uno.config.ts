import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'
import { presetKobalte } from 'unocss-preset-primitives'

export default defineConfig({
  rules: [
    ['custom-rule', { color: 'red' }]
  ],
  shortcuts: {
    'custom-shortcut': 'text-lg text-orange hover:text-teal'
  },
  presets: [
    presetUno(),
    presetKobalte(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    }),
  ]
})