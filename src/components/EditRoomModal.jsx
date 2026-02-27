import { useEffect, useMemo, useState } from 'react'
import './EditRoomModal.css'

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      className="trashIcon"
    >
      <path
        fill="currentColor"
        d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v10h-2V9Zm4 0h2v10h-2V9ZM7 9h2v10H7V9Z"
      />
    </svg>
  )
}

function normalizeOccupants(occupantName) {
  const name = (occupantName ?? '').trim()
  if (!name) return []
  return [{ id: crypto.randomUUID(), name, age: '', nationality: '' }]
}

function normalizePersons(persons) {
  if (!Array.isArray(persons) || persons.length === 0) return null

  const normalized = []
  for (const p of persons) {
    const name = typeof p?.name === 'string' ? p.name.trim() : ''
    const nationality = typeof p?.nationality === 'string' ? p.nationality.trim() : ''
    const age = p?.age ?? ''

    if (!name && !nationality && age === '') continue
    normalized.push({ id: crypto.randomUUID(), name, age: String(age), nationality })
  }

  return normalized.length > 0 ? normalized : null
}

export default function EditRoomModal({ open, room, isNewRoom, onClose, onSave }) {
  const initial = useMemo(() => {
    if (!room) return null
    const persons = normalizePersons(room.persons)
    return {
      roomNo: room.roomNo,
      floor: room.floor,
      occupants: persons ?? normalizeOccupants(room.occupant),
    }
  }, [room])

  const [roomNo, setRoomNo] = useState('')
  const [floor, setFloor] = useState('')
  const [occupants, setOccupants] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (isNewRoom) {
      setRoomNo('')
      setFloor('Floor 1')
      setOccupants([{ id: crypto.randomUUID(), name: '', age: '', nationality: '' }])
      setSubmitting(false)
      return
    }
    if (!initial) return
    setRoomNo(initial.roomNo)
    setFloor(initial.floor)
    setOccupants(initial.occupants)
    setSubmitting(false)
  }, [open, initial, isNewRoom])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, submitting])

  if (!open) return null

  const title = isNewRoom ? 'Add Room' : `Edit Room ${room?.roomNo ?? ''}`
  const saveLabel = submitting ? 'Saving...' : isNewRoom ? 'Add Room' : 'Save Changes'

  const addPerson = () => {
    setOccupants((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', age: '', nationality: '' },
    ])
  }

  const updatePerson = (id, patch) => {
    setOccupants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    )
  }

  const removePerson = (id) => {
    setOccupants((prev) => prev.filter((p) => p.id !== id))
  }

  const save = () => {
    if (submitting) return
    setSubmitting(true)
    onSave({
      roomNo: roomNo.trim() || (room?.roomNo ?? ''),
      floor: floor || (room?.floor ?? ''),
      occupants,
      done: () => setSubmitting(false),
    })
  }

  return (
    <div
      className="modalOverlay"
      onMouseDown={submitting ? undefined : onClose}
      role="presentation"
    >
      <div
        className="modalDialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="modalClose" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="modalBody">
          <label className="field">
            <div className="fieldLabel">Room Number</div>
            <input
              className="fieldInput"
              value={roomNo}
              disabled={submitting}
              onChange={(e) => setRoomNo(e.target.value)}
            />
          </label>

          <label className="field">
            <div className="fieldLabel">Floor</div>
            <select
              className="fieldSelect"
              value={floor}
              disabled={submitting}
              onChange={(e) => setFloor(e.target.value)}
            >
              <option value="Floor 1">Floor 1</option>
              <option value="Floor 2">Floor 2</option>
            </select>
          </label>

          <div className="occupantsHeader">
            <div className="occupantsTitle">Occupants</div>
            <button
              className="addPersonButton"
              type="button"
              onClick={addPerson}
              disabled={submitting}
            >
              Add Person
            </button>
          </div>

          {occupants.map((p, idx) => (
            <div key={p.id} className="personRow">
              <div className="personGrid">
                <label className="personField personName">
                  <div className="personLabel">Person {idx + 1} - Name</div>
                  <input
                    className="personInput"
                    value={p.name}
                    disabled={submitting}
                    onChange={(e) => updatePerson(p.id, { name: e.target.value })}
                  />
                </label>

                <label className="personField personAge">
                  <div className="personLabel">Age</div>
                  <input
                    className="personInput"
                    value={p.age}
                    inputMode="numeric"
                    disabled={submitting}
                    onChange={(e) => updatePerson(p.id, { age: e.target.value })}
                  />
                </label>

                <label className="personField personNationality">
                  <div className="personLabel">Nationality</div>
                  <input
                    className="personInput"
                    value={p.nationality}
                    disabled={submitting}
                    onChange={(e) => updatePerson(p.id, { nationality: e.target.value })}
                  />
                </label>

                <button
                  className="removeButton"
                  type="button"
                  disabled={submitting}
                  onClick={() => removePerson(p.id)}
                >
                  <TrashIcon />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="modalFooter">
          <button className="cancelButton" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="saveButton" type="button" onClick={save} disabled={submitting}>
            {saveLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
