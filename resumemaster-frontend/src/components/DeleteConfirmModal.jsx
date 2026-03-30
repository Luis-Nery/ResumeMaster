import { useState } from 'react'

const DeleteConfirmModal = ({ resumeTitle, onConfirm, onCancel }) => {
    const [input, setInput] = useState('')

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50"
             style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>

            <div className="w-full max-w-md rounded-2xl p-8"
                 style={{ backgroundColor: '#16161f', border: '1px solid #2a2a3a' }}>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2" style={{ color: '#f0f0ff' }}>
                        Delete Resume
                    </h2>
                    <p className="text-sm" style={{ color: '#8b8ba7' }}>
                        This action cannot be undone. Type{' '}
                        <span className="font-medium" style={{ color: '#a78bfa' }}>
                            {resumeTitle}
                        </span>{' '}
                        to confirm.
                    </p>
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type resume title here"
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition mb-6"
                    style={{
                        backgroundColor: '#0d0d14',
                        border: '1px solid #2a2a3a',
                        color: '#f0f0ff',
                    }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                />

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                        style={{
                            backgroundColor: '#16161f',
                            border: '1px solid #2a2a3a',
                            color: '#8b8ba7',
                        }}
                        onMouseEnter={e => {
                            e.target.style.borderColor = '#7c3aed44'
                            e.target.style.color = '#f0f0ff'
                        }}
                        onMouseLeave={e => {
                            e.target.style.borderColor = '#2a2a3a'
                            e.target.style.color = '#8b8ba7'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={input !== resumeTitle}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition"
                        style={{
                            backgroundColor: input === resumeTitle ? '#ef444422' : '#1a1a1a',
                            border: `1px solid ${input === resumeTitle ? '#ef4444' : '#2a2a3a'}`,
                            color: input === resumeTitle ? '#ef4444' : '#4a4a5a',
                            cursor: input === resumeTitle ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirmModal