import { resolve } from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import WindiCSS from 'vite-plugin-windicss'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import windiConfig from './windi.config'

const port = parseInt(process.env.PORT || '') || 3309
const r = (...args: string[]) => resolve(__dirname, ...args)
const DEV_GOOGLE_OAUTH2_CLIENT_ID = "34932676923-luth1cmkkhoqhq3kaoealqj2poosaln4.apps.googleusercontent.com"
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    define: {
      'VITE_GOOGLE_OAUTH2_CLIENTID': isDev ? JSON.stringify(DEV_GOOGLE_OAUTH2_CLIENT_ID) : undefined,
    },
    root: r('src'),
    base: isDev ? `http://localhost:${port}/` : undefined,
    resolve: {
      alias: {
        '~/': `${r('src')}/`,
      },
    },
    server: {
      port,
      hmr: {
        host: 'localhost',
      },
    },
    build: {
      outDir: r('extension/prod'),
      emptyOutDir: false,
      sourcemap: isDev ? 'inline' : false,
      rollupOptions: {
        input: {
          popup: r('src/popup/index.html'),
          options: r('src/options/index.html'),
        },
      },
    },
    plugins: [
      Vue(),

      Components({
        dirs: [r('src/components')],
        // auto import icons
        resolvers: [
          IconsResolver({
            prefix: '',
          }),
        ],
      }),

      Icons(),

      // https://github.com/antfu/vite-plugin-windicss
      WindiCSS({
        config: windiConfig,
      }),

      // https://github.com/intlify/vite-plugin-vue-i18n
      VueI18n({
        include: [resolve(__dirname, 'src/locales/**')],
      }),

      // rewrite assets to use relative path
      {
        name: 'assets-rewrite',
        enforce: 'post',
        apply: 'build',
        transformIndexHtml(html) {
          return html.replace(/"\/assets\//g, '"../assets/')
        },
      },
    ],

    optimizeDeps: {
      include: [
        'vue',
        '@vueuse/core',
      ],
      exclude: [
        'vue-demi',
      ],
    },
  }
})
