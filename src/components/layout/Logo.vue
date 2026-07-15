<script setup lang="ts">
import school21LogoLight from '@/assets/images/school-21-logo.svg'
import school21LogoDark from '@/assets/images/school-21-logo-dark.svg'
import rudnLogoLight from '@/assets/images/rudn-logo.svg'
import rudnLogoDark from '@/assets/images/rudn-logo-dark.svg'
import rudnLogoSmallLight from '@/assets/images/rudn-logo-small.svg'
import rudnLogoSmallDark from '@/assets/images/rudn-logo-small-dark.svg'
import xIcon from '@/assets/images/x-icon.svg'

defineProps<{
  isDark: boolean
  isDocked?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-[clamp(0.4rem,1.5vw,2.125rem)] -ml-2 sm:-ml-8">
    <a href="https://21-school.ru/" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-70">
      <img
        :src="isDark ? school21LogoLight : school21LogoDark"
        alt="Логотип «Школа 21»"
        class="h-auto w-[clamp(26px,4vw,69px)]"
      />
    </a>
    <img
      :src="xIcon"
      alt="×"
      class="h-auto w-[clamp(0.7rem,1.5vw,1.688rem)] dark:invert"
    />
    <a href="https://www.rudn.ru/" target="_blank" rel="noopener noreferrer" class="transition-opacity hover:opacity-70">
      <img
        :src="isDocked
          ? (isDark ? rudnLogoSmallLight : rudnLogoSmallDark)
          : (isDark ? rudnLogoLight : rudnLogoDark)"
        alt="Логотип РУДН"
        class="h-auto transition-all duration-500"
        :class="isDocked ? 'w-[clamp(40px,4vw,70px)]' : 'w-[clamp(70px,9vw,154px)]'"
      />
    </a>
  </div>
</template>