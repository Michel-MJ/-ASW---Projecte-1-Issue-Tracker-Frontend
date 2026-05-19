<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div id="app">
    <NavBar />

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* No necesitas poner todos tus estilos aquí porque ya los cargamos globalmente en main.js 
Solo ponemos algunos ajustes de layout general si hacen falta.
*/
.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>