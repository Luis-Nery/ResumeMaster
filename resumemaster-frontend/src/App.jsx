import {Routes, Route, Navigate} from 'react-router-dom'
import {useAuth} from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import ResumeFormPage from './pages/ResumeFormPage'
import LandingPage from './pages/LandingPage'
import OAuth2CallbackPage from './pages/OAuth2CallbackPage'
import Navbar from './components/Navbar'

/**
 * Route guard that redirects unauthenticated users to `/login`.
 * Wraps any page component that requires the user to be logged in.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} The protected children or a redirect to `/login`.
 */
const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useAuth()
    return isAuthenticated() ? children : <Navigate to="/login"/>
}

/**
 * Root application component.
 * Renders the persistent {@link Navbar} and declares all client-side
 * routes. Protected routes are wrapped with {@link ProtectedRoute} so
 * unauthenticated visitors are redirected to `/login`.
 *
 * @returns {JSX.Element} The full application shell with routing.
 */
const App = () => {
    return (
        <div>
            <Navbar/>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage/>
                    </ProtectedRoute>
                }/>
                <Route path="/resume/new" element={
                    <ProtectedRoute>
                        <ResumeFormPage />
                    </ProtectedRoute>
                } />
                <Route path="/resume/:id" element={
                    <ProtectedRoute>
                        <ResumeFormPage />
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <SettingsPage/>
                    </ProtectedRoute>
                }/>
                <Route path="/oauth2/callback" element={<OAuth2CallbackPage/>}/>
                <Route path="/" element={<LandingPage/>}/>
            </Routes>
        </div>
    )
}

export default App