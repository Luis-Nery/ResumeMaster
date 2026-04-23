import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

/**
 * Account settings page accessible at `/settings`. Displays the
 * authenticated user's email address, a change-password form, and a
 * "Danger Zone" section with a sign-out button.
 *
 * @returns {JSX.Element} The settings page layout.
 */
const SettingsPage = () => {
    const { logout, email, userId } = useAuth()
    const googleOAuthUrl = `${import.meta.env.VITE_API_ORIGIN}/oauth2/authorization/google?mode=link&linkUserId=${userId}`
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [googleId, setGoogleId] = useState(null)
    const [googleLoading, setGoogleLoading] = useState(true)
    const [googleError, setGoogleError] = useState('')

    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)

    useEffect(() => {
        api.get(`/users/${userId}`)
            .then(res => setGoogleId(res.data.googleId ?? null))
            .catch(() => {})
            .finally(() => setGoogleLoading(false))
    }, [userId])

    useEffect(() => {
        if (searchParams.get('error') !== 'email_mismatch') return
        const googleEmail = searchParams.get('googleEmail') ?? ''
        setGoogleError(
            `The Google account you selected (${googleEmail}) doesn't match your account email. ` +
            `Please sign in with the Google account associated with your email or create a new account ` +
            `by signing in solely through Google through the signup page.`
        )
    }, [])

    /**
     * Logs the user out via AuthContext and redirects to `/login`.
     */
    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    /**
     * Validates and submits the change-password form.
     * Calls PUT /api/users/{userId}/password with currentPassword and newPassword.
     *
     * @param {React.FormEvent} e
     */
    const handleChangePassword = async (e) => {
        e.preventDefault()
        setPasswordSuccess('')
        setPasswordError('')

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.')
            return
        }

        setPasswordLoading(true)
        try {
            await api.put(`/users/${userId}/password`, { currentPassword, newPassword })
            setPasswordSuccess('Password changed successfully.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setShowPasswordForm(false)
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password.'
            setPasswordError(msg)
        } finally {
            setPasswordLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: '#0d0d14',
        border: '1px solid #2a2a3a',
        color: '#f0f0ff',
        fontSize: '13px',
        outline: 'none',
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

                    {/* Password row */}
                    <div className="py-4" style={{ borderBottom: '1px solid #2a2a3a' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>
                                    Password
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#8b8ba7' }}>
                                    Change your password
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPasswordForm(v => !v)
                                    setPasswordSuccess('')
                                    setPasswordError('')
                                }}
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
                                {showPasswordForm ? 'Cancel' : 'Change'}
                            </button>
                        </div>

                        {showPasswordForm && (
                            <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-3">
                                <input
                                    type="password"
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="password"
                                    placeholder="New password (min 8 characters)"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                />

                                {passwordError && (
                                    <p className="text-xs" style={{ color: '#ef4444' }}>
                                        {passwordError}
                                    </p>
                                )}
                                {passwordSuccess && (
                                    <p className="text-xs" style={{ color: '#34d399' }}>
                                        {passwordSuccess}
                                    </p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="px-4 py-2 rounded-lg text-xs font-medium transition"
                                        style={{
                                            backgroundColor: passwordLoading ? '#7c3aed33' : '#7c3aed',
                                            border: '1px solid #7c3aed',
                                            color: '#f0f0ff',
                                            opacity: passwordLoading ? 0.7 : 1,
                                        }}
                                    >
                                        {passwordLoading ? 'Saving…' : 'Save password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {passwordSuccess && !showPasswordForm && (
                            <p className="text-xs mt-2" style={{ color: '#34d399' }}>
                                {passwordSuccess}
                            </p>
                        )}
                    </div>

                    {googleError && (
                        <div
                            className="mt-4 px-4 py-3 rounded-lg text-xs cursor-pointer"
                            style={{ backgroundColor: '#2a1a1a', border: '1px solid #ef4444', color: '#ef4444' }}
                            onClick={() => setGoogleError('')}
                        >
                            {googleError}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                            </svg>
                            <div>
                                <p className="text-sm font-medium" style={{ color: '#f0f0ff' }}>
                                    Google
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#8b8ba7' }}>
                                    {googleLoading ? 'Checking…' : googleId ? 'Account linked' : 'Link your Google account'}
                                </p>
                            </div>
                        </div>

                        {googleLoading ? null : googleId ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                 style={{ backgroundColor: '#0f2a1a', border: '1px solid #34d39933' }}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-xs font-medium" style={{ color: '#34d399' }}>Synced</span>
                            </div>
                        ) : (
                            <a
                                href={googleOAuthUrl}
                                className="px-4 py-2 rounded-lg text-xs font-medium transition"
                                style={{
                                    backgroundColor: '#7c3aed22',
                                    border: '1px solid #7c3aed44',
                                    color: '#a78bfa',
                                    textDecoration: 'none',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#7c3aed33'
                                    e.currentTarget.style.color = '#c4b5fd'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#7c3aed22'
                                    e.currentTarget.style.color = '#a78bfa'
                                }}
                            >
                                Connect Google
                            </a>
                        )}
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
