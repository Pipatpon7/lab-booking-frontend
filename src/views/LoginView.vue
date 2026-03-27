<template>
  <div class="container">
    <div class="card">
      <h2>เข้าสู่ระบบ</h2>
      <p class="subtitle">ระบบจองห้อง Lab สำนักคอมพิวเตอร์</p>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="example@buu.ac.th" />
      </div>
      <div class="form-group">
        <label>รหัสผ่าน</label>
        <input v-model="password" type="password" placeholder="รหัสผ่าน" />
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <button @click="handleLogin" :disabled="loading">
        {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>
      <p class="link">ยังไม่มีบัญชี? <RouterLink to="/register">สมัครสมาชิก</RouterLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/rooms')
  } catch {
    error.value = 'Email หรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
}
.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
h2 { margin: 0 0 0.25rem; font-size: 1.5rem; }
.subtitle { color: #666; margin: 0 0 1.5rem; font-size: 0.9rem; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.4rem; font-size: 0.9rem; font-weight: 500; }
input {
  width: 100%; padding: 0.6rem 0.8rem;
  border: 1px solid #ddd; border-radius: 8px;
  font-size: 1rem; box-sizing: border-box;
}
input:focus { outline: none; border-color: #4f46e5; }
button {
  width: 100%; padding: 0.75rem;
  background: #4f46e5; color: white;
  border: none; border-radius: 8px;
  font-size: 1rem; cursor: pointer; margin-top: 0.5rem;
}
button:disabled { background: #a5b4fc; cursor: not-allowed; }
.error { color: #dc2626; font-size: 0.875rem; margin: 0.5rem 0; }
.link { text-align: center; margin-top: 1rem; font-size: 0.9rem; }
a { color: #4f46e5; }
</style>