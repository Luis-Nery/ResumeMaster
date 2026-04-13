import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Account settings page accessible at `/settings`. Displays the
 * authenticated user's email address and placeholder buttons for
 * forthcoming features (password change, Google sign-in link). The
 * "Danger Zone" section contains a sign-out button.
 *
 * @returns {JSX.Element} The settings page layout.
 */
const SettingsPage = () => {
    const { logout, email } = useAuth()
    const navigate = useNavigate()

    /**
     * Logs the user out via AuthContext and redirects to `/login`.
     */
    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#0d0d14' }}
             className="px-8 py-10">
            <div className="max-w-2xl mx-auto">

                <div className="mb-10">
                    <h1 className="text-3xl font-semibold mb-1" style={{ color: '#f0f0ff' }}>
                        Settings
                    </h1>
                    <p className="text-sm" style={{ color: '#8b8ba7' }}>
                        Manage your account preferences
                    </p>
                </div>

                {/* Account Section */}
                <div className="rounded-2xl p-6 mb-4"
                     style={{ backgroundColor: '#16161f', border: '1px solid #2a2a3a' }}>
                    <h2 className="text-sm font-semibold uppercase tracking-widest mb-4"
                        style={{ color: '#8b8ba7' }}>
                        Account
                    </h2>

                    <div className="flex items-center justify-between py-4"
                         style={{ borderBottom: '1px solid #2a2a3a' }}>
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>
                                Email
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#8b8ba7' }}>
                                {email || 'Not available'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4"
                         style={{ borderBottom: '1px solid #2a2a3a' }}>
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>
                                Password
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#8b8ba7' }}>
                                Change your password
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 rounded-lg text-xs font-medium transition"
                            style={{
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
                            Coming soon
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>
                                Google Sign In
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#8b8ba7' }}>
                                Link your Google account
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 rounded-lg text-xs font-medium transition"
                            style={{
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
                            Coming soon
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl p-6"
                     style={{ backgroundColor: '#16161f', border: '1px solid #ef444433' }}>
                    <h2 className="text-sm font-semibold uppercase tracking-widest mb-4"
                        style={{ color: '#ef4444' }}>
                        Danger Zone
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>
                                Sign out
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#8b8ba7' }}>
                                Sign out of your account on this device
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg text-xs font-medium transition"
                            style={{
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
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage