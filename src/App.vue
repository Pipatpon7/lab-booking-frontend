<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
/* ใส่ CSS พื้นฐานเพื่อให้หน้าเว็บดูดีขึ้น */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
}
</style>