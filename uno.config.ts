import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno
} from 'unocss'
import presetEase from "unocss-preset-ease";

export default defineConfig({
  rules: [
    ['custom-rule', { color: 'slate-500' }]
  ],
  shortcuts: {
    'custom-shortcut': 'text-lg text-orange hover:text-teal'
  },
  presets: [
    presetUno(),
    presetEase(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      cdn: 'https://esm.sh/'
    }),
    presetTypography(),
  ]
})