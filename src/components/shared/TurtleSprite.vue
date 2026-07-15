<template>
  <svg
    viewBox="0 0 16 16"
    class="drop-shadow-md"
    :class="className"
    shape-rendering="crispEdges"
  >
    <rect x="2" y="7" width="2" height="2" fill="#90EE90" />
    <rect x="3" y="9" width="2" height="2" fill="#90EE90" />
    <rect x="11" y="9" width="2" height="2" fill="#90EE90" />
    <rect x="4" y="7" width="8" height="2" fill="#B472EE" />
    <rect x="3" y="5" width="10" height="2" fill="#861BE3" />
    <rect x="4" y="4" width="8" height="1" fill="#861BE3" />
    <rect x="5" y="3" width="6" height="1" fill="#861BE3" />
    <rect x="5" y="5" width="2" height="2" fill="#B472EE" />
    <rect x="9" y="5" width="2" height="2" fill="#B472EE" />
    <rect x="12" y="5" width="3" height="3" fill="#90EE90" />
    <rect x="13" y="4" width="2" height="2" fill="#90EE90" />
    <rect x="13" y="5" width="1" height="1" fill="#000000" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>