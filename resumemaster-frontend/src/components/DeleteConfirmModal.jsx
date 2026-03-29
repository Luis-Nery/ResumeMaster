import { useState } from 'react'

const DeleteConfirmModal = ({ resumeTitle, onConfirm, onCancel }) => {
    const [input, setInput] = useState('')

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px',
                borderRadius: '8px', width: '400px'
            }}>
                <h2>Delete Resume</h2>
                <p>This action cannot be undone. Type <strong>{resumeTitle}</strong> to confirm.</p>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type resume title here"
                    style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel}>Cancel</button>
                    <button
                        onClick={() => onConfirm()}
                        disabled={input !== resumeTitle}
                        style={{ backgroundColor: input === resumeTitle ? 'red' : '#ccc', color: 'white' }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirmModal