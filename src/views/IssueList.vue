<template>
  <div class="taiga-container">
    
    <header class="issues-header">
      <h1>Issues</h1>
      <div class="header-actions">
        <button @click="showBulkModal = true" class="btn-primary">+ ADD BULK ISSUES</button>
        <router-link to="/issues/new" class="btn-primary">+ NEW ISSUE</router-link>
      </div>
    </header>

    <div class="search-bar-wrapper">
      <form @submit.prevent="fetchIssues" class="search-form">
        <div class="search-input-container">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search issues by name or description" 
            class="search-input"
            @input="debounceSearch"
          />
          <button type="submit" class="search-submit-btn">🔍</button>
        </div>
      </form>
    </div>

    <div class="main-content-wrapper">
      
      <aside class="filters-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">FILTERS</span>
          <a href="#" @click.prevent="clearFilters(true)" class="btn-clear">Clear</a>
        </div>

        <div class="filter-group">
          <p class="filter-title">TYPE</p>
          <label v-for="t in issueTypes" :key="t.id" class="filter-label">
            <input type="checkbox" :value="t.name" v-model="activeFilters.types" @change="fetchIssues" class="filter-checkbox" />
            {{ t.name }}
          </label>
        </div>

        <div class="filter-group">
          <p class="filter-title">STATUS</p>
          <label v-for="s in statuses" :key="s.id" class="filter-label">
            <input type="checkbox" :value="s.name" v-model="activeFilters.statuses" @change="fetchIssues" class="filter-checkbox" />
            {{ s.name }}
          </label>
        </div>

        <div class="filter-group">
          <p class="filter-title">PRIORITY</p>
          <label v-for="p in priorities" :key="p.id" class="filter-label">
            <input type="checkbox" :value="p.name" v-model="activeFilters.priorities" @change="fetchIssues" class="filter-checkbox" />
            {{ p.name }}
          </label>
        </div>

        <div class="filter-group">
          <p class="filter-title">SEVERITY</p>
          <label v-for="sev in severities" :key="sev.id" class="filter-label">
            <input type="checkbox" :value="sev.name" v-model="activeFilters.severities" @change="fetchIssues" class="filter-checkbox" />
            {{ sev.name }}
          </label>
        </div>
      </aside>

      <div class="table-container">
        
        <div class="table-header">
          <div class="col-type">
            <a href="#" @click.prevent="sortBy('type')" class="sort-link">TYPE <span>{{ getSortIcon('type') }}</span></a>
          </div>        
          <div class="col-severity">
            <a href="#" @click.prevent="sortBy('severity')" class="sort-link">SEVERITY <span>{{ getSortIcon('severity') }}</span></a>
          </div>
          <div class="col-priority">
            <a href="#" @click.prevent="sortBy('priority')" class="sort-link">PRIORITY <span>{{ getSortIcon('priority') }}</span></a>
          </div>
          <div class="col-subject">
            <a href="#" @click.prevent="sortBy('subject')" class="sort-link sort-link-subject">ISSUE <span>{{ getSortIcon('subject') }}</span></a>
          </div>
          <div class="col-status">
            <a href="#" @click.prevent="sortBy('status')" class="sort-link">STATUS <span>{{ getSortIcon('status') }}</span></a>
          </div>
          <div class="col-modified">
            <a href="#" @click.prevent="sortBy('modified')" class="sort-link">MODIFIED <span>{{ getSortIcon('modified') }}</span></a>
          </div>
          <div class="col-due-date">
            <a href="#" @click.prevent="sortBy('due_date')" class="sort-link">DUE DATE <span>{{ getSortIcon('due_date') }}</span></a>
          </div>
          <div class="col-assignee">ASSIGNEE</div>
        </div>

        <div class="table-body">
          <div v-if="loading" class="state-message">Carregant...</div>
          
          <template v-else-if="issues.length > 0">
            <div v-for="issue in issues" :key="issue.id" class="issue-row">
              
              <div class="col-type">
                <span 
                  class="color-dot"
                  :style="{ backgroundColor: getRelationAttr(issue.issue_type_id, issueTypes, 'color', '#ccc') }"
                  :title="getRelationAttr(issue.issue_type_id, issueTypes, 'name', 'Unknown')"
                ></span>
              </div>

              <div class="col-severity">
                <span 
                  class="color-dot"
                  :style="{ backgroundColor: getRelationAttr(issue.severity_id, severities, 'color', '#ccc') }"
                  :title="getRelationAttr(issue.severity_id, severities, 'name', 'Unknown')"
                ></span>
              </div>

              <div class="col-priority">
                <span 
                  class="color-dot"
                  :style="{ backgroundColor: getRelationAttr(issue.priority_id, priorities, 'color', '#ccc') }"
                  :title="getRelationAttr(issue.priority_id, priorities, 'name', 'Unknown')"
                ></span>
              </div>
              
              <div class="col-subject">
                <span class="issue-id">#{{ issue.id }}</span>
                <router-link :to="`/issues/${issue.id}`" class="issue-link">
                  {{ issue.subject }}
                </router-link>
              </div>

              <div class="col-status">
                <span 
                  class="status-badge"
                  :style="{ backgroundColor: getRelationAttr(issue.status_id, statuses, 'color', '#e1f5fe') }"
                >
                  {{ getRelationAttr(issue.status_id, statuses, 'name', 'New') }}
                </span>
              </div>

              <div class="col-modified">
                {{ formatDate(issue.modified_date || issue.created_at) }}
              </div>

              <div class="col-due-date">
                {{ formatDate(issue.due_date) }}
              </div>

              <div class="col-assignee" :title="issue.assignee?.name || 'Unassigned'">
                <router-link 
                  v-if="issue.assignee?.name" 
                  :to="'/profile/' + issue.assignee.id" 
                  class="avatar-link"
                >
                  <div v-if="issue.assignee?.name" class="avatar clickable"">
                    {{ issue.assignee?.name.charAt(0).toUpperCase() }}
                  </div>
                </router-link>
                <div v-else class="avatar-empty">?</div>
              </div>

            </div>
          </template>
          
          <div v-else class="state-message">No hay resultados con los filtros aplicados o no hay credenciales válidas.</div>
        </div>
      </div>
    </div>

    <div v-if="showBulkModal" class="modal-overlay" @click.self="showBulkModal = false">
      <div class="modal-container">
        <header class="modal-header">
          <h2>Add Bulk Issues</h2>
          <button @click="showBulkModal = false" class="btn-close-modal">×</button>
        </header>
        
        <div class="modal-body">
          <p class="modal-instruction">Introduce las múltiples issues que quieras añadir.<br> Cada issue debe ir en una linia nueva.<br></p>
          <textarea 
            v-model="bulkText" 
            placeholder=""
            class="modal-textarea"
          ></textarea>
        </div>
        
        <footer class="modal-footer">
          <button @click="showBulkModal = false" class="btn-modal-cancel">Cancelar</button>
          <button @click="handleBulkSubmit" class="btn-modal-submit" :disabled="!bulkText.trim()">
            Add Bulk Issues
          </button>
        </footer>
      </div>
    </div>
  </div>
  <div v-if="showProfileModal" class="modal-overlay" @click.self="showProfileModal = false">
      <div class="profile-modal-wrapper">
        <button class="modal-close-trigger" @click="showProfileModal = false">×</button>
        
        <ProfileView :userId="selectedUserId" />
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const BASE_URL = 'https://asw-projecte-1-issue-tracker-1278.onrender.com/api'; 

