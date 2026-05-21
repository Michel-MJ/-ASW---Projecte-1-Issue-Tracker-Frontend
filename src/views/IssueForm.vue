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

          <div class="status-dropdown" style="margin-top: 15px;">
            <label class="label">Watchers (Observadors)</label>
            <select v-model="issue.watchers" multiple class="select-tags-multi">
              <option v-for="u in usersList" :key="u.id" :value="u.name">{{ u.name }}</option>
            </select>
            <small style="color: #666; font-size: 0.8rem;">Fes servir Ctrl (Windows) o Cmd (Mac) per seleccionar diversos usuaris.</small>
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
            <label class="label">Status</label>
            <select v-model="issue.status" class="select-status-main" required>
              <option :value="null">Select Status</option>
              <option v-for="s in statusesList" :key="s.id" :value="s.name">{{ s.name }}</option>
            </select>
          </div>

          <div class="status-dropdown">
            <label class="label">Assignat a</label>
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

          <div class="meta-item" style="margin-top: 20px;">
            <span class="label">Due Date (Data límit)</span>
            <input type="date" v-model="issue.due_date" class="meta-select" style="padding: 5px; width: 100%; border: 1px solid #ccc; border-radius: 4px;" />
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
  tags: [],
  watchers: [] // NOU: Array per emmagatzemar els noms dels watchers escollits
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

    if (isEditing.value) {
      const { data } = await api.get(`/issues/${route.params.id}`)
      
      issue.value.subject = data.subject || ''
      issue.value.description = data.description || ''
      issue.value.status = data.status?.name || null
      issue.value.type = data.issue_type?.name || null
      issue.value.priority = data.priority?.name || null
      issue.value.severity = data.severity?.name || null
      issue.value.assignee = data.assignee?.name || null
      issue.value.due_date = data.due_date || ''
      issue.value.tags = data.tags?.map(tag => tag.name) || []
      // NOU: Emplenem el camp amb els noms dels watchers actuals
      issue.value.watchers = data.watchers?.map(w => w.name) || []
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
          tag_ids: issue.value.tags.map(tagName => tagsList.value.find(t => t.name === tagName)?.id).filter(id => id),
          // NOU: Enviem l'array d'IDs dels usuaris seleccionats com a observadors
          watcher_ids: issue.value.watchers.map(wName => usersList.value.find(u => u.name === wName)?.id).filter(id => id)
        }
      }
      await api.patch(`/issues/${savedIssueId}`, patchPayload)

    } else {
      // --- LÒGICA DE POST (CREACIÓ) ---
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
      
      // NOU: Afegir watchers a la nova issue un per un (ja que el endpoint de crear issue no suporta llista de watchers directament)
      if (issue.value.watchers && issue.value.watchers.length > 0) {
        const watcherIds = issue.value.watchers.map(wName => usersList.value.find(u => u.name === wName)?.id).filter(id => id);
        for (const wId of watcherIds) {
          await api.post(`/issues/${savedIssueId}/watchers`, { watcher_id: wId }).catch(e => console.error("Error pujant watcher", e))
        }
      }
    }

    if (filesToUpload.value.length > 0) {
      for (const file of filesToUpload.value) {
        const fileData = new FormData()
        fileData.append('attachment', file)
        await api.post(`/issues/${savedIssueId}/attachments`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
    }

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