<template>
  <nav>
    <div class="nav-brand">Lab Booking — BUU</div>
    <div class="nav-links">
      <span class="nav-user">สวัสดี {{ authStore.fullName }}</span>

      <template v-if="!authStore.isAdmin">
      <RouterLink to="/rooms">จองห้อง</RouterLink>
      <RouterLink to="/my-bookings">การจองของฉัน</RouterLink>
      </template>

      <template v-if="authStore.isAdmin">
      <RouterLink v-if="authStore.isAdmin" to="/admin">จัดการการจอง</RouterLink>
      <RouterLink v-if="authStore.isAdmin" to="/admin/rooms">จัดการห้อง</RouterLink>
      </template>

      <button @click="handleLogout">ออกจากระบบ</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background: #4f46e5;
  color: white;
}
.nav-brand { font-weight: 600; font-size: 1.1rem; }
.nav-links { display: flex; align-items: center; gap: 1.25rem; }
.nav-user { font-size: 0.875rem; opacity: 0.85; }
a { color: white; text-decoration: none; font-size: 0.9rem; }
a:hover { opacity: 0.8; }
button {
  background: rgba(255,255,255,0.2);
  color: white; border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 6px; cursor: pointer;
  font-size: 0.875rem;
}
button:hover { background: rgba(255,255,255,0.3); }
</style>