// --- Estados Reactivos ---
const issues = ref([]);
const issueTypes = ref([]);
const statuses = ref([]);
const priorities = ref([]);
const severities = ref([]);
const loading = ref(false);
const searchQuery = ref('');
let searchTimeout = null;

// --- Estados para el Modal ---
const showBulkModal = ref(false);
const bulkText = ref('');

const activeFilters = reactive({
  types: [],
  statuses: [],
  priorities: [],
  severities: []
});

const sortConfig = reactive({
  field: 'modified',
  direction: 'desc'
});

// --- Cliente Axios Dinámico ---
const getApiClient = () => {
  const token = localStorage.getItem('active_api_key') || '';
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-Api-Key': token
    }
  });
};

// --- Consultas API ---
const fetchFiltersData = async () => {
  const client = getApiClient();
  try {
    const [resTypes, resStatuses, resPriorities, resSeverities] = await Promise.all([
      client.get('/issue_types'),
      client.get('/statuses'),
      client.get('/priorities'),
      client.get('/severities')
    ]);
    issueTypes.value = resTypes.data;
    statuses.value = resStatuses.data;
    priorities.value = resPriorities.data;
    severities.value = resSeverities.data;
  } catch (error) {
    console.error("Error al cargar los catálogos:", error);
  }
};

