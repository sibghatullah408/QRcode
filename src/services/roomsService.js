import { apiRequest } from './api.js'

export async function createRoom({ roomNo, floorNo, persons, originalRoomNo }) {
  const payload = { roomNo, floorNo, persons, originalRoomNo }
  const res = await apiRequest('/api/create_rooms', { method: 'POST', body: payload })
  return res.data
}

export async function getRooms() {
  const res = await apiRequest('/api/get_rooms', { method: 'GET' })
  return res.data
}

export async function getRoom({ id }) {
  const res = await apiRequest(`/api/get_room/${encodeURIComponent(String(id))}`, { method: 'GET' })
  return res.data
}

export async function deleteRoom({ roomNo }) {
  const res = await apiRequest('/api/create_rooms', {
    method: 'POST',
    body: { action: 'delete', roomNo },
  })
  return res.data
}
