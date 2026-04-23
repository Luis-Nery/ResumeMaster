import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import LavaLamp from '../components/LavaLamp'

const GOOGLE_OAUTH_URL = `${import.meta.env.VITE_API_ORIGIN}/oauth2/authorization/google?mode=login`

/**
 * Login page with email/password form. On successful authentication the
 * backend JWT, userId, and email are stored via `AuthContext.login` and the
 * user is redirected to `/dashboard`. Displays a generic error message on
 * any failed attempt to avoid leaking which field is wrong.
 *
 * @returns {JSX.Element} The full-page login form with a LavaLamp background.
 */
const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    /**
     * Handles form submission: calls `POST /api/auth/login`, stores the
     * returned credentials, and navigates to the dashboard on success.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/auth/login', { email, password })
            login(response.data.authToken, response.data.userId, email)
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

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div style={{ flex: 1, height: 1, backgroundColor: '#2a2a3a' }} />
                    <span className="text-xs" style={{ color: '#8b8ba7' }}>or</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: '#2a2a3a' }} />
                </div>

                {/* Google OAuth button */}
                <a
                    href={GOOGLE_OAUTH_URL}
                    className="flex items-center justify-center gap-3 w-full py-3 rounded-lg text-sm font-medium transition"
                    style={{
                        backgroundColor: '#16161f',
                        border: '1px solid #2a2a3a',
                        color: '#f0f0ff',
                        textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </a>

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