const fetchIssues = async () => {
  loading.value = true;
  const client = getApiClient();
  
  const params = {};
  if (activeFilters.types.length) params.type = activeFilters.types.join(',');
  if (activeFilters.statuses.length) params.status = activeFilters.statuses.join(',');
  if (activeFilters.priorities.length) params.priority = activeFilters.priorities.join(',');
  if (activeFilters.severities.length) params.severity = activeFilters.severities.join(',');
  
  if (searchQuery.value) params.q = searchQuery.value;
  if (sortConfig.field) params.sort = sortConfig.field;
  if (sortConfig.direction) params.direction = sortConfig.direction;

  try {
    const response = await client.get('/issues', { params });
    issues.value = response.data;
  } catch (error) {
    console.error("Error al obtener las issues:", error);
    if (error.response?.status === 401) {
      issues.value = [];
    }
  } finally {
    loading.value = false;
  }
};

// --- Función para procesar Bulk Issues ---
const handleBulkSubmit = async () => {
  if (!bulkText.value.trim()) return;
  
  const client = getApiClient();
  try {
    await client.post('/issues/bulk', { bulk_data: bulkText.value });
    
    bulkText.value = ''; 
    showBulkModal.value = false; 
    await fetchIssues(); 
  } catch (error) {
    console.error("Error al procesar el bulk de issues:", error);
    alert("Hubo un error al procesar las issues.");
  }
};

// --- Sincronización con Navbar ---
const handleUserChangeFromNavbar = async () => {
  clearFilters(false);
  await fetchFiltersData();
  await fetchIssues();
};

onMounted(() => {
  window.addEventListener('storage', handleUserChangeFromNavbar);
  fetchFiltersData();
  fetchIssues();
});

onUnmounted(() => {
  window.removeEventListener('storage', handleUserChangeFromNavbar);
});

const clearFilters = (shouldFetch = true) => {
  activeFilters.types = [];
  activeFilters.statuses = [];
  activeFilters.priorities = [];
  activeFilters.severities = [];
  searchQuery.value = '';
  if (shouldFetch) fetchIssues();
};

const sortBy = (columnField) => {
  if (sortConfig.field === columnField) {
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.field = columnField;
    sortConfig.direction = 'asc';
  }
  fetchIssues();
};

const getSortIcon = (columnField) => {
  if (sortConfig.field !== columnField) return '↕';
  return sortConfig.direction === 'asc' ? '▲' : '▼';
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { fetchIssues(); }, 400);
};

const getRelationAttr = (id, catalog, attribute, fallback) => {
  if (!id) return fallback;
  const item = catalog.find(c => c.id === id);
  return item && item[attribute] ? item[attribute] : fallback;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

/* Contenedores Principales */
.taiga-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: sans-serif;
  background-color: #f6f8f9;
}

.main-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 20px 30px;
  gap: 20px;
}

