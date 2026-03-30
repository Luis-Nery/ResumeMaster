import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Settings } from 'lucide-react'

const Navbar = () => {
    const { logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav style={{ backgroundColor: '#0d0d14', borderBottom: '1px solid #2a2a3a' }}
             className="px-8 py-4 flex items-center justify-between sticky top-0 z-50">

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 no-underline">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="font-semibold text-lg" style={{ color: '#f0f0ff' }}>
                    ResumeMaster
                </span>
            </Link>

            {/* Nav Links */}
            {isAuthenticated() && (
                <div className="flex items-center gap-6">
                    <Link
                        to="/dashboard"
                        className="text-sm transition"
                        style={{ color: '#8b8ba7' }}
                        onMouseEnter={e => e.target.style.color = '#f0f0ff'}
                        onMouseLeave={e => e.target.style.color = '#8b8ba7'}
                    >
                        Dashboard
                    </Link>
                    <button
                        onClick={() => navigate('/resume/new')}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            color: '#f0f0ff',
                        }}
                    >
                        New Resume
                    </button>
                    <Link
                        to="/settings"
                        className="transition flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ color: '#8b8ba7', backgroundColor: 'transparent' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = '#f0f0ff'
                            e.currentTarget.style.backgroundColor = '#2a2a3a'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = '#8b8ba7'
                            e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                    >
                        <Settings size={18} />
                    </Link>
                </div>
            )}
        </nav>
    )
}

export default Navbar