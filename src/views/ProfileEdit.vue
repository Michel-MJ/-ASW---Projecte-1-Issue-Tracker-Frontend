<template>
  <div class="issue-container" style="max-width: 600px;">
    <h2 class="form-title" style="text-align: left; margin-bottom: 30px;">Editar Perfil</h2>
    
    <div v-if="loading" style="text-align: center; padding: 20px;">
      Carregant dades...
    </div>

    <div v-else-if="unauthorized" style="padding: 30px 20px; border: 1px solid #fde8e8; background: #fff5f5; border-radius: 6px; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 12px;">🚫</div>
      <p style="color: #c0392b; font-weight: 600; font-size: 1rem; margin: 0 0 8px 0;">No tens permís per editar aquest perfil.</p>
      <p style="color: #888; font-size: 0.9rem; margin: 0 0 20px 0;">Només pots editar el teu propi perfil.</p>
      <router-link to="/profile" class="btn-icon" style="text-decoration: none;">Torna al teu perfil</router-link>
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
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const saving = ref(false)
const unauthorized = ref(false)

const form = ref({
  bio: '',
  avatar_url: ''
})

const selectedFile = ref(null)
const previewUrl = ref(null)

const fetchCurrentData = async () => {
  try {
    const myId = String(localStorage.getItem('active_user_id') || '')
    const targetId = String(route.params.userId || route.params.id || myId)

    // Guard: només el propi usuari pot editar el seu perfil
    if (myId && targetId !== myId) {
      unauthorized.value = true
      loading.value = false
      return
    }

    const response = await api.get(`/users/${myId}`)
    
    form.value.bio = response.data.bio || ''
    form.value.avatar_url = response.data.avatar_url || ''
    
    loading.value = false
  } catch (error) {
    console.error("Error carregant dades per editar:", error)
    alert("No s'han pogut carregar les dades de l'usuari.")
    loading.value = false
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file) 
  }
}

const saveProfile = async () => {
  saving.value = true
  const userId = localStorage.getItem('active_user_id') || 1
  
  try {
    const formData = new FormData()
    
    formData.append('user[bio]', form.value.bio)
    
    if (selectedFile.value) {
      formData.append('user[avatar]', selectedFile.value)
    }

    await api.patch(`/users/${userId}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    })
        
    window.dispatchEvent(new Event('storage')) //Refresquem la vista
    router.push('/profile') 

  } catch (error) {
    console.error("Error guardant el perfil:", error)
    alert("Error al guardar els canvis. Revisa els paràmetres o la consola.")
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCurrentData()
})
</script>