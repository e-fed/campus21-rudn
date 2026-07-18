<template>
  <svg viewBox="0 0 16 16" class="drop-shadow-md" :class="className" shape-rendering="crispEdges">
    <rect x="2" y="10" width="2" height="2" fill="#90EE90" />
    <rect x="3" y="12" width="2" height="2" fill="#90EE90" />
    <rect x="11" y="12" width="2" height="2" fill="#90EE90" />
    <rect x="4" y="10" width="8" height="2" fill="#B472EE" />
    <rect x="3" y="8" width="10" height="2" fill="#861BE3" />
    <rect x="4" y="7" width="8" height="1" fill="#861BE3" />
    <rect x="5" y="6" width="6" height="1" fill="#861BE3" />
    <rect x="5" y="8" width="2" height="2" fill="#B472EE" />
    <rect x="9" y="8" width="2" height="2" fill="#B472EE" />
    <rect x="12" y="8" width="3" height="3" fill="#90EE90" />
    <rect x="13" y="7" width="2" height="2" fill="#90EE90" />
    <rect x="13" y="8" width="1" height="1" fill="#000000" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>