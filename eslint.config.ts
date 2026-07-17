import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import eslintConfigPrettier from 'eslint-config-prettier'

// https://eslint.vuejs.org/user-guide/#usage
export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.netlify/**',
    ],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    name: 'app/rule-overrides',
    rules: {
      // В проекте осознанно используются короткие однословные имена
      // компонентов (Logo, River, Employers) — это стиль проекта, не ошибка
      'vue/multi-word-component-names': 'off',
    },
  },

  // oxlint уже покрывает часть быстрых стилевых правил (запускается отдельным
  // скриптом lint:oxlint) — отключаем те же правила здесь, чтобы не дублировать
  // одинаковые предупреждения дважды в npm run lint
  ...pluginOxlint.configs['flat/recommended'],

  eslintConfigPrettier,
)