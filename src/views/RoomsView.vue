<template>
  <div>
    <NavBar />
    <div class="container">
      <h2>ห้องทั้งหมด</h2>

      <div class="rooms-grid">
        <div v-for="room in rooms" :key="room.id" class="room-card">
          <div class="room-header">
            <h3>{{ room.name }}</h3>
            <span class="badge">{{ room.capacity }} คน</span>
          </div>
          

          <div v-if="form[room.id]" class="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label>วันที่</label>
                <input v-model="form[room.id]!.date" type="date" :min="today" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>เวลาเริ่ม</label>
                <select v-model="form[room.id]!.startTime">
                   <option v-for="t in timeSlots" :key="t" :value="t">{{ t }} น.</option>
                   </select>
              </div>
              <div class="form-group">
                <label>เวลาสิ้นสุด</label>
                <select v-model="form[room.id]!.endTime" type="time"step="60" lang="th">
                  <option v-for="t in timeSlots" :key="t" :value="t">{{ t }} น.</option>
</select>
              </div>
            </div>
            <div class="form-group">
              <label>หมายเหตุ</label>
              <input v-model="form[room.id]!.note" type="text" placeholder="ระบุวัตถุประสงค์" />
            </div>

            <p v-if="messages[room.id]" :class="messages[room.id]!.type">
              {{ messages[room.id]!.text }}
            </p>

            <button @click="handleBook(room.id)" :disabled="loading[room.id]">
              {{ loading[room.id] ? 'กำลังจอง...' : 'จองห้องนี้' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import api from '../api/axios'
import NavBar from '../components/NavBar.vue'

interface Room { id: number; name: string; capacity: number }
interface FormData { date: string; startTime: string; endTime: string; note: string }
interface Message { text: string; type: 'error' | 'success' }

const rooms = ref<Room[]>([])
const today = new Date().toISOString().split('T')[0]
const form = reactive<Record<number, FormData>>({})
const loading = reactive<Record<number, boolean>>({})
const messages = reactive<Record<number, Message>>({})

const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8
    return `${String(hour).padStart(2, '0')}:00`
})

onMounted(async () => {
  const res = await api.get('/rooms')
  rooms.value = res.data
  rooms.value.forEach((room) => {
    form[room.id] = { date: '', startTime: '', endTime: '', note: '' }
    loading[room.id] = false
  })
})

async function handleBook(roomId: number) {
  const f = form[roomId]

  if(!f) return

  if (!f.date || !f.startTime || !f.endTime) {
    messages[roomId] = { text: 'กรุณากรอกข้อมูลให้ครบ', type: 'error' }
    return
  }
  loading[roomId] = true
  messages[roomId] = { text: '', type: 'success' }
  try {
    await api.post('/bookings', { roomId, ...f })
    messages[roomId] = { text: 'จองสำเร็จ รอการอนุมัติ', type: 'success' }
    form[roomId] = { date: '', startTime: '', endTime: '', note: '' }
  } catch {
    messages[roomId] = { text: 'ช่วงเวลานี้ถูกจองแล้ว', type: 'error' }
  } finally {
    loading[roomId] = false
  }
}
</script>

<style scoped>
.container { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
h2 { margin-bottom: 1.5rem; }
.rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.25rem; }
.room-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.room-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.room-header h3 { margin: 0; font-size: 1.1rem; }
.badge { background: #e0e7ff; color: #4f46e5; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.8rem; }
.form-row { display: flex; gap: 0.75rem; }
.form-group { flex: 1; margin-bottom: 0.75rem; }
label { display: block; margin-bottom: 0.3rem; font-size: 0.85rem; font-weight: 500; color: #444; }
input {
  width: 100%; padding: 0.5rem 0.7rem;
  border: 1px solid #ddd; border-radius: 8px;
  font-size: 0.9rem; box-sizing: border-box;
}
input:focus { outline: none; border-color: #4f46e5; }
button {
  width: 100%; padding: 0.65rem;
  background: #4f46e5; color: white;
  border: none; border-radius: 8px;
  font-size: 0.95rem; cursor: pointer;
}
button:disabled { background: #a5b4fc; }
.error { color: #dc2626; font-size: 0.85rem; margin: 0.4rem 0; }
.success { color: #16a34a; font-size: 0.85rem; margin: 0.4rem 0; }
</style>