<template>
  <div class="settings-container">
    <!-- Menú Lateral -->
    <aside class="settings-sidebar">
      <h3>Attributes</h3>
      <a href="#" @click.prevent="activeTab = 'statuses'" :class="['sidebar-link', { active: activeTab === 'statuses' }]">Statuses</a>
      <a href="#" @click.prevent="activeTab = 'priorities'" :class="['sidebar-link', { active: activeTab === 'priorities' }]">Priorities</a>
      <a href="#" @click.prevent="activeTab = 'issue_types'" :class="['sidebar-link', { active: activeTab === 'issue_types' }]">Types</a>
      <a href="#" @click.prevent="activeTab = 'severities'" :class="['sidebar-link', { active: activeTab === 'severities' }]">Severities</a>
      
      <h3 style="margin-top: 20px;">Project</h3>
      <a href="#" @click.prevent="activeTab = 'tags'" :class="['sidebar-link', { active: activeTab === 'tags' }]">Tags</a>
    </aside>

    <!-- Contingut Principal -->
    <main class="settings-content">
      <div class="settings-header">
        <h1>{{ currentTabConfig.label }}</h1>
        <button @click="openModal()" class="btn-new">+ ADD NEW {{ currentTabConfig.singularLabel.toUpperCase() }}</button>
      </div>

      <div v-if="loading" style="padding: 40px; text-align: center; color: #8a9ab0;">
        Carregant dades...
      </div>

      <table v-else class="config-table">
        <thead>
          <tr>
            <th style="width: 60px;">Color</th>
            <th>Name</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>
              <span class="color-dot" :style="{ backgroundColor: item.color || '#ccc' }"></span>
            </td>
            <td style="font-weight: 500;">{{ item.name }}</td>
            <td style="text-align: right;" class="action-links">
              <a href="#" @click.prevent="openModal(item)">Edit</a>
              <a href="#" @click.prevent="deleteItem(item.id)" class="delete">Delete</a>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="3" style="text-align: center; color: #8a9ab0; padding: 30px;">
              No hi ha cap element creat encara.
            </td>
          </tr>
        </tbody>
      </table>
    </main>

    <!-- Modal de Creació / Edició -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <header class="modal-header">
          <h2>{{ isEditing ? 'Edit' : 'New' }} {{ currentTabConfig.singularLabel }}</h2>
          <button @click="closeModal" class="btn-close-modal">×</button>
        </header>
        
        <form @submit.prevent="submitItem">
          <div class="modal-body">
            <div v-if="errorMsg" style="background: #fee; color: #e74c3c; padding: 10px; border-radius: 4px; font-size: 13px; margin-bottom: 10px;">
              {{ errorMsg }}
            </div>

            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" v-model="formItem.name" class="form-control" placeholder="Ex: Urgent, Bug, Frontend..." required />
            </div>

            <div class="form-group">
              <label class="form-label">Color</label>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" v-model="formItem.color" style="width: 50px; height: 40px; padding: 0; border: 1px solid #e0e6ed; border-radius: 4px; cursor: pointer;" />
                <span style="font-family: monospace; color: #8a9ab0;">{{ formItem.color }}</span>
              </div>
            </div>
          </div>
          
          <footer class="modal-footer">
            <button type="button" @click="closeModal" class="btn-modal-cancel">Cancel</button>
            <button type="submit" class="btn-modal-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save' }}
            </button>
          </footer>
        </form>
      </div>
    </div>

    <!-- NOU: Modal de Substitució (Replacement) -->
    <div v-if="showReplaceModal" class="modal-overlay" @click.self="closeReplaceModal">
      <div class="modal-container">
        <header class="modal-header">
          <h2>Reassignar Issues</h2>
          <button @click="closeReplaceModal" class="btn-close-modal">×</button>
        </header>
        
        <form @submit.prevent="confirmDeleteWithReplacement">
          <div class="modal-body">
            <p style="font-size: 14px; color: #3c4b5f; margin-top: 0; line-height: 1.5;">
              Aquest <strong>{{ currentTabConfig.singularLabel }}</strong> s'està utilitzant en algunes issues. 
              Si us plau, selecciona un element de substitució perquè les issues no es quedin òrfenes.
            </p>

            <div class="form-group">
              <label class="form-label">Substituir per:</label>
              <select v-model="replacementId" class="form-control" required>
                <option :value="null" disabled>Selecciona una opció...</option>
                <option v-for="opt in availableReplacements" :key="opt.id" :value="opt.id">
                  {{ opt.name }}
                </option>
              </select>
            </div>
          </div>
          
          <footer class="modal-footer">
            <button type="button" @click="closeReplaceModal" class="btn-modal-cancel">Cancel·lar</button>
            <button type="submit" class="btn-modal-submit" style="background: #e74c3c;" :disabled="!replacementId">
              Reassignar i Esborrar
            </button>
          </footer>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../services/api'

