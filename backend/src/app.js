import cors from 'cors'
import express from 'express'

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function toOptionalInt(value) {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isFinite(n) ? Math.trunc(n) : null
}

export default function createApp({ db }) {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.get('/health', (req, res) => {
    res.status(200).json({ ok: true })
  })

  app.get('/api/get_rooms', (req, res) => {
    try {
      const rooms = db
        .prepare('SELECT id, room_no, floor_no, created_at FROM rooms ORDER BY id DESC')
        .all()

      const persons = db
        .prepare('SELECT id, room_id, name, age, nationality FROM persons ORDER BY id ASC')
        .all()

      const roomIdToPersons = new Map()

      for (const p of persons) {
        const list = roomIdToPersons.get(p.room_id)
        if (list) {
          list.push({ name: p.name, age: p.age, nationality: p.nationality })
        } else {
          roomIdToPersons.set(p.room_id, [{ name: p.name, age: p.age, nationality: p.nationality }])
        }
      }

      return res.status(200).json({
        ok: true,
        data: rooms.map((r) => ({
          id: r.id,
          roomNo: r.room_no,
          floorNo: r.floor_no,
          createdAt: r.created_at,
          persons: roomIdToPersons.get(r.id) ?? [],
        })),
      })
    } catch {
      return res.status(500).json({ ok: false, error: 'failed to fetch rooms' })
    }
  })

  app.get('/api/get_room/:id', (req, res) => {
    const id = toOptionalInt(req.params?.id)

    if (id === null) {
      return res.status(400).json({ ok: false, error: 'id is required' })
    }

    try {
      const room = db
        .prepare('SELECT id, room_no, floor_no, created_at FROM rooms WHERE id = ?')
        .get(id)

      if (!room) {
        return res.status(404).json({ ok: false, error: 'room not found' })
      }

      const persons = db
        .prepare('SELECT name, age, nationality FROM persons WHERE room_id = ? ORDER BY id ASC')
        .all(id)

      return res.status(200).json({
        ok: true,
        data: {
          id: room.id,
          roomNo: room.room_no,
          floorNo: room.floor_no,
          createdAt: room.created_at,
          persons,
        },
      })
    } catch {
      return res.status(500).json({ ok: false, error: 'failed to fetch room' })
    }
  })

  app.post('/api/create_rooms', (req, res) => {
    const { roomNo, floorNo, persons, originalRoomNo, action } = req.body ?? {}

    if (action === 'delete') {
      const lookupRoomNo = isNonEmptyString(originalRoomNo)
        ? originalRoomNo.trim()
        : isNonEmptyString(roomNo)
          ? roomNo.trim()
          : ''

      if (!lookupRoomNo) {
        return res.status(400).json({ ok: false, error: 'roomNo is required' })
      }

      try {
        const deleteTx = db.transaction(() => {
          const existing = db
            .prepare('SELECT id FROM rooms WHERE room_no = ?')
            .get(lookupRoomNo)

          if (!existing?.id) return null

          const roomId = Number(existing.id)
          db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId)
          return roomId
        })

        const deletedId = deleteTx()

        if (!deletedId) {
          return res.status(404).json({ ok: false, error: 'room not found' })
        }

        return res.status(200).json({ ok: true, data: { id: deletedId, roomNo: lookupRoomNo } })
      } catch {
        return res.status(500).json({ ok: false, error: 'failed to delete room' })
      }
    }

    if (!isNonEmptyString(roomNo) && toOptionalInt(roomNo) === null) {
      return res.status(400).json({ ok: false, error: 'roomNo is required' })
    }

    if (!isNonEmptyString(floorNo) && toOptionalInt(floorNo) === null) {
      return res.status(400).json({ ok: false, error: 'floorNo is required' })
    }

    if (!Array.isArray(persons) || persons.length === 0) {
      return res.status(400).json({ ok: false, error: 'persons must be a non-empty array' })
    }

    const normalizedPersons = []

    for (const p of persons) {
      const name = typeof p?.name === 'string' ? p.name.trim() : ''
      const nationality = typeof p?.nationality === 'string' ? p.nationality.trim() : ''
      const age = toOptionalInt(p?.age)

      if (!name) {
        return res.status(400).json({ ok: false, error: 'each person must have a name' })
      }

      if (age === null || age < 0) {
        return res.status(400).json({ ok: false, error: 'each person must have a valid age' })
      }

      if (!nationality) {
        return res
          .status(400)
          .json({ ok: false, error: 'each person must have a nationality' })
      }

      normalizedPersons.push({ name, age, nationality })
    }

    const roomNoNormalized = isNonEmptyString(roomNo) ? roomNo.trim() : String(toOptionalInt(roomNo))
    const floorNoNormalized = isNonEmptyString(floorNo)
      ? floorNo.trim()
      : String(toOptionalInt(floorNo))

    try {
      const upsertRoomTx = db.transaction(() => {
        const createdAt = new Date().toISOString()
        const lookupRoomNo = isNonEmptyString(originalRoomNo)
          ? originalRoomNo.trim()
          : roomNoNormalized

        const existing = db
          .prepare('SELECT id FROM rooms WHERE room_no = ?')
          .get(lookupRoomNo)

        const insertPerson = db.prepare(
          'INSERT INTO persons (room_id, name, age, nationality) VALUES (?, ?, ?, ?)',
        )

        if (existing?.id) {
          const roomId = Number(existing.id)
          db.prepare('UPDATE rooms SET room_no = ?, floor_no = ? WHERE id = ?').run(
            roomNoNormalized,
            floorNoNormalized,
            roomId,
          )
          db.prepare('DELETE FROM persons WHERE room_id = ?').run(roomId)

          for (const p of normalizedPersons) {
            insertPerson.run(roomId, p.name, p.age, p.nationality)
          }

          return roomId
        }

        const roomResult = db
          .prepare(
            'INSERT INTO rooms (room_no, floor_no, created_at) VALUES (?, ?, ?)',
          )
          .run(roomNoNormalized, floorNoNormalized, createdAt)

        const roomId = Number(roomResult.lastInsertRowid)
        for (const p of normalizedPersons) {
          insertPerson.run(roomId, p.name, p.age, p.nationality)
        }

        return roomId
      })

      const roomId = upsertRoomTx()

      return res.status(200).json({
        ok: true,
        data: {
          id: roomId,
          roomNo: roomNoNormalized,
          floorNo: floorNoNormalized,
          persons: normalizedPersons,
        },
      })
    } catch {
      return res.status(500).json({ ok: false, error: 'failed to create room' })
    }
  })

  return app
}
