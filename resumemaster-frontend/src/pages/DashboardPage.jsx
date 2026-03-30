import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import api from '../services/api'

const DashboardPage = () => {
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)

    const { userId } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        fetchResumes()
    }, [])

    const fetchResumes = async () => {
        try {
            const response = await api.get(`/resumes/user/${userId}`)
            setResumes(response.data)
        } catch (err) {
            setError('Failed to load resumes')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/resumes/${deleteTarget.id}`)
            setResumes(resumes.filter(resume => resume.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (err) {
            setError('Failed to delete resume')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center"
             style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#0d0d14' }}>
            <p style={{ color: '#8b8ba7' }}>Loading your resumes...</p>
        </div>
    )

    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#0d0d14' }}
             className="px-8 py-10">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-semibold mb-1" style={{ color: '#f0f0ff' }}>
                            My Resumes
                        </h1>
                        <p className="text-sm" style={{ color: '#8b8ba7' }}>
                            {resumes.length === 0
                                ? 'No resumes yet — create your first one'
                                : `${resumes.length} resume${resumes.length > 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 rounded-lg text-sm"
                         style={{ backgroundColor: '#2a1a1a', border: '1px solid #ef4444', color: '#ef4444' }}>
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {resumes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl py-24"
                         style={{ border: '1px dashed #2a2a3a', backgroundColor: '#16161f' }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                             style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)', border: '1px solid #7c3aed44' }}>
                            <span className="text-3xl">📄</span>
                        </div>
                        <p className="text-lg font-medium mb-2" style={{ color: '#f0f0ff' }}>
                            No resumes yet
                        </p>
                        <p className="text-sm mb-8" style={{ color: '#8b8ba7' }}>
                            Create your first resume and start landing interviews
                        </p>
                        <button
                            onClick={() => navigate('/resume/new')}
                            className="px-6 py-2 rounded-lg text-sm font-medium transition"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                color: '#f0f0ff',
                            }}
                        >
                            Create your first resume
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map(resume => (
                            <div
                                key={resume.id}
                                className="rounded-2xl p-6 transition group"
                                style={{
                                    backgroundColor: '#16161f',
                                    border: `1px solid ${resume.complete ? '#2a2a3a' : '#7c3aed44'}`,
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed44'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = resume.complete ? '#2a2a3a' : '#7c3aed44'}
                            >
                                {/* Icon + Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                         style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)', border: '1px solid #7c3aed44' }}>
                                        <span className="text-lg">📄</span>
                                    </div>
                                    {!resume.complete && (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: '#a78bfa',
                                            backgroundColor: '#7c3aed22',
                                            border: '1px solid #7c3aed44',
                                            padding: '3px 10px',
                                            borderRadius: '999px',
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase'
                                        }}>
                    Incomplete
                </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-base mb-1 truncate"
                                    style={{ color: '#f0f0ff' }}>
                                    {resume.title}
                                </h3>

                                {/* Dates */}
                                <p className="text-xs mb-1" style={{ color: '#8b8ba7' }}>
                                    Created {new Date(resume.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs mb-6" style={{ color: '#8b8ba7' }}>
                                    Modified {new Date(resume.lastModified).toLocaleDateString()}
                                </p>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!resume.complete && (
                                        <button
                                            onClick={() => navigate(`/resume/${resume.id}`)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                                border: 'none',
                                                color: '#f0f0ff',
                                            }}
                                        >
                                            Continue
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/resume/${resume.id}`)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            backgroundColor: '#7c3aed22',
                                            border: '1px solid #7c3aed44',
                                            color: '#a78bfa',
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.backgroundColor = '#7c3aed33'
                                            e.target.style.color = '#c4b5fd'
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.backgroundColor = '#7c3aed22'
                                            e.target.style.color = '#a78bfa'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget({ id: resume.id, title: resume.title })}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            backgroundColor: '#ef444411',
                                            border: '1px solid #ef444433',
                                            color: '#ef4444',
                                        }}
                                        onMouseEnter={e => {
                                            e.target.style.backgroundColor = '#ef444422'
                                            e.target.style.color = '#f87171'
                                        }}
                                        onMouseLeave={e => {
                                            e.target.style.backgroundColor = '#ef444411'
                                            e.target.style.color = '#ef4444'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deleteTarget && (
                <DeleteConfirmModal
                    resumeTitle={deleteTarget.title}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}

export default DashboardPage