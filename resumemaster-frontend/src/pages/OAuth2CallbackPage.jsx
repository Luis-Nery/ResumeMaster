import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Handles the redirect back from the Google OAuth2 flow.
 * On success the backend appends `?token=<jwt>&userId=<id>`; this component
 * stores the credentials via AuthContext and navigates to the dashboard.
 * On email mismatch the backend appends `?error=email_mismatch&googleEmail=<addr>`;
 * this component forwards those params to `/settings` so the error can be shown
 * near the Google sync section. Any other missing params redirect to `/login`.
 *
 * @returns {JSX.Element} A centered loading spinner shown while the handoff is in progress.
 */
const OAuth2CallbackPage = () => {
    const [searchParams] = useSearchParams()
    const { login } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const allParams = Object.fromEntries(searchParams.entries())
        console.log('[OAuth2Callback] query params received:', allParams)

        const error = searchParams.get('error')

        if (error === 'email_mismatch') {
            const googleEmail = searchParams.get('googleEmail') ?? ''
            console.log('[OAuth2Callback] email_mismatch error, googleEmail:', googleEmail)
            navigate(
                `/settings?error=email_mismatch&googleEmail=${encodeURIComponent(googleEmail)}`,
                { replace: true }
            )
            return
        }

        const token = searchParams.get('token')
        const userId = searchParams.get('userId')

        if (!token || !userId) {
            console.log('[OAuth2Callback] missing token or userId, redirecting to /login')
            navigate('/login', { replace: true })
            return
        }

        // The JWT subject claim is the user's email.
        let email = null
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            email = payload.sub ?? null
            console.log('[OAuth2Callback] token decoded successfully, email:', email, 'userId:', userId)
        } catch (err) {
            console.error('[OAuth2Callback] failed to decode token:', err)
        }

        login(token, userId, email)
        navigate('/dashboard', { replace: true })
    }, [])

    return (
        <div
            className="flex flex-col items-center justify-center"
            style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#0d0d14' }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #2a2a3a',
                    borderTopColor: '#7c3aed',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            <p className="mt-4 text-sm" style={{ color: '#8b8ba7' }}>
                Signing you in…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

export default OAuth2CallbackPage
