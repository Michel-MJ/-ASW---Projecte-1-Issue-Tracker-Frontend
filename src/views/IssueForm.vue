<template>
  <div class="issue-container">
    <h1 class="form-title">{{ isEditing ? 'Edit issue' : 'New issue' }}</h1>

    <form @submit.prevent="submitIssue" class="issue-form">
      <div v-if="submitErrors.length > 0" class="error-box">
        <strong>Error! Could not save:</strong>
        <ul>
          <li v-for="(err, idx) in submitErrors" :key="idx">{{ err }}</li>
        </ul>
      </div>

      <div class="form-layout">
        <div class="main-column">
          <div class="field">
            <input v-model="issue.subject" placeholder="Subject" class="input-subject" required />
          </div>

          <div class="status-dropdown">
            <label class="label">Tags</label>
            <select v-model="issue.tags" multiple class="select-tags-multi">
              <option v-for="tag in tagsList" :key="tag.id" :value="tag.name">{{ tag.name }}</option>
            </select>
          </div>

          <div class="field" style="margin-top: 20px;">
            <textarea v-model="issue.description" placeholder="Please add descriptive text..." class="input-description"></textarea>
          </div>

          <div class="attachments-section">
            <div class="attachments-header">
              <span>Attachments</span>
            </div>
            <div style="padding: 20px;">
              <input type="file" multiple @change="handleFileUpload" />
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div class="status-dropdown">
            <select v-model="issue.status" class="select-status-main" required>
              <option :value="null">Select Status</option>
              <option v-for="s in statusesList" :key="s.id" :value="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="status-dropdown">
            <select v-model="issue.assignee" class="select-assignee">
              <option :value="null">Assign to</option>
              <option v-for="u in usersList" :key="u.id" :value="u.name">{{ u.name }}</option>
            </select>
          </div>

          <hr class="sep">

          <div class="meta-item">
            <span class="label">Type</span>
            <select v-model="issue.type" class="meta-select" required>
              <option v-for="t in typesList" :key="t.id" :value="t.name">{{ t.name }}</option>
            </select>
          </div>

          <div class="meta-item">
            <span class="label">Severity</span>
            <select v-model="issue.severity" class="meta-select" required>
              <option v-for="s in severitiesList" :key="s.id" :value="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="meta-item">
            <span class="label">Priority</span>
            <select v-model="issue.priority" class="meta-select" required>
              <option v-for="p in prioritiesList" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>

          <div class="action-icons">
            <div class="calendar-wrapper btn-icon">
              <span>🕒</span>
              <input type="date" v-model="issue.due_date" class="input-fecha-overlay" />
            </div>
          </div>
        </aside>
      </div>

      <button type="submit" class="btn-submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'SAVING...' : 'CONFIRM' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'
import '../assets/new_issue.css' 

const router = useRouter()
const route = useRoute()

// Mirem si hi ha un ID a la URL (ex: /issues/123/edit) per saber si estem editant
const isEditing = computed(() => !!route.params.id)

const issue = ref({ 
  subject: '', 
  description: '', 
  type: null, 
  severity: null, 
  priority: null, 
  status: null, 
  assignee: null, 
  due_date: '', 
  tags: []
})

const filesToUpload = ref([])
const typesList = ref([])
const severitiesList = ref([])
const prioritiesList = ref([])
const statusesList = ref([])
const usersList = ref([])
const tagsList = ref([])

const submitErrors = ref([])
const isSubmitting = ref(false)

onMounted(async () => {
  try {
    // 1. Carreguem les dades dels desplegables en paral·lel
    // Posem un .catch() als usuaris perquè si encara no existeix la ruta al backend, no trenqui la resta!
    const [t, s, p, st, u, tg] = await Promise.all([
      api.get('/issue_types'), 
      api.get('/severities'), 
      api.get('/priorities'), 
      api.get('/statuses'), 
      api.get('/users').catch(() => ({ data: [] })), 
      api.get('/tags')
    ])
    
    typesList.value = t.data; 
    severitiesList.value = s.data; 
    prioritiesList.value = p.data;
    statusesList.value = st.data; 
    usersList.value = u.data; 
    tagsList.value = tg.data;

    // 2. SI ESTEM EDITANT, carreguem la informació de la incidència actual
    if (isEditing.value) {
      const { data } = await api.get(`/issues/${route.params.id}`)
      
      // Traduïm els objectes complexos a noms simples pel nostre v-model
      issue.value.subject = data.subject || ''
      issue.value.description = data.description || ''
      issue.value.status = data.status?.name || null
      issue.value.type = data.issue_type?.name || null
      issue.value.priority = data.priority?.name || null
      issue.value.severity = data.severity?.name || null
      issue.value.assignee = data.assignee?.name || null
      issue.value.due_date = data.due_date || ''
      issue.value.tags = data.tags?.map(tag => tag.name) || []
    }

  } catch (error) {
    console.error("Error carregant les dades inicials", error)
  }
})

const handleFileUpload = (e) => {
  filesToUpload.value = Array.from(e.target.files)
}

const submitIssue = async () => {
  isSubmitting.value = true
  submitErrors.value = []

  try {
    let savedIssueId = route.params.id

    if (isEditing.value) {
      // --- LÒGICA DE PATCH (EDICIÓ) ---
      // L'API YAML demana estructura niada "issue: { status_id: ... }" i espera IDs per actualitzar
      const patchPayload = {
        issue: {
          subject: issue.value.subject,
          description: issue.value.description,
          due_date: issue.value.due_date || null,
          status_id: statusesList.value.find(x => x.name === issue.value.status)?.id,
          issue_type_id: typesList.value.find(x => x.name === issue.value.type)?.id,
          priority_id: prioritiesList.value.find(x => x.name === issue.value.priority)?.id,
          severity_id: severitiesList.value.find(x => x.name === issue.value.severity)?.id,
          assignee_id: usersList.value.find(x => x.name === issue.value.assignee)?.id || null,
          tag_ids: issue.value.tags.map(tagName => tagsList.value.find(t => t.name === tagName)?.id).filter(id => id)
        }
      }
      await api.patch(`/issues/${savedIssueId}`, patchPayload)

    } else {
      // --- LÒGICA DE POST (CREACIÓ) ---
      // L'API YAML demana JSON pla amb els noms en format string
      const postPayload = {
        subject: issue.value.subject,
        description: issue.value.description,
        status: issue.value.status,
        type: issue.value.type,
        priority: issue.value.priority,
        severity: issue.value.severity,
        due_date: issue.value.due_date || undefined,
        assignee: issue.value.assignee || undefined,
        tags: issue.value.tags
      }
      const res = await api.post('/issues', postPayload)
      savedIssueId = res.data.id
    }

    // Gestionem els fitxers independentment de si estem creant o editant
    if (filesToUpload.value.length > 0) {
      for (const file of filesToUpload.value) {
        const fileData = new FormData()
        fileData.append('attachment', file)
        await api.post(`/issues/${savedIssueId}/attachments`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
    }

    // Redirigim a la vista de detall amb l'ID correcte
    router.push({ name: 'issue-detail', params: { id: savedIssueId } })
  } catch (err) {
    console.error(err)
    if (err.response && err.response.data && err.response.data.errors) {
      submitErrors.value = err.response.data.errors
    } else {
      submitErrors.value = ['Ha ocorregut un error al guardar la incidència.']
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>