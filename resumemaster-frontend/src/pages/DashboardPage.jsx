import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const DashboardPage = () => {
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const { logout, userId } = useAuth()
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

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/resumes/${id}`)
            setResumes(resumes.filter(resume => resume.id !== id))
        } catch (err) {
            setError('Failed to delete resume')
        }
    }

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <div>
                <h1>My Resumes</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {error && <p>{error}</p>}

            <button onClick={() => navigate('/resume/new')}>
                Create New Resume
            </button>

            {resumes.length === 0 ? (
                <p>No resumes yet. Create your first one!</p>
            ) : (
                <div>
                    {resumes.map(resume => (
                        <div key={resume.id}>
                            <h3>{resume.title}</h3>
                            <p>{resume.content}</p>
                            <button onClick={() => navigate(`/resume/${resume.id}`)}>
                                Edit
                            </button>
                            <button onClick={() => handleDelete(resume.id)}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DashboardPage