const tabsConfig = [
  { id: 'statuses', label: 'Statuses', singularLabel: 'Status', endpoint: '/statuses', payloadKey: 'status' },
  { id: 'priorities', label: 'Priorities', singularLabel: 'Priority', endpoint: '/priorities', payloadKey: 'priority' },
  { id: 'issue_types', label: 'Types', singularLabel: 'Type', endpoint: '/issue_types', payloadKey: 'issue_type' },
  { id: 'severities', label: 'Severities', singularLabel: 'Severity', endpoint: '/severities', payloadKey: 'severity' },
  { id: 'tags', label: 'Tags', singularLabel: 'Tag', endpoint: '/tags', payloadKey: 'tag' }
]

const activeTab = ref('statuses')
const items = ref([])
const loading = ref(false)

const showModal = ref(false)
const isSubmitting = ref(false)
const errorMsg = ref('')
const formItem = ref({ name: '', color: '#5adad1' })
const isEditing = ref(false)
const editingId = ref(null)

// Estats Substitució
const showReplaceModal = ref(false)
const itemToDelete = ref(null)
const replacementId = ref(null)

const currentTabConfig = computed(() => tabsConfig.find(t => t.id === activeTab.value))

// Llista d'elements per substituir
const availableReplacements = computed(() => {
  return items.value.filter(item => item.id !== itemToDelete.value)
})

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await api.get(currentTabConfig.value.endpoint)
    items.value = response.data
  } catch (error) {
    console.error("Error carregant els atributs:", error)
  } finally {
    loading.value = false
  }
}

