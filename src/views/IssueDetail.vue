<template>
  <div v-if="loading" class="loading-state">
    Carregant detalls de la incidència...
  </div>
  
  <div v-else-if="issue" class="issue-detail-container">
    <header class="issue-header">
      <div class="title-area">
        <h1>{{ issue.subject }}</h1>
        <span class="creator">Creada per: {{ issue.user?.name || issue.user?.email || 'Desconegut' }}</span>
      </div>
      <div class="actions">
        <button @click="$router.push({ name: 'issue-edit', params: { id: issue.id } })" class="btn-edit">Editar Issue</button>
        <button @click="deleteIssue" class="btn-delete">Eliminar Issue</button>
      </div>
    </header>

    <div class="main-layout">
      <section class="content-column">
        <div class="box description-box">
          <h3>Descripció</h3>
          <p class="description-text">{{ issue.description }}</p>
        </div>

        <div class="box comments-box">
          <h3>Comentaris ({{ issue.comments?.length || 0 }})</h3>
          
          <div v-if="issue.comments && issue.comments.length > 0" class="comments-list">
            <div v-for="comment in issue.comments" :key="comment.id" class="comment-card">
              <div class="comment-header">
                <strong>{{ comment.user?.name || 'Usuari' }}</strong>
                <div class="comment-actions">
                  <button @click="startEdit(comment)" class="btn-icon">✏️</button>
                  <button @click="removeComment(comment.id)" class="btn-icon">🗑️</button>
                </div>
              </div>

              <div v-if="editingId === comment.id" class="edit-area">
                <textarea v-model="editText" class="comment-input" rows="2"></textarea>
                <div class="edit-buttons">
                  <button @click="editingId = null" class="btn-cancel">Cancel·lar</button>
                  <button @click="saveEdit(comment.id)" class="btn-save">Guardar</button>
                </div>
              </div>
              <p v-else class="comment-content">{{ comment.content }}</p>
            </div>
          </div>
          <p v-else class="empty-state">No hi ha cap comentari encara.</p>

          <div class="add-comment-box">
            <textarea 
              v-model="newComment" 
              placeholder="Escriu un nou comentari..." 
              class="comment-input"
              rows="3"
            ></textarea>
            <button 
              @click="submitComment" 
              class="btn-comment" 
              :disabled="isSubmittingComment || !newComment.trim()"
            >
              {{ isSubmittingComment ? 'Publicant...' : 'Comentar' }}
            </button>
          </div>
        </div>
      </section>

      <aside class="sidebar-column">
        <div class="box meta-box">
          <h3>Detalls</h3>
          <ul>
            <li><strong>Estat:</strong> {{ issue.status?.name || '-' }}</li>
            <li><strong>Tipus:</strong> {{ issue.issue_type?.name || '-' }}</li>
            <li><strong>Prioritat:</strong> {{ issue.priority?.name || '-' }}</li>
            <li><strong>Severitat:</strong> {{ issue.severity?.name || '-' }}</li>
            <li><strong>Assignat a:</strong> {{ issue.assignee?.name || 'Ningú' }}</li>
          </ul>
        </div>

        <div class="box attachments-box">
          <h3>Adjunts</h3>
          <ul v-if="issue.attachments && issue.attachments.length > 0">
            <li v-for="att in issue.attachments" :key="att.id">
               <a :href="att.url" target="_blank" class="attachment-link">📎 {{ att.filename }}</a>
            </li>
          </ul>
          <p v-else class="empty-state">Sense adjunts.</p>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="error-state">
    Error: No s'ha pogut trobar la incidència.
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const issue = ref(null)
const loading = ref(true)
const newComment = ref('')
const isSubmittingComment = ref(false)

// Estats per edició
const editingId = ref(null)
const editText = ref('')

const fetchIssueData = async () => {
  try {
    const response = await api.get(`/issues/${route.params.id}`)
    issue.value = response.data
  } catch (error) {
    console.error("Error carregant la issue:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchIssueData() })

const deleteIssue = async () => {
  if (confirm("Estàs segur que vols eliminar aquesta incidència?")) {
    try {
      await api.delete(`/issues/${route.params.id}`)
      router.push({ name: 'home' }) 
    } catch (error) { 
      alert(error.response?.data?.error || "No s'ha pogut eliminar.") 
    }
  }
}

// ------------------------------------------------------------------
// GESTIÓ DE COMENTARIS (Connectat 100% amb el nou backend)
// ------------------------------------------------------------------

// POST: Crear Comentari
const submitComment = async () => {
  if (!newComment.value.trim()) return
  isSubmittingComment.value = true
  
  try {
    await api.post(`/issues/${route.params.id}/comments`, { 
      comment: { content: newComment.value } 
    })
    newComment.value = ''
    await fetchIssueData() // Recarreguem per veure el nou comentari
  } catch (e) { 
    // Mostrem l'error real que ens envia el Ruby (ex: User must exist, etc)
    alert(e.response?.data?.error || e.response?.data?.errors?.[0] || "Error al publicar el comentari") 
  } finally { 
    isSubmittingComment.value = false 
  }
}

// PREPARAR EDICIÓ
const startEdit = (c) => { 
  editingId.value = c.id
  editText.value = c.content 
}

// PATCH: Guardar Edició
const saveEdit = async (id) => {
  if (!editText.value.trim()) {
    alert("El comentari no pot estar buit")
    return
  }

  try {
    await api.patch(`/issues/${route.params.id}/comments/${id}`, { 
      comment: { content: editText.value } 
    })
    editingId.value = null
    await fetchIssueData() // Recarreguem per veure els canvis
  } catch (e) { 
    // Aquí saltarà el 403 Forbidden de Ruby si no ets l'autor
    alert(e.response?.data?.error || "Error al editar el comentari") 
  }
}

// DELETE: Esborrar Comentari
const removeComment = async (id) => {
  if(confirm("Segur que vols esborrar aquest comentari?")) {
    try {
      await api.delete(`/issues/${route.params.id}/comments/${id}`)
      await fetchIssueData() // Recarreguem la llista sense el comentari
    } catch (e) { 
      // Aquí també saltarà el 403 si intentes esborrar el comentari d'un altre
      alert(e.response?.data?.error || "Error al esborrar el comentari") 
    }
  }
}
</script>

<style scoped>
/* Estils existents + estils per la edició */
.issue-detail-container { max-width: 1100px; margin: 40px auto; font-family: sans-serif; color: #333; }
.issue-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
.actions { display: flex; gap: 10px; }
.btn-edit { background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-delete { background-color: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.main-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
.box { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.box h3 { margin-top: 0; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; color: #555; }
.description-text { white-space: pre-wrap; line-height: 1.6; }
.comment-card { background: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 6px; margin-bottom: 10px; }
.comment-header { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px; color: #666; }
.comment-content { margin: 0; white-space: pre-wrap; }
.add-comment-box { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; border-top: 1px dashed #ccc; padding-top: 20px; }
.comment-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-comment { align-self: flex-end; background-color: #2ecc71; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }

/* NOU: Estils botons acció comentari */
.comment-actions { display: flex; gap: 8px; }
.btn-icon { background: none; border: none; cursor: pointer; opacity: 0.5; font-size: 1rem; }
.edit-area { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
.edit-buttons { display: flex; justify-content: flex-end; gap: 5px; }
.btn-save { background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: #ccc; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
</style>