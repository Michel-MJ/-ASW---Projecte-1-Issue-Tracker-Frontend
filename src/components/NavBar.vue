<template>
  <nav class="navbar">
    
    <div class="nav-left">
      <span class="logo">TAIGA</span>
      <router-link to="/issues" class="nav-link">
        Issues
      </router-link>
    </div>
    
    <div class="nav-right">
      
      <router-link to="/settings" class="settings-link">
        <span class="settings-icon">⚙️</span> SETTINGS
      </router-link>

      <div class="user-selector">
        <label for="user-select">Connectat com:</label>
        <select id="user-select" v-model="selectedUserId" @change="changeUser">
          <option v-for="user in usersSelector" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <router-link to="/profile">El meu Perfil</router-link>

    </div>
  </nav>
</template>


<script setup>
import { ref, onMounted } from 'vue'

// Les nostres API Keys reals de Rails aniran aquí, de moment les deixo harcodejades
// És la llista d'usuaris
const usersSelector = [
  { id: 5, name: "MicheelMJ", apiKey: "3691c3dbe69d9da1f5452be45572be11" },
  { id: 4, name: "rogerguinovart", apiKey: "f42ff930a1280208deac455fcd4ec990" },
  { id: 3, name: "Michel-MJ", apiKey: "f09674836e81cd0958676d16c6153d1c" },
  { id: 2, name: "Arnau Hernández", apiKey: "ddff019e8f0abaef01443cf50d4071b6" },
  { id: 6, name: "meritxellsales", apiKey: "63a7908ed1ed188fe930e6431e83e390" }
]

const selectedUserId = ref(3) // Per defecte l'usuari 3

// Funció que s'executa quan canviem l'usuari al dropdown
const changeUser = () => {
  const user = usersSelector.find(u => u.id === selectedUserId.value)
  if (user) {
    // Guardem la API Key al localStorage perquè estigui disponible globalment
    localStorage.setItem('active_api_key', user.apiKey)
    localStorage.setItem('active_user_id', user.id)
    console.log("Usuari canviat a:", user.name, "API Key desada.")
    window.dispatchEvent(new Event('storage'))
  }
}

// Inicialització al carregar l'aplicació
onMounted(() => {
  changeUser()
})
</script>

<style scoped>
/* Estils bàsics per a la Navbar (podeu adaptar-los amb el vostre CSS) */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #33475b;
  color: white;
}
.navbar a {
  color: white;
  text-decoration: none;
  margin-right: 15px;
}
.navbar-menu {
  display: flex;
  align-items: center;
}
.user-selector {
  margin-left: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 5px 10px;
  border-radius: 4px;
}
.user-selector select {
  margin-left: 10px;
}
</style>