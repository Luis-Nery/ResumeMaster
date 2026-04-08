import {Routes, Route, Navigate} from 'react-router-dom'
import {useAuth} from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import ResumeFormPage from './pages/ResumeFormPage'
import LandingPage from './pages/LandingPage'
import Navbar from './components/Navbar'

const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useAuth()
    return isAuthenticated() ? children : <Navigate to="/login"/>
}

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
                <Route path="/" element={<LandingPage/>}/>
            </Routes>
        </div>
    )
}

export default App