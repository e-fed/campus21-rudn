<template>
  <svg
    viewBox="0 0 16 16"
    class="drop-shadow-md"
    :class="className"
    shape-rendering="crispEdges"
  >
    <rect x="4" y="8" width="8" height="6" fill="#FFD700" />
    <rect x="3" y="9" width="10" height="4" fill="#FFD700" />
    <rect x="5" y="4" width="6" height="5" fill="#FFD700" />
    <rect x="10" y="6" width="4" height="2" fill="#FF8C00" />
    <rect x="8" y="5" width="1" height="1" fill="#000000" />
    <rect x="5" y="10" width="4" height="2" fill="#E6C200" />
    <rect x="2" y="9" width="2" height="2" fill="#E6C200" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>