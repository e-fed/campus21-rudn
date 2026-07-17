<script setup lang="ts">
import { isRiverPanelActive } from '../../composables/usePanelState'
import { trackGoal } from '../../utils/analytics'
</script>

<template>
  <Transition name="fade-scale">
    <a
      v-if="!isRiverPanelActive"
      href="#register"
      @click="trackGoal('register_button_clicked', { source: 'floating_button' })"
      class="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 bg-school21 hover:bg-school21dark text-black font-bold px-5 py-3 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-sm animate-breathe"
    >
      Записаться →
    </a>
  </Transition>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