/* Header de la Página */
.issues-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: #fff;
  border-bottom: 1px solid #e0e6ed;
  flex-shrink: 0;
}

.issues-header h1 {
  color: #008aa8;
  font-size: 24px;
  font-weight: 300;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background: #5adad1;
  color: #fff;
  padding: 8px 18px;
  border-radius: 3px;
  text-decoration: none;
  font-weight: bold;
  font-size: 13px;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

/* Barra de Búsqueda */
.search-bar-wrapper {
  padding: 10px 30px;
  background: #fff;
  border-bottom: 1px solid #e0e6ed;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.search-form {
  display: flex;
  width: 100%;
  margin: 0;
  padding: 0;
}

.search-input-container {
  display: flex;
  width: 100%;
  border: 1px solid #c2cfd6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.search-input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}

.search-submit-btn {
  background: #f8f9fa;
  border: none;
  border-left: 1px solid #c2cfd6;
  padding: 0 20px;
  cursor: pointer;
  color: #73818f;
}

/* Sidebar de Filtros */
.filters-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e0e6ed;
  padding: 20px;
  border-radius: 4px;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.sidebar-title {
  font-weight: bold;
  font-size: 12px;
  color: #3c4b5f;
}

.btn-clear {
  font-size: 11px;
  color: #e74c3c;
  text-decoration: none;
  font-weight: bold;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-title {
  font-size: 11px;
  font-weight: bold;
  color: #8a9ab0;
  text-transform: uppercase;
  margin-bottom: 10px;
  margin-top: 0;
}

.filter-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  margin-bottom: 8px;
  cursor: pointer;
  color: #3c4b5f;
}

.filter-checkbox {
  margin-right: 10px;
}

/* Tabla Estructura */
.table-container {
  flex: 1;
  background: #fff;
  border: 1px solid #e0e6ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #fdfdfd;
  border-bottom: 1px solid #e0e6ed;
  padding: 15px 0;
  font-size: 11px;
  font-weight: bold;
  color: #8a9ab0;
  flex-shrink: 0;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.issue-row {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f3f5;
  font-size: 14px;
}

/* Celdas y Dimensiones de Columnas */
.col-type { width: 60px; display: flex; justify-content: center; }
.col-severity { width: 100px; display: flex; justify-content: center; }
.col-priority { width: 100px; display: flex; justify-content: center; }
.col-subject { flex: 1; padding-left: 20px; text-align: left; overflow: hidden; }
.col-status { width: 120px; display: flex; justify-content: center; }
.col-modified { width: 120px; text-align: center; color: #73818f; font-size: 13px; }
.col-due-date { width: 100px; text-align: center; font-size: 13px; color: #73818f; }
.col-assignee { width: 80px; display: flex; justify-content: center; }

/* Enlaces de ordenación (Sort) */
.sort-link {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 5px;
}

.sort-link:hover { 
  color: #008aa8; 
}

.sort-link-subject {
  justify-content: flex-start;
  padding-left: 20px;
}

/* Detalles del Contenido de las Filas */
.color-dot {
  height: 10px;
  width: 10px;
  border-radius: 50%;
}

.issue-id {
  color: #008aa8;
  font-weight: bold;
  margin-right: 8px;
}

.issue-link {
  text-decoration: none;
  color: #20242a;
  font-weight: 500;
}

.status-badge {
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}

/* Avatares */

.avatar-empty {
  width: 30px;
  height: 30px;
  background: #eee;
  color: #999;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.state-message {
  padding: 100px;
  text-align: center;
  color: #8a9ab0;
}

/* Estilos para el Diálogo / Modal */
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
  width: 500px;
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
  gap: 10px;
}

.modal-instruction {
  margin: 0;
  font-size: 13px;
  color: #3c4b5f;
}

.modal-textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 1px solid #c2cfd6;
  border-radius: 4px;
  font-family: sans-serif;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
}

.modal-textarea:focus {
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