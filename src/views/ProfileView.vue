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
import api from '../services/api' // El teu servei d'API configurat amb l'interceptor de la API Key

const user = ref(null)
const activeTab = ref('assigned')
const assignedIssues = ref([])
const watchedIssues = ref([])

// Funció per formatar les dates (ex: "19 May 2026")
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const options = { day: '2-digit', month: 'short', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-GB', options)
}

const fetchProfile = async () => {
  try {
    const userId = localStorage.getItem('active_user_id') || 1
    const currentApiKey = localStorage.getItem('active_api_key')
    
    // Crides a la API
    const [userResponse, assignedResponse, watchedResponse] = await Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/users/${userId}/assigned_issues`),
      api.get(`/users/${userId}/watched_issues`)
      // Quan facis la tasca #155 pots afegir aquí: api.get(`/users/${userId}/comments`)
    ])
    
    user.value = userResponse.data
    
    user.value.api_key = currentApiKey
    
    assignedIssues.value = assignedResponse.data || []
    watchedIssues.value = watchedResponse.data || []
    
    user.value.open_assigned_count = assignedIssues.value.length
    user.value.watched_issues_count = watchedIssues.value.length
    // user.value.comments_count = commentsResponse.data.length // (Per a la tasca #155)

  } catch (error) {
    console.error('Error carregant el perfil o les seves llistes:', error)
    
    user.value = {
      name: "Error de conexió",
      full_name: "Backend no disponible",
      bio: "Comprova que el teu Rails està encès i que el CORS et permet l'accés."
    }
  }
}

// Escuchamos si el usuario cambia el selector de la Navbar para recargar los datos
onMounted(() => {
  const savedTab = localStorage.getItem('activeProfileTab')
  if (savedTab) activeTab.value = savedTab
  
  fetchProfile()
  
  window.addEventListener('storage', fetchProfile)
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