import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const { logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            backgroundColor: '#1a1a2e',
            color: 'white'
        }}>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '22px', fontWeight: 'bold' }}>
                ResumeMaster
            </Link>

            {isAuthenticated() && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                        Dashboard
                    </Link>
                    <Link to="/resume/new" style={{ color: 'white', textDecoration: 'none' }}>
                        New Resume
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'transparent',
                            border: '1px solid white',
                            color: 'white',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    )
}

export default Navbar