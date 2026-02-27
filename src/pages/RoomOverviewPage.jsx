import './RoomOverviewPage.css'
import { useEffect, useRef, useState } from 'react'
import EditRoomModal from '../components/EditRoomModal.jsx'
import Toast from '../components/Toast.jsx'
import { createRoom, deleteRoom, getRooms } from '../services/roomsService.js'

const initialRooms = [
  { roomNo: '101', floor: 'Floor 1', occupant: 'John Doe' },
  { roomNo: '102', floor: 'Floor 1', occupant: 'Hover Dad' },
  { roomNo: '103', floor: 'Floor 1', occupant: 'Jam Willis' },
  { roomNo: '104', floor: 'Floor 2', occupant: 'Savn Smith' },
  { roomNo: '105', floor: 'Floor 2', occupant: 'Mart Learison' },
  { roomNo: '106', floor: 'Floor 2', occupant: 'Welt College' },
]

export default function RoomOverviewPage() {
  const [rooms, setRooms] = useState([])
  const [editingRoomNo, setEditingRoomNo] = useState(null)
  const [isAddingRoom, setIsAddingRoom] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimeoutIdRef = useRef(null)

  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const editingRoom = editingRoomNo
    ? rooms.find((r) => r.roomNo === editingRoomNo) ?? null
    : null

  const showToast = (message) => {
    setToastMessage(message)
    if (toastTimeoutIdRef.current) window.clearTimeout(toastTimeoutIdRef.current)
    toastTimeoutIdRef.current = window.setTimeout(() => setToastMessage(''), 2200)
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getRooms()
        if (cancelled) return
        setRooms(
          data.map((r) => ({
            id: r.id,
            roomNo: String(r.roomNo),
            floor: `Floor ${r.floorNo}`,
            occupant: r.persons?.[0]?.name ?? '',
            persons: Array.isArray(r.persons) ? r.persons : [],
          })),
        )
      } catch (e) {
        if (cancelled) return
        setRooms(initialRooms)
        const message = e instanceof Error ? e.message : 'Failed to load rooms'
        showToast(message)
      } finally {
        if (!cancelled) setInitialLoadDone(true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="roomPage">
      <div className="roomCard">
        <header className="roomCardHeader">
          <div className="roomCardHeaderTitle">Room Overview</div>
          <button
            className="primaryButton"
            type="button"
            onClick={() => setIsAddingRoom(true)}
          >
            Add New Room
          </button>
        </header>

        <div className="roomTableWrap">
          {!initialLoadDone ? <div className="roomLoading">Loading...</div> : null}
          <table className="roomTable">
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Floor</th>
                <th>Current Occupant</th>
                <th className="roomTableActionHeader">Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.roomNo}>
                  <td>{room.roomNo}</td>
                  <td>{room.floor}</td>
                  <td>{room.occupant}</td>
                  <td className="roomTableActionCell">
                    <button
                      className="deleteButton"
                      type="button"
                      onClick={async () => {
                        const ok = window.confirm(
                          `Are you sure you want to delete room ${room.roomNo}?`,
                        )
                        if (!ok) return

                        try {
                          await deleteRoom({ roomNo: room.roomNo })
                          setRooms((prev) => prev.filter((r) => r.roomNo !== room.roomNo))
                          showToast('Room deleted')
                        } catch (e) {
                          const message = e instanceof Error ? e.message : 'Failed to delete room'
                          showToast(message)
                        }
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="editButton"
                      type="button"
                      onClick={() => setEditingRoomNo(room.roomNo)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditRoomModal
        open={editingRoomNo !== null || isAddingRoom}
        room={editingRoom}
        isNewRoom={isAddingRoom}
        onClose={() => {
          setEditingRoomNo(null)
          setIsAddingRoom(false)
        }}
        onSave={async (updated) => {
          try {
            if (isAddingRoom) {
              const roomNo = String(updated.roomNo ?? '').trim()
              if (!roomNo) throw new Error('Room number is required')

              const persons = updated.occupants
                .map((p) => {
                  const name = String(p.name ?? '').trim()
                  const nationality = String(p.nationality ?? '').trim()
                  const age = Number(String(p.age ?? '').trim())
                  if (!name || !nationality || !Number.isFinite(age)) return null
                  return { name, age, nationality }
                })
                .filter(Boolean)

              if (persons.length === 0) throw new Error('Add at least one occupant')

              const created = await createRoom({
                roomNo,
                floorNo: updated.floor.replace(/\D+/g, ''),
                persons,
              })

              const occupant = created.persons[0]?.name ?? ''
              setRooms((prev) => [
                ...prev,
                {
                  id: created.id,
                  roomNo: created.roomNo,
                  floor: `Floor ${created.floorNo}`,
                  occupant,
                  persons: created.persons,
                },
              ])
              showToast('Room created')
            } else {
              const roomNo = String(updated.roomNo ?? '').trim()
              if (!roomNo) throw new Error('Room number is required')

              const persons = updated.occupants
                .map((p) => {
                  const name = String(p.name ?? '').trim()
                  const nationality = String(p.nationality ?? '').trim()
                  const age = Number(String(p.age ?? '').trim())
                  if (!name || !nationality || !Number.isFinite(age)) return null
                  return { name, age, nationality }
                })
                .filter(Boolean)

              if (persons.length === 0) throw new Error('Add at least one occupant')

              const saved = await createRoom({
                roomNo,
                floorNo: String(updated.floor ?? '').replace(/\D+/g, ''),
                persons,
                originalRoomNo: editingRoomNo,
              })

              const occupant = saved.persons[0]?.name ?? ''
              setRooms((prev) =>
                prev.map((r) => {
                  if (r.roomNo !== editingRoomNo) return r
                  return {
                    ...r,
                    id: saved.id ?? r.id,
                    roomNo: saved.roomNo,
                    floor: `Floor ${saved.floorNo}`,
                    occupant,
                    persons: saved.persons,
                  }
                }),
              )
              showToast('Room updated')
            }

            setEditingRoomNo(null)
            setIsAddingRoom(false)
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Request failed'
            showToast(message)
          } finally {
            updated.done?.()
          }
        }}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </section>
  )
}