const openModal = (item = null) => {
  errorMsg.value = ''
  if (item) {
    isEditing.value = true
    editingId.value = item.id
    formItem.value = { name: item.name, color: item.color || '#000000' }
  } else {
    isEditing.value = false
    editingId.value = null
    formItem.value = { name: '', color: '#5adad1' }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const closeReplaceModal = () => {
  showReplaceModal.value = false
  itemToDelete.value = null
  replacementId.value = null
}

const submitItem = async () => {
  isSubmitting.value = true
  errorMsg.value = ''

  try {
    const payload = {}
    payload[currentTabConfig.value.payloadKey] = {
      name: formItem.value.name,
      color: formItem.value.color
    }

    if (isEditing.value) {
      await api.patch(`${currentTabConfig.value.endpoint}/${editingId.value}`, payload)
    } else {
      await api.post(currentTabConfig.value.endpoint, payload)
    }
    
    closeModal()
    fetchItems()
  } catch (error) {
    if (error.response?.data?.errors) {
      errorMsg.value = error.response.data.errors.join(', ')
    } else {
      errorMsg.value = "Ha ocorregut un error al guardar l'atribut."
    }
  } finally {
    isSubmitting.value = false
  }
}

// Intentar eliminar l'element
const deleteItem = async (id) => {
  if (!confirm(`Estàs segur que vols esborrar aquest ${currentTabConfig.value.singularLabel}?`)) return

  try {
    await api.delete(`${currentTabConfig.value.endpoint}/${id}`)
    fetchItems()
  } catch (error) {
    // Si API demana replacement_id -- > modal de substitució
    if (error.response?.status === 422 && error.response?.data?.error?.includes('replacement_id')) {
      itemToDelete.value = id
      replacementId.value = null
      showReplaceModal.value = true
    } else {
      alert(`No s'ha pogut esborrar: ${error.response?.data?.error || 'Error desconegut'}`)
    }
  }
}

// Confirmar eliminació enviant replacement_id
const confirmDeleteWithReplacement = async () => {
  if (!replacementId.value) return

  try {
    await api.delete(`${currentTabConfig.value.endpoint}/${itemToDelete.value}?replacement_id=${replacementId.value}`)
    closeReplaceModal()
    fetchItems()
  } catch (error) {
    alert(`Error: ${error.response?.data?.error || 'No s\'ha pogut esborrar'}`)
  }
}

onMounted(() => {
  fetchItems()
})

watch(activeTab, () => {
  fetchItems()
})
</script>

<style scoped>
.settings-container { 
  display: flex; 
  min-height: calc(100vh - 100px); 
  background: #f6f8f9; 
  font-family: sans-serif; 
  border: 1px solid #e0e6ed;
  border-radius: 6px;
  overflow: hidden;
}

.settings-sidebar { 
  width: 250px; 
  background: #fff; 
  border-right: 1px solid #e0e6ed; 
  padding: 20px 0; 
  display: flex; 
  flex-direction: column; 
}

.settings-sidebar h3 { 
  font-size: 11px; 
  font-weight: bold; 
  color: #8a9ab0; 
  text-transform: uppercase; 
  margin: 0 20px 10px; 
  letter-spacing: 0.5px; 
}

.sidebar-link { 
  display: block; 
  padding: 10px 20px; 
  color: #3c4b5f; 
  text-decoration: none; 
  font-size: 14px; 
  font-weight: 500; 
  transition: background 0.2s; 
}

.sidebar-link:hover { 
  background: #f0f3f5; 
  color: #008aa8; 
}

.sidebar-link.active { 
  background: #e1f5fe; 
  color: #0277bd; 
  font-weight: bold; 
  border-left: 3px solid #0277bd; 
}

.settings-content { 
  flex: 1; 
  padding: 30px; 
  background: #fff;
}

.settings-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px; 
}

.settings-header h1 { 
  margin: 0; 
  font-size: 24px; 
  font-weight: 300; 
  color: #3c4b5f; 
}

.btn-new { 
  background: #5adad1; 
  color: #fff; 
  padding: 8px 18px; 
  border-radius: 3px; 
  text-decoration: none; 
  font-weight: bold; 
  font-size: 13px; 
  border: none; 
  cursor: pointer; 
  transition: background 0.2s;
}

.btn-new:hover {
  background: #4bc0b7;
}

.config-table { 
  width: 100%; 
  background: #fff; 
  border-radius: 4px; 
  border: 1px solid #e0e6ed; 
  border-collapse: collapse; 
}

.config-table th { 
  background: #fdfdfd; 
  padding: 12px 20px; 
  text-align: left; 
  font-size: 11px; 
  font-weight: bold; 
  color: #8a9ab0; 
  border-bottom: 1px solid #e0e6ed; 
  text-transform: uppercase; 
}

.config-table td { 
  padding: 15px 20px; 
  border-bottom: 1px solid #f0f3f5; 
  font-size: 14px; 
  color: #3c4b5f; 
  vertical-align: middle; 
}

.config-table tr:last-child td { 
  border-bottom: none; 
}

.color-dot { 
  display: inline-block; 
  width: 12px; 
  height: 12px; 
  border-radius: 50%; 
  margin-right: 10px; 
  vertical-align: middle; 
}

.action-links a { 
  color: #8a9ab0; 
  text-decoration: none; 
  font-size: 12px; 
  margin-left: 15px; 
  font-weight: 600;
}

.action-links a:hover { 
  color: #008aa8; 
}

.action-links a.delete:hover { 
  color: #e74c3c; 
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  background: #fff;
  width: 400px;
  max-width: 90%;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e6ed;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #008aa8;
  font-weight: 400;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 24px;
  color: #8a9ab0;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-size: 12px;
  font-weight: bold;
  color: #3c4b5f;
}

.form-control {
  padding: 10px;
  border: 1px solid #c2cfd6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.form-control:focus {
  border-color: #008aa8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e6ed;
}

.btn-modal-cancel {
  background: #fff;
  border: 1px solid #c2cfd6;
  padding: 8px 16px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  color: #3c4b5f;
}

.btn-modal-submit {
  background: #5adad1;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  font-size: 13px;
}

.btn-modal-submit:disabled {
  background: #aedcd8;
  cursor: not-allowed;
}
</style>