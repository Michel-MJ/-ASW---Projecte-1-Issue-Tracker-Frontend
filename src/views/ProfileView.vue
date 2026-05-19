<template>
  <div v-if="user" class="taiga-show-container">
    
    <aside class="issue-sidebar">
      <div style="text-align: center; margin-bottom: 20px;">
        <div v-if="!user.avatar_url" class="avatar" style="width: 120px; height: 120px; font-size: 50px; margin: 0 auto; margin-bottom: 15px;">
          {{ user.full_name ? user.full_name.charAt(0) : user.name.charAt(0) }}
        </div>
        
        <h2 style="color: #008aa8; margin: 0; font-weight: 300;">{{ user.full_name }}</h2>
        <p style="color: #888; margin-top: 5px;">@{{ user.name }}</p>
      </div>

      <div class="sidebar-item divider" style="display: flex; justify-content: space-around; text-align: center;">
        <div>
          <span style="font-weight: bold; font-size: 1.2rem; display: block;">{{ user.open_assigned_count || 0 }}</span>
          <label>Assigned</label>
        </div>
        <div>
          <span style="font-weight: bold; font-size: 1.2rem; display: block;">{{ user.watched_issues_count || 0 }}</span>
          <label>Watched</label>
        </div>
        <div>
          <span style="font-weight: bold; font-size: 1.2rem; display: block;">{{ user.comments_count || 0 }}</span>
          <label>Comments</label>
        </div>
      </div>

      <div class="sidebar-item divider">
        <label>Biografia</label>
        <p class="description-text">{{ user.bio || "Aquest usuari no té biografia." }}</p>
      </div>

      <div class="sidebar-item divider">
        <label>API Key</label>
        <div style="background: #fdfdfd; padding: 10px; border: 1px solid #eee; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 0.9rem;">
          {{ user.api_key }}
        </div>
      </div>
      
      <div class="show-actions divider" style="justify-content: center;">
        <router-link to="/profile/edit" class="btn-edit">EDIT PROFILE</router-link>
      </div>
    </aside>

    <main class="issue-main-content">
      <div class="issue-description-box" style="padding: 0;">
        
        <div style="display: flex; border-bottom: 1px solid #eee; background: #fafafa;">
          <button @click="activeTab = 'assigned'" :class="['tab-link', { active: activeTab === 'assigned' }]">Open Assigned Issues</button>
          <button @click="activeTab = 'watched'" :class="['tab-link', { active: activeTab === 'watched' }]">Watched Issues</button>
          <button @click="activeTab = 'comments'" :class="['tab-link', { active: activeTab === 'comments' }]">Comments</button>
        </div>

        <div style="padding: 30px;">
          <div v-if="activeTab === 'assigned'" class="tab-panel">
            <h3 style="color: #008d8d;">[ Tasca #153 ] Llistat de les teves issues assignades...</h3>
          </div>
          
          <div v-if="activeTab === 'watched'" class="tab-panel">
            <h3 style="color: #008d8d;">[ Tasca #154 ] Llistat de les teves issues observades...</h3>
          </div>

          <div v-if="activeTab === 'comments'" class="tab-panel">
            <h3 style="color: #008d8d;">[ Tasca #155 ] El teu historial de comentaris...</h3>
          </div>
        </div>
      </div>
    </main>

  </div>

  <div v-else style="text-align: center; padding: 50px;">
    Carregant perfil...
  </div>
</template>

<script setup>

import { ref, onMounted, watch } from 'vue'

const user = ref(null)               // Dades de l'usuari
const activeTab = ref('assigned')    // Controla quina pestaña està visible

// Funció per demanar les dades del perfil de l'usuari (simulada amb dades hardcoded)
const fetchProfile = async () => {
  try {
    // Intenta recuperar la API Key desde el almacenamiento local del navegador, o usa un token simulado por defecto
    const currentKey = localStorage.getItem('active_api_key') || 'token_simulat_12345'
    
    // Dades hardcodejades de moment
    user.value = {
      name: "alexmediavilla",
      full_name: "Alex Michel Mediavilla",
      avatar_url: null,
      bio: "Estudiant de la FIB. Desenvolupador Full-Stack en procés.",
      api_key: currentKey,
      open_assigned_count: 3,
      watched_issues_count: 5,
      comments_count: 12
    }
  } catch (error) {
    console.error('Error carregant el perfil:', error)
  }
}

onMounted(() => {
  // Comprueba si l'usuari tenia una pestanya activa guardada anteriorment
  const savedTab = localStorage.getItem('activeProfileTab')
  if (savedTab) activeTab.value = savedTab // Si existeix, restaura la pestaña
  
  fetchProfile()
})

// Monitoritza la variable 'activeTab' en tiempo real
watch(activeTab, (newTab) => {
  // Guarada la pestanya activa actual localment
  localStorage.setItem('activeProfileTab', newTab)
})
</script>