<template>
  <div class="issue-container" style="max-width: 600px;">
    <h2 class="form-title" style="text-align: left; margin-bottom: 30px;">Editar Perfil</h2>
    
    <div v-if="loading" style="text-align: center; padding: 20px;">
      Carregant dades...
    </div>

    <form v-else @submit.prevent="saveProfile" class="form-layout" style="display: block;">
      
      <div style="margin-bottom: 25px; display: flex; align-items: center; gap: 20px;">
        <div v-if="previewUrl || form.avatar_url" class="avatar" style="width: 80px; height: 80px; font-size: 30px;">
          <img v-if="previewUrl" :src="previewUrl" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
          <img v-else-if="form.avatar_url" :src="form.avatar_url" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
        </div>
        <div v-else class="avatar" style="width: 80px; height: 80px; font-size: 30px;">
          {{ form.full_name ? form.full_name.charAt(0) : '?' }}
        </div>
        
        <div>
          <label style="display: block; font-size: 0.9rem; color: #888; margin-bottom: 8px;">Canviar Foto de Perfil</label>
          <input type="file" @change="handleFileUpload" accept="image/png, image/jpeg" />
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 0.9rem; color: #888; margin-bottom: 8px;">Nom Complet</label>
        <input type="text" v-model="form.full_name" class="input-subject" placeholder="Ex: Alex Michel Mediavilla" required />
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 0.9rem; color: #888; margin-bottom: 8px;">Biografia</label>
        <textarea v-model="form.bio" class="input-description" style="min-height: 120px;" placeholder="Escriu una breu descripció sobre tu..."></textarea>
      </div>

      <div style="display: flex; gap: 15px; margin-top: 30px;">
        <button type="submit" class="btn-submit" :disabled="saving" style="margin-top: 0; width: auto; padding: 12px 25px;">
          {{ saving ? 'Guardant...' : 'Guardar Canvis' }}
        </button>
        <router-link to="/profile" class="btn-icon" style="text-decoration: none; display: flex; align-items: center;">Cancel·lar</router-link>
      </div>
      
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api' // El tuyo

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const form = ref({
  full_name: '',
  bio: '',
  avatar_url: ''
})

// Variables para manejar la subida del archivo de imagen
const selectedFile = ref(null)
const previewUrl = ref(null)

// Función al cargar la página (Pedir datos actuales)
const fetchCurrentData = async () => {
  try {
    // Cuando el backend esté listo, descomenta esto:
    const response = await api.get('/profile')
    form.value.full_name = response.data.full_name
    form.value.bio = response.data.bio
    form.value.avatar_url = response.data.avatar_url
    
    // MOCK DATA (Simulamos los datos para no bloquearnos hoy)
    setTimeout(() => {
      form.value = {
        full_name: 'Alex Michel Mediavilla',
        bio: 'Estudiant de la FIB. Desenvolupador Full-Stack en procés.',
        avatar_url: null
      }
      loading.value = false
    }, 500) // 500ms simulando latencia de red

  } catch (error) {
    console.error("Error carregant dades:", error)
    loading.value = false
  }
}

// Función cuando el usuario selecciona una foto
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    // Creamos una URL temporal para que el usuario vea la foto antes de guardarla
    previewUrl.value = URL.createObjectURL(file) 
  }
}

// Función para enviar al backend (Guardar)
const saveProfile = async () => {
  saving.value = true
  
  try {
    // Como hay un archivo de imagen, debemos usar FormData en vez de un JSON normal
    const formData = new FormData()
    formData.append('user[full_name]', form.value.full_name)
    formData.append('user[bio]', form.value.bio)
    
    if (selectedFile.value) {
      formData.append('user[avatar]', selectedFile.value) // Así lo espera Rails ActiveStorage
    }

    // Cuando el backend esté listo, descomenta esto:
    // await api.put('/profile', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // })
    
    // SIMULACIÓN DE GUARDADO
    console.log("Enviando FormData al servidor:", form.value.full_name)
    setTimeout(() => {
      saving.value = false
      alert("Perfil actualitzat correctament!")
      router.push('/profile') // Redirigimos de vuelta al perfil
    }, 800)

  } catch (error) {
    console.error("Error guardant perfil:", error)
    alert("Hi ha hagut un error al guardar.")
    saving.value = false
  }
}

onMounted(() => {
  fetchCurrentData()
})
</script>