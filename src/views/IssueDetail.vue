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
              </div>
              <p class="comment-content">{{ comment.content }}</p>
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

// Variables pel comentari nou
const newComment = ref('')
const isSubmittingComment = ref(false)

// Funció separada per carregar/recarregar la issue
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

// Carreguem les dades inicials
onMounted(() => {
  fetchIssueData()
})

const deleteIssue = async () => {
  if (confirm("Estàs segur que vols eliminar aquesta incidència? Aquesta acció no es pot desfer.")) {
    try {
      const response = await api.delete(`/issues/${route.params.id}`)
      if (response.status === 204 || response.status === 200) {
        router.push({ name: 'home' }) 
      }
    } catch (error) {
      console.error("Error eliminant la issue:", error)
      alert("No s'ha pogut eliminar la incidència.")
    }
  }
}

// Lògica per enviar el comentari (PATCH)
const submitComment = async () => {
  if (!newComment.value.trim()) return

  isSubmittingComment.value = true
  try {
    await api.patch(`/issues/${route.params.id}`, {
      issue: {
        comments_attributes: [
          { content: newComment.value }
        ]
      }
    })
    
    // Netejem el textarea
    newComment.value = ''
    
    // Recarreguem els detalls per veure el comentari reflectit
    await fetchIssueData()
    
  } catch (error) {
    console.error("Error afegint el comentari:", error)
    alert("Hi ha hagut un problema al publicar el comentari.")
  } finally {
    isSubmittingComment.value = false
  }
}
</script>

<style scoped>
.issue-detail-container {
  max-width: 1100px;
  margin: 40px auto;
  font-family: sans-serif;
  color: #333;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.title-area h1 { margin: 0 0 5px 0; color: #2c3e50; }
.creator { color: #888; font-size: 0.9rem; }

.actions {
  display: flex;
  gap: 10px;
}

.btn-edit {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-edit:hover { background-color: #2980b9; }

.btn-delete {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.btn-delete:hover { background-color: #c0392b; }

.main-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.box {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.box h3 { margin-top: 0; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; color: #555; }

.description-text {
  white-space: pre-wrap; 
  line-height: 1.6;
}

.comment-card {
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
}
.comment-header { font-size: 0.9rem; margin-bottom: 5px; color: #666; }
.comment-content { margin: 0; white-space: pre-wrap; }

/* NOU ESTIL PEL FORMULARI DE COMENTARIS */
.add-comment-box {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px dashed #ccc;
  padding-top: 20px;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.comment-input:focus {
  outline: none;
  border-color: #3498db;
}

.btn-comment {
  align-self: flex-end;
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-comment:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn-comment:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.7;
}

.meta-box ul, .attachments-box ul { list-style: none; padding: 0; margin: 0; }
.meta-box li, .attachments-box li { padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
.meta-box li:last-child, .attachments-box li:last-child { border-bottom: none; }

.attachment-link { color: #3498db; text-decoration: none; font-weight: 500; }
.attachment-link:hover { text-decoration: underline; }

.empty-state { color: #aaa; font-style: italic; }
.loading-state, .error-state { text-align: center; margin-top: 50px; font-size: 1.2rem; }
.error-state { color: #e74c3c; }
</style>