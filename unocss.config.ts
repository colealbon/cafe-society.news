import { presetTypography, defineConfig, presetAttributify, presetUno } from 'unocss'
export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography()
  ],
})
