import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import LavaLamp from '../components/LavaLamp'

const LandingPage = () => {
    const navigate = useNavigate()
    const heroRef = useRef(null)

    useEffect(() => {
        const el = heroRef.current
        if (!el) return
        el.style.opacity = '0'
        el.style.transform = 'translateY(24px)'
        requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.7s ease, transform 0.7s ease'
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
        })
    }, [])

    const features = [
        {
            icon: '✦',
            title: 'AI-Powered Writing',
            desc: 'Claude AI analyzes your resume, rewrites bullet points, and matches your content to job descriptions.',
        },
        {
            icon: '◈',
            title: 'ATS Scoring',
            desc: 'See how your resume scores against applicant tracking systems before you hit submit.',
        },
        {
            icon: '❏',
            title: 'Professional Templates',
            desc: 'Classic, Modern, and Minimal templates — each fully customizable with your own colors and fonts.',
        },
        {
            icon: '↓',
            title: 'Instant PDF Export',
            desc: 'Download a crisp, high-quality PDF in seconds. Formatted to impress, ready to send.',
        },
    ]

    return (
        <div style={{
            backgroundColor: '#0d0d14',
            minHeight: 'calc(100vh - 64px)',
            color: '#f0f0ff',
            overflowX: 'hidden',
            position: 'relative',
        }}>

            {/* LavaLamp ambient background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.35,
                pointerEvents: 'none',
                zIndex: 0,
            }}>
                <LavaLamp />
            </div>

            {/* All content sits above the lava lamp */}
            <div style={{position: 'relative', zIndex: 1}}>

                {/* Grid background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '680px',
                    backgroundImage: `
                        linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px',
                    maskImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 60%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 60%, transparent)',
                    pointerEvents: 'none',
                }}/>

                {/* Glow */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '400px',
                    background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}/>

                {/* Hero */}
                <div ref={heroRef} style={{
                    position: 'relative',
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '100px 40px 80px',
                    textAlign: 'center',
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#7c3aed18',
                        border: '1px solid #7c3aed44',
                        borderRadius: '100px',
                        padding: '6px 16px',
                        marginBottom: '32px',
                        fontSize: '12px',
                        color: '#a78bfa',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                    }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: '#7c3aed',
                            boxShadow: '0 0 8px #7c3aed',
                            display: 'inline-block',
                            animation: 'pulse 2s infinite',
                        }}/>
                        AI-Powered Resume Builder
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(36px, 6vw, 64px)',
                        fontWeight: '700',
                        lineHeight: '1.1',
                        letterSpacing: '-0.02em',
                        marginBottom: '24px',
                        color: '#f0f0ff',
                    }}>
                        Your resume,{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            perfected
                        </span>
                        {' '}by AI
                    </h1>

                    <p style={{
                        fontSize: '18px',
                        color: '#8b8ba7',
                        lineHeight: '1.7',
                        maxWidth: '560px',
                        margin: '0 auto 48px',
                    }}>
                        Build, tailor, and export professional resumes in minutes.
                        Let AI handle the hard part so you can focus on landing the job.
                    </p>

                    <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#f0f0ff',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 0 32px rgba(124,58,237,0.3)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.5)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 0 32px rgba(124,58,237,0.3)'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        >
                            Get started free
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '14px 32px',
                                backgroundColor: 'transparent',
                                border: '1px solid #2a2a3a',
                                borderRadius: '10px',
                                color: '#8b8ba7',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#7c3aed44'
                                e.currentTarget.style.color = '#f0f0ff'
                                e.currentTarget.style.backgroundColor = '#7c3aed11'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#2a2a3a'
                                e.currentTarget.style.color = '#8b8ba7'
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Sign in
                        </button>
                    </div>
                </div>

                {/* Resume preview mockup */}
                <div style={{
                    maxWidth: '860px',
                    margin: '0 auto 100px',
                    padding: '0 40px',
                    position: 'relative',
                }}>
                    <div style={{
                        borderRadius: '16px',
                        border: '1px solid #2a2a3a',
                        backgroundColor: '#16161f',
                        overflow: 'hidden',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                    }}>
                        {/* Browser chrome */}
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #2a2a3a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#0d0d14',
                        }}>
                            {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                                <div key={c} style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c, opacity: 0.7}}/>
                            ))}
                            <div style={{
                                flex: 1, maxWidth: '240px', margin: '0 auto',
                                backgroundColor: '#2a2a3a', borderRadius: '6px',
                                padding: '4px 12px', fontSize: '11px', color: '#8b8ba7',
                                textAlign: 'center',
                            }}>
                                resumemaster.dev/resume/new
                            </div>
                        </div>
                        {/* App mockup content */}
                        <div style={{display: 'flex', height: '340px'}}>
                            {/* Left panel */}
                            <div style={{
                                width: '45%', padding: '24px', borderRight: '1px solid #2a2a3a',
                                display: 'flex', flexDirection: 'column', gap: '12px',
                            }}>
                                <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                                    {['✏️ Write', '🎨 Design', '✨ AI'].map(t => (
                                        <div key={t} style={{
                                            padding: '5px 12px', borderRadius: '6px', fontSize: '11px',
                                            backgroundColor: t === '✏️ Write' ? '#16161f' : 'transparent',
                                            border: t === '✏️ Write' ? '1px solid #2a2a3a' : '1px solid transparent',
                                            color: t === '✏️ Write' ? '#f0f0ff' : '#8b8ba7',
                                        }}>{t}</div>
                                    ))}
                                </div>
                                {[
                                    {label: 'Job Title', value: 'Software Engineer'},
                                    {label: 'Company', value: 'ResumeMaster'},
                                ].map(f => (
                                    <div key={f.label}>
                                        <div style={{fontSize: '10px', color: '#8b8ba7', marginBottom: '4px'}}>{f.label}</div>
                                        <div style={{
                                            backgroundColor: '#0d0d14', border: '1px solid #7c3aed',
                                            borderRadius: '6px', padding: '7px 10px',
                                            fontSize: '11px', color: '#f0f0ff',
                                        }}>{f.value}</div>
                                    </div>
                                ))}
                                <div>
                                    <div style={{fontSize: '10px', color: '#8b8ba7', marginBottom: '6px'}}>Bullet Style</div>
                                    <div style={{display: 'flex', gap: '6px'}}>
                                        {['•', '▪', '–', '→', '✓'].map((b, i) => (
                                            <div key={b} style={{
                                                padding: '4px 10px', borderRadius: '5px', fontSize: '12px',
                                                backgroundColor: i === 0 ? '#7c3aed22' : 'transparent',
                                                border: `1px solid ${i === 0 ? '#7c3aed' : '#2a2a3a'}`,
                                                color: i === 0 ? '#a78bfa' : '#8b8ba7',
                                            }}>{b}</div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{marginTop: '4px'}}>
                                    <div style={{fontSize: '10px', color: '#8b8ba7', marginBottom: '6px'}}>Bullet Points</div>
                                    {[
                                        'Built full-stack AI resume builder at resumemaster.dev',
                                        'Integrated Claude AI for resume analysis and ATS scoring',
                                    ].map((b, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px',
                                        }}>
                                            <span style={{color: '#8b8ba7', fontSize: '11px'}}>•</span>
                                            <div style={{
                                                flex: 1, backgroundColor: '#0d0d14',
                                                border: '1px solid #2a2a3a', borderRadius: '5px',
                                                padding: '5px 8px', fontSize: '10px', color: '#f0f0ff',
                                            }}>{b}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right panel — resume preview */}
                            <div style={{flex: 1, padding: '24px', backgroundColor: '#f8f9fc', overflowY: 'hidden'}}>
                                <div style={{backgroundColor: 'white', borderRadius: '4px', padding: '20px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
                                    <div style={{textAlign: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '2px solid #1a1a1a'}}>
                                        <div style={{fontSize: '18px', fontWeight: '700', color: '#1a1a1a', fontFamily: 'Georgia, serif'}}>Luis Nery</div>
                                        <div style={{fontSize: '9px', color: '#555', marginTop: '4px'}}>resumemaster@gmail.com  |  (409) 000-0000  |  Port Arthur, TX</div>
                                    </div>
                                    <div style={{marginBottom: '10px'}}>
                                        <div style={{fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a1a', borderBottom: '1px solid #1a1a1a', paddingBottom: '2px', marginBottom: '6px'}}>Work Experience</div>
                                        <div style={{fontSize: '9px', fontWeight: '700', color: '#1a1a1a'}}>Software Engineer</div>
                                        <div style={{fontSize: '8px', color: '#555', fontStyle: 'italic', marginBottom: '4px'}}>ResumeMaster</div>
                                        {['Built full-stack AI resume builder using Java Spring Boot and React', 'Integrated Claude AI for resume analysis and ATS job matching'].map((b, i) => (
                                            <div key={i} style={{display: 'flex', gap: '4px', fontSize: '8px', color: '#333', marginBottom: '2px'}}>
                                                <span>•</span><span>{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div style={{fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a1a', borderBottom: '1px solid #1a1a1a', paddingBottom: '2px', marginBottom: '6px'}}>Skills</div>
                                        <div style={{fontSize: '8px', color: '#374151'}}>
                                            <strong style={{color: '#1a1a1a'}}>Languages: </strong>Java, JavaScript, SQL
                                        </div>
                                        <div style={{fontSize: '8px', color: '#374151', marginTop: '2px'}}>
                                            <strong style={{color: '#1a1a1a'}}>Frameworks: </strong>Spring Boot, React, JPA/Hibernate
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fade bottom of mockup */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 40, right: 40, height: '80px',
                        background: 'linear-gradient(to bottom, transparent, #0d0d14)',
                        pointerEvents: 'none',
                    }}/>
                </div>

                {/* Features */}
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '0 40px 100px',
                }}>
                    <div style={{textAlign: 'center', marginBottom: '56px'}}>
                        <h2 style={{
                            fontSize: '32px', fontWeight: '700', color: '#f0f0ff',
                            letterSpacing: '-0.01em', marginBottom: '12px',
                        }}>
                            Everything you need to get hired
                        </h2>
                        <p style={{fontSize: '15px', color: '#8b8ba7'}}>
                            Built for job seekers who want an edge — not just a template.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                    }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                backgroundColor: '#16161f',
                                border: '1px solid #2a2a3a',
                                borderRadius: '14px',
                                padding: '24px',
                                transition: 'border-color 0.2s ease, transform 0.2s ease',
                                cursor: 'default',
                            }}
                                 onMouseEnter={e => {
                                     e.currentTarget.style.borderColor = '#7c3aed44'
                                     e.currentTarget.style.transform = 'translateY(-3px)'
                                 }}
                                 onMouseLeave={e => {
                                     e.currentTarget.style.borderColor = '#2a2a3a'
                                     e.currentTarget.style.transform = 'translateY(0)'
                                 }}
                            >
                                <div style={{
                                    fontSize: '20px',
                                    marginBottom: '14px',
                                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '14px', fontWeight: '600', color: '#f0f0ff',
                                    marginBottom: '8px',
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{fontSize: '13px', color: '#8b8ba7', lineHeight: '1.6', margin: 0}}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA banner */}
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '0 40px 100px',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #7c3aed18, #4f46e518)',
                        border: '1px solid #7c3aed33',
                        borderRadius: '20px',
                        padding: '56px 40px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: '-60px', left: '50%',
                            transform: 'translateX(-50%)',
                            width: '300px', height: '200px',
                            background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}/>
                        <h2 style={{
                            fontSize: '28px', fontWeight: '700', color: '#f0f0ff',
                            marginBottom: '12px', letterSpacing: '-0.01em',
                        }}>
                            Ready to land your next role?
                        </h2>
                        <p style={{fontSize: '15px', color: '#8b8ba7', marginBottom: '32px'}}>
                            Join for free. No credit card required.
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                padding: '14px 40px',
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#f0f0ff',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 0 32px rgba(124,58,237,0.4)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 0 48px rgba(124,58,237,0.6)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 0 32px rgba(124,58,237,0.4)'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        >
                            Create your resume →
                        </button>
                    </div>
                </div>

            </div>{/* end content wrapper */}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    )
}

export default LandingPage
