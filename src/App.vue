<script setup lang="ts">
import DesignSystemDocumentation from './design-system-documentation.mdx'
import './styles/button.css'
import './styles/card.css'
import './styles/utilities.css'
</script>

<template>
  <DesignSystemDocumentation />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
