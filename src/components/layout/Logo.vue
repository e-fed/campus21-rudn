<script setup lang="ts">
import school21LogoLight from '@/assets/images/school-21-logo.svg'
import school21LogoDark from '@/assets/images/school-21-logo-dark.svg'
import rudnLogoLight from '@/assets/images/rudn-logo.svg'
import rudnLogoDark from '@/assets/images/rudn-logo-dark.svg'
import xIcon from '@/assets/images/x-icon.svg'

defineProps<{
  isDark: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-[clamp(0.4rem,1.5vw,2.125rem)] min-w-0 shrink-0">
    <a href="https://21-school.ru/" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-70 shrink-0">
      <img
        :src="isDark ? school21LogoLight : school21LogoDark"
        alt="Логотип «Школа 21»"
        class="h-auto w-[clamp(26px,4vw,69px)]"
      />
    </a>
    <img
      :src="xIcon"
      alt="×"
      class="h-auto w-[clamp(0.7rem,1.5vw,1.688rem)] dark:invert shrink-0"
    />
    <a href="https://www.rudn.ru/" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-70 shrink-0">
      <img
        :src="isDark ? rudnLogoLight : rudnLogoDark"
        alt="Логотип РУДН"
        class="h-auto w-[clamp(70px,9vw,154px)]"
      />
    </a>
  </div>
</template>