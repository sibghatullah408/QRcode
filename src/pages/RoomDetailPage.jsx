import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRoom } from '../services/roomsService.js'
import './RoomDetailPage.css'

export default function RoomDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [state, setState] = useState({ status: 'loading', room: null, error: '' })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const room = await getRoom({ id })
        if (cancelled) return
        setState({ status: 'ready', room, error: '' })
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : 'Failed to load room'
        setState({ status: 'error', room: null, error: message })
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  if (state.status === 'loading') {
    return (
      <section className="roomDetailPage">
        <div className="roomDetailLoading">Loading...</div>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="roomDetailPage">
        <div className="roomDetailError">{state.error}</div>
        <button className="roomDetailBack" type="button" onClick={() => navigate('/rooms')}>
          Back to Directory ›
        </button>
      </section>
    )
  }

  const room = state.room
  const title = `Floor ${room.floorNo} - Room ${room.roomNo}`

  return (
    <section className="roomDetailPage">
      <div className="roomDetailHeader">{title}</div>

      <div className="roomDetailList">
        {room.persons.map((p, idx) => (
          <article key={`${p.name}-${idx}`} className="personCard">
            <div className="personTop">
              <div className="personName">{p.name}</div>
              <div className="personIcon" aria-hidden="true" />
            </div>

            <div className="personMeta">
              <div className="metaRow">
                <div className="metaLabel">AGE:</div>
                <div className="metaValue">{p.age}</div>
              </div>
              <div className="metaRow">
                <div className="metaLabel">NATIONALITY:</div>
                <div className="metaValue">{p.nationality}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className="roomDetailBack" type="button" onClick={() => navigate('/rooms')}>
        Back to Directory ›
      </button>
    </section>
  )
}
