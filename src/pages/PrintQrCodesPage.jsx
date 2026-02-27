import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { getRooms } from '../services/roomsService.js'
import Toast from '../components/Toast.jsx'
import './PrintQrCodesPage.css'

function buildRoomUrl(roomId) {
  const base = window.location.origin.replace(/\/+$/, '')
  return `${base}/room/${encodeURIComponent(String(roomId))}`
}

export default function PrintQrCodesPage() {
  const [rooms, setRooms] = useState([])
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (message) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(''), 2200)
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getRooms()
        if (cancelled) return
        setRooms(data)
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : 'Failed to load rooms'
        showToast(message)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const [qrMap, setQrMap] = useState({})

  const qrJobs = useMemo(() => {
    return rooms
      .filter((r) => r?.id !== undefined && r?.id !== null)
      .map((r) => ({ id: r.id, url: buildRoomUrl(r.id) }))
  }, [rooms])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const next = {}
      for (const job of qrJobs) {
        try {
          const dataUrl = await QRCode.toDataURL(job.url, {
            margin: 1,
            width: 260,
            errorCorrectionLevel: 'M',
          })
          next[job.id] = dataUrl
        } catch {
          next[job.id] = ''
        }
      }

      if (!cancelled) setQrMap(next)
    }

    run()

    return () => {
      cancelled = true
    }
  }, [qrJobs])

  return (
    <section className="printQrPage">
      <div className="printQrCard">
        <header className="printQrHeader">
          <div className="printQrTitle">Print QR Codes</div>
          <button className="printButton" type="button" onClick={() => window.print()}>
            Print
          </button>
        </header>

        <div className="printQrBody">
          {rooms.length === 0 ? <div className="printQrEmpty">No rooms found</div> : null}

          <div className="qrGrid">
            {rooms.map((r) => {
              const id = r?.id
              const url = id ? buildRoomUrl(id) : ''
              const img = id ? qrMap[id] : ''
              const floorLabel = `Floor ${r.floorNo}`
              const roomLabel = `Room ${r.roomNo}`

              return (
                <div key={`${r.roomNo}-${id ?? 'na'}`} className="qrCard">
                  <div className="qrCardHeader">{`${floorLabel} - ${roomLabel}`}</div>
                  <div className="qrCardBody">
                    <div className="qrImageWrap">
                      {img ? <img className="qrImage" src={img} alt={url} /> : <div className="qrPlaceholder" />}
                    </div>
                    <div className="qrUrl">{url}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </section>
  )
}
