<template>
  <div>
    <NavBar />
    <div class="container">
      <div class="page-header">
        <h2>จัดการห้อง</h2>
        <button class="btn-add" @click="openAdd">+ เพิ่มห้องใหม่</button>
      </div>

      <!-- ตารางห้องทั้งหมด -->
      <table>
        <thead>
          <tr>
            <th>ชื่อห้อง</th>
            <th>ความจุ (คน)</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in rooms" :key="room.id">
            <td>{{ room.name }}</td>
            <td>{{ room.capacity }}</td>
            <td>
              <span :class="['badge', room.isActive ? 'active' : 'inactive']">
                {{ room.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-edit" @click="openEdit(room)">แก้ไข</button>
              <button v-if="!room.isActive" class="btn-activate" @click="handleToggleStatus(room)">
    เปิดห้อง
  </button>
              <button v-else class="btn-delete" @click="handleDelete(room.id)">ปิดห้อง</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal เพิ่ม/แก้ไขห้อง -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h3>{{ isEditing ? 'แก้ไขห้อง' : 'เพิ่มห้องใหม่' }}</h3>

          <div class="form-group">
            <label>ชื่อห้อง</label>
            <input v-model="formData.name" type="text" placeholder="เช่น Lab 101" />
          </div>
          <div class="form-group">
            <label>ความจุ (คน)</label>
            <input v-model.number="formData.capacity" type="number" min="1" placeholder="30" />
            <!--
              v-model.number แปลงค่าจาก string → number อัตโนมัติ
              เพราะ input type="number" ยังส่งค่าเป็น string ถ้าไม่ใส่ .number
            -->
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">ยกเลิก</button>
            <button class="btn-save" @click="handleSave" :disabled="loading">
              {{ loading ? 'กำลังบันทึก...' : 'บันทึก' }}
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

interface Room {
  id: number
  name: string
  capacity: number
  isActive: boolean
}

const rooms = ref<Room[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

// reactive ใช้กับ object เพราะ ref จะต้อง .value ตลอด
const formData = reactive({ name: '', capacity: 0 })

// โหลดห้องทั้งหมดรวมที่ปิดแล้วด้วย (admin ต้องเห็นทุกห้อง)
onMounted(async () => {
  await loadRooms()
})

async function loadRooms() {
    try {
  const res = await api.get('/rooms/all')
  // เรียก /rooms/all แทน /rooms เพราะ /rooms แสดงเฉพาะห้องที่ isActive = true
  rooms.value = res.data
  } catch (err) {
    console.error("ดึงข้อมูลห้องไม่สำเร็จ:", err)
    rooms.value = []
  }
}

function openAdd() {
  isEditing.value = false
  editingId.value = null
  formData.name = ''
  formData.capacity = 0
  error.value = ''
  showModal.value = true
}

function openEdit(room: Room) {
  isEditing.value = true
  editingId.value = room.id
  formData.name = room.name
  formData.capacity = room.capacity
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  // validate ก่อน save
  if (!formData.name.trim()) {
    error.value = 'กรุณากรอกชื่อห้อง'
    return
  }
  if (formData.capacity < 1) {
    error.value = 'ความจุต้องมากกว่า 0'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (isEditing.value && editingId.value) {
      // PATCH แก้ไขห้องที่มีอยู่
      await api.patch(`/rooms/${editingId.value}`, formData)
    } else {
      // POST สร้างห้องใหม่
      await api.post('/rooms', formData)
    }
    await loadRooms() // โหลดใหม่หลัง save
    closeModal()
  } catch {
    error.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('ยืนยันการปิดห้องนี้?')) return
  await api.delete(`/rooms/${id}`)
  await loadRooms()
}

async function handleToggleStatus(room: Room) {
  // ถาม confirm ก่อนทุกครั้ง โดยเปลี่ยนข้อความตามสถานะปัจจุบัน
  const action = room.isActive ? 'ปิดห้อง' : 'เปิดห้อง'
  if (!confirm(`ยืนยันการ${action} "${room.name}"?`)) return
  // ถ้ากด cancel ให้หยุดทำงานทันที

  await api.patch(`/rooms/${room.id}`, {
    isActive: !room.isActive
    // !room.isActive คือ toggle ค่า boolean
    // ถ้า isActive = true  → ส่ง false (ปิดห้อง)
    // ถ้า isActive = false → ส่ง true  (เปิดห้อง)
  })

  await loadRooms()
  // โหลดข้อมูลใหม่จาก backend หลัง toggle
  // เพื่อให้ตารางแสดงสถานะล่าสุดถูกต้อง
}
</script>

<style scoped>
.container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h2 { margin: 0; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; color: #555; border-bottom: 1px solid #eee; }
td { padding: 0.75rem 1rem; font-size: 0.9rem; border-bottom: 1px solid #f0f0f0; }
tr:last-child td { border-bottom: none; }
.badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem; }
.badge.active { background: #dcfce7; color: #166534; }
.badge.inactive { background: #fee2e2; color: #991b1b; }
.actions { display: flex; gap: 0.5rem; }
.btn-add { background: #4f46e5; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn-edit { background: #f0f4ff; color: #4f46e5; border: none; padding: 0.35rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-delete { background: #fff0f0; color: #dc2626; border: none; padding: 0.35rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-activate {
  background: #f0fdf4;   
  color: #16a34a;        
  border: none;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: white; border-radius: 12px; padding: 1.75rem; width: 100%; max-width: 420px; }
.modal h3 { margin: 0 0 1.25rem; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.35rem; font-size: 0.875rem; font-weight: 500; }
input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
input:focus { outline: none; border-color: #4f46e5; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
.btn-cancel { background: #f1f1f1; color: #444; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-save { background: #4f46e5; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-save:disabled { background: #a5b4fc; cursor: not-allowed; }
.error { color: #dc2626; font-size: 0.875rem; margin: 0.5rem 0; }
</style>