import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LavaLamp from '../components/LavaLamp'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/auth/login', { email, password })
            login(response.data.authToken, response.data.userId)
            navigate('/dashboard')
        } catch (err) {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="flex items-center justify-center px-4 relative overflow-hidden"
            style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#0d0d14' }}
        >
            <LavaLamp />

            {/* Card */}
            <div className="w-full max-w-md rounded-2xl p-8 relative z-10"
                 style={{
                     backgroundColor: 'rgba(22, 22, 31, 0.85)',
                     border: '1px solid #2a2a3a',
                     backdropFilter: 'blur(12px)'
                 }}>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold mb-1 gradient-text">
                        Welcome back
                    </h1>
                    <p className="text-sm" style={{ color: '#8b8ba7' }}>
                        Sign in to continue building your career
                    </p>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg text-sm"
                         style={{ backgroundColor: '#2a1a1a', border: '1px solid #ef4444', color: '#ef4444' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2"
                               style={{ color: '#8b8ba7' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition"
                            style={{
                                backgroundColor: '#0d0d14',
                                border: '1px solid #2a2a3a',
                                color: '#f0f0ff',
                            }}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2"
                               style={{ color: '#8b8ba7' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition"
                            style={{
                                backgroundColor: '#0d0d14',
                                border: '1px solid #2a2a3a',
                                color: '#f0f0ff',
                            }}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg text-sm font-medium transition"
                        style={{
                            background: loading ? '#2a2a3a' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            color: '#f0f0ff',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: '#8b8ba7' }}>
                    Don't have an account?{' '}
                    <Link to="/register"
                          className="font-medium transition"
                          style={{ color: '#7c3aed' }}
                          onMouseEnter={e => e.target.style.color = '#9d5cff'}
                          onMouseLeave={e => e.target.style.color = '#7c3aed'}
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage