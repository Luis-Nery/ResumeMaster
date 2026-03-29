import {Routes, Route, Navigate} from 'react-router-dom'
import {useAuth} from './context/AuthContext'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'
import ResumeEditorPage from './pages/ResumeEditorPage'

const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useAuth()
    return isAuthenticated() ? children : <Navigate to="/login"/>
}

const App = () => {
    return (
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
                    <ResumeBuilderPage/>
                </ProtectedRoute>
            }/>
            <Route path="/resume/:id" element={
                <ProtectedRoute>
                    <ResumeEditorPage/>
                </ProtectedRoute>
            }/>
            <Route path="/" element={<Navigate to="/login"/>}/>
        </Routes>
    )
}

export default App