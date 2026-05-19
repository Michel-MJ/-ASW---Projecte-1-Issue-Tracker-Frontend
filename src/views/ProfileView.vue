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
            
            <div v-if="assignedIssues && assignedIssues.length > 0">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th style="width: 250px;">ISSUE</th>
                    <th class="text-center">TYPE</th>
                    <th class="text-center">SEVERITY</th>
                    <th class="text-center">PRIORITY</th>
                    <th class="text-center">STATUS</th>
                    <th>MODIFIED</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="issue in assignedIssues" :key="issue.id">
                    <td>
                      <span style="color: #008aa8; font-weight: bold; margin-right: 8px;">#{{ issue.id }}</span>
                      <router-link :to="'/issues/' + issue.id" class="issue-link">{{ issue.subject }}</router-link>
                    </td>
                    <td class="text-center">
                      <span class="dot" :style="{ backgroundColor: issue.issue_type?.color || '#ccc' }" :title="issue.issue_type?.name"></span>
                    </td>
                    <td class="text-center">
                      <span class="dot" :style="{ backgroundColor: issue.severity?.color || '#ccc' }" :title="issue.severity?.name"></span>
                    </td>
                    <td class="text-center">
                      <span class="dot" :style="{ backgroundColor: issue.priority?.color || '#ccc' }" :title="issue.priority?.name"></span>
                    </td>
                    <td class="text-center">
                      <span class="status-badge" :style="{ backgroundColor: issue.status?.color || '#e1f5fe', color: '#33475b' }">
                        {{ issue.status?.name || 'New' }}
                      </span>
                    </td>
                    <td style="color: #73818f; font-size: 13px;">
                      {{ formatDate(issue.updated_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-else style="padding: 60px; text-align: center; color: #8a9ab0;">
              No tens cap issue assignada actualment.
            </div>

          </div>
          
          <div v-if="activeTab === 'watched'" class="tab-panel">
            
            <div v-if="watchedIssues && watchedIssues.length > 0">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th style="width: 250px;">ISSUE</th>
                    <th class="text-center">TYPE</th>
                    <th class="text-center">SEVERITY</th>
                    <th class="text-center">PRIORITY</th>
                    <th class="text-center">STATUS</th>
                    <th>MODIFIED</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="issue in watchedIssues" :key="issue.id">
                    <td>
                      <span style="color: #008aa8; font-weight: bold; margin-right: 8px;">#{{ issue.id }}</span>
                      <router-link :to="'/issues/' + issue.id" class="issue-link">{{ issue.subject }}</router-link>
                    </td>
                    <td class="text-center">
                      <span class="dot" :style="{ backgroundColor: issue.issue_type?.color || '#ccc' }" :title="issue.issue_type?.name"></span>
                    </td>
                    <td class="text-center">
                      <span class="dot" :style="{ backgroundColor: issue.severity?.color || '#ccc' }" :title="issue.severity?.name"></span>
                    </td>
                    <td class="text-center">
                      <span class="dot" :style="{ backgroundColor: issue.priority?.color || '#ccc' }" :title="issue.priority?.name"></span>
                    </td>
                    <td class="text-center">
                      <span class="status-badge" :style="{ backgroundColor: issue.status?.color || '#e1f5fe', color: '#33475b' }">
                        {{ issue.status?.name || 'New' }}
                      </span>
                    </td>
                    <td style="color: #73818f; font-size: 13px;">
                      {{ formatDate(issue.updated_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-else style="padding: 60px; text-align: center; color: #8a9ab0;">
              No tens cap issue assignada actualment.
            </div>

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
const assignedIssues = ref([])
const watchedIssues = ref([])

const formatDate = (dateString) => { // Format de data: "DD MMM YYYY" (ejemplo: "15 Mar 2024")
  const options = { day: '2-digit', month: 'short', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-GB', options)
}

// Funció per demanar les dades del perfil de l'usuari (simulada amb dades hardcoded)
const fetchProfile = async () => {
  try {
    // Intenta recuperar la API Key desde el almacenamiento local del navegador, o usa un token simulado por defecto
    const currentKey = localStorage.getItem('active_api_key') || 'token_simulat_12345'
    
    //TODO: Esborrar tots aquests mocks, en principi ja està connectat amb la api
    // Dades hardcodejades de moment
    user.value = {
      name: "alexmediavilla",
      full_name: "Alex Michel Mediavilla",
      avatar_url: null,
      bio: "Estudiant de la FIB. Desenvolupador Full-Stack en procés.",
      api_key: currentKey,
      open_assigned_count: 2,
      watched_issues_count: 5,
      comments_count: 12
    }
    // Mock de dades per a la recuperació d'issues assignades 
    assignedIssues.value = [
      {
        id: 1,
        subject: "Issue 1",
        issue_type: { name: "Bug", color: "#ff4d4d" },
        severity: { name: "High", color: "#ff9900" },
        priority: { name: "High", color: "#ff6600" },
        status: { name: "In Progress", color: "#1890ff" },
        updated_at: "2024-03-15T10:00:00Z"
      },
      {
        id: 2,
        subject: "Issue 2",
        issue_type: { name: "Feature", color: "#52c41a" },
        severity: { name: "Medium", color: "#faad14" },
        priority: { name: "Medium", color: "#f5222d" },
        status: { name: "Open", color: "#e1f5fe" },
        updated_at: "2024-03-14T15:30:00Z"
      }
    ]
    // Mock de dades per a la recuperació d'issues vigilades
    watchedIssues.value = [
      {
        id: 3,
        subject: "Issue 3",
        issue_type: { name: "Bug", color: "#ff4d4d" },
        severity: { name: "High", color: "#ff9900" },
        priority: { name: "High", color: "#ff6600" },
        status: { name: "In Progress", color: "#1890ff" },
        updated_at: "2024-03-13T09:15:00Z"
      },
      {
        id: 4,
        subject: "Issue 4",
        issue_type: { name: "Feature", color: "#52c41a" },
        severity: { name: "Medium", color: "#faad14" },
        priority: { name: "Medium", color: "#f5222d" },
        status: { name: "Open", color: "#e1f5fe" },
        updated_at: "2024-03-12T11:45:00Z"
      }
    ]
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

<style scoped>
.profile-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
.profile-table th {
  background: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.profile-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
.profile-table th.text-center, .profile-table td.text-center {
  text-align: center;
}
</style>