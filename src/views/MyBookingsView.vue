<template>
  <div>
    <NavBar />
    <div class="container">
      <h2>การจองของฉัน</h2>

      <div v-if="bookings.length === 0" class="empty">ยังไม่มีการจอง</div>

      <div v-for="b in bookings" :key="b.id" class="booking-card">
        <div class="booking-top">
          <h3>{{ b.room.name }}</h3>
          <span :class="['status', b.status]">{{ statusLabel(b.status) }}</span>
        </div>
        <p>วันที่: {{ b.date }}</p>
        <p>เวลา: {{formatTime (b.startTime) }} — {{ formatTime(b.endTime) }}</p>
        <p v-if="b.note">หมายเหตุ: {{ b.note }}</p>
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
  date: string
  startTime: string
  endTime: string
  note: string
  status: string
}

const bookings = ref<Booking[]>([])

onMounted(async () => {
  const res = await api.get('/bookings/my')
  bookings.value = res.data
})

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
.container { max-width: 700px; margin: 2rem auto; padding: 0 1rem; }
h2 { margin-bottom: 1.5rem; }
.empty { color: #888; text-align: center; margin-top: 3rem; }
.booking-card {
  background: white; border-radius: 12px;
  padding: 1.25rem 1.5rem; margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.booking-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.booking-top h3 { margin: 0; }
p { margin: 0.25rem 0; color: #555; font-size: 0.9rem; }
.status { padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }
.status.pending { background: #fef9c3; color: #854d0e; }
.status.approved { background: #dcfce7; color: #166534; }
.status.rejected { background: #fee2e2; color: #991b1b; }
</style>