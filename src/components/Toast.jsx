import './Toast.css'

export default function Toast({ message, onClose }) {
  if (!message) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      <div className="toastMessage">{message}</div>
      <button className="toastClose" type="button" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  )
}
