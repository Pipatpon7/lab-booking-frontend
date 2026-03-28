<template>
  <div>
    <NavBar />
    <div class="container">
      <h2>จัดการการจองทั้งหมด</h2>

      <div v-if="bookings.length === 0" class="empty">ไม่มีการจองในระบบ</div>

      <div v-for="b in bookings" :key="b.id" class="booking-card">
        <div class="booking-top">
          <div>
            <h3>{{ b.room.name }}</h3>
            <p class="user">{{ b.user.fullName }} ({{ b.user.email }})</p>
          </div>
          <span :class="['status', b.status]">{{ statusLabel(b.status) }}</span>
        </div>
        <p>วันที่: {{ b.date }} | เวลา: {{ formatTime(b.startTime) }} — {{ formatTime (b.endTime) }}</p>
        <p v-if="b.note">หมายเหตุ: {{ b.note }}</p>

        <div v-if="b.status === 'pending'" class="actions">
          <button class="approve" @click="updateStatus(b.id, 'approved')">อนุมัติ</button>
          <button class="reject" @click="updateStatus(b.id, 'rejected')">ปฏิเสธ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api/axios'
import NavBar from '../components/NavBar.vue'

interface Booking {
  id: number
  room: { name: string }
  user: { fullName: string; email: string }
  date: string
  startTime: string
  endTime: string
  note: string
  status: string
}

const bookings = ref<Booking[]>([])

onMounted(async () => {
  const res = await api.get('/bookings')
  bookings.value = res.data
})

async function updateStatus(id: number, status: string) {
  await api.patch(`/bookings/${id}/status`, { status })
  const b = bookings.value.find((x) => x.id === id)
  if (b) b.status = status
}

function statusLabel(status: string) {
  if (status === 'pending') return 'รอการอนุมัติ'
  if (status === 'approved') return 'อนุมัติแล้ว'
  return 'ปฏิเสธ'
}

function formatTime(time: string) {
  const [hourStr, minute] = time.split(':')
  const hour = parseInt(hourStr!, 10)
  return `${hour}.${minute} น.`
}
</script>

<style scoped>
.container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
h2 { margin-bottom: 1.5rem; }
.empty { color: #888; text-align: center; margin-top: 3rem; }
.booking-card {
  background: white; border-radius: 12px;
  padding: 1.25rem 1.5rem; margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.booking-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.booking-top h3 { margin: 0 0 0.2rem; }
.user { margin: 0; font-size: 0.85rem; color: #666; }
p { margin: 0.25rem 0; color: #555; font-size: 0.9rem; }
.status { padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }
.status.pending { background: #fef9c3; color: #854d0e; }
.status.approved { background: #dcfce7; color: #166534; }
.status.rejected { background: #fee2e2; color: #991b1b; }
.actions { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
.approve {
  padding: 0.4rem 1rem; background: #16a34a;
  color: white; border: none; border-radius: 8px; cursor: pointer;
}
.reject {
  padding: 0.4rem 1rem; background: #dc2626;
  color: white; border: none; border-radius: 8px; cursor: pointer;
}
</style>