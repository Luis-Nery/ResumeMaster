import { useState } from 'react'
import api from '../services/api'

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0d0d14',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#f0f0ff',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
}

const ScoreRing = ({ score }) => {
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                border: `4px solid ${color}`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color }}>{score}</span>
            </div>
            <div>
                <p style={{ color: '#f0f0ff', fontSize: '15px', fontWeight: '600', margin: 0 }}>Overall Score</p>
                <p style={{ color: '#8b8ba7', fontSize: '12px', margin: '4px 0 0' }}>
                    {score >= 75 ? 'Strong resume — minor tweaks needed' : score >= 50 ? 'Good foundation — room to improve' : 'Needs work — follow the suggestions below'}
                </p>
            </div>
        </div>
    )
}

const SectionCard = ({ title, score, feedback, suggestion, suggestions }) => {
    const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <div style={{
            backgroundColor: '#0d0d14', border: '1px solid #2a2a3a',
            borderRadius: '10px', padding: '16px', marginBottom: '12px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#f0f0ff', fontSize: '13px', fontWeight: '600' }}>{title}</span>
                <span style={{ color, fontSize: '12px', fontWeight: '700' }}>{score}/100</span>
            </div>
            <p style={{ color: '#8b8ba7', fontSize: '12px', lineHeight: '1.6', margin: '0 0 8px' }}>{feedback}</p>
            {suggestion && (
                <p style={{ color: '#a78bfa', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                    💡 {suggestion}
                </p>
            )}
            {suggestions && suggestions.map((s, i) => (
                <p key={i} style={{ color: '#a78bfa', fontSize: '12px', lineHeight: '1.6', margin: '4px 0 0' }}>
                    💡 {s}
                </p>
            ))}
        </div>
    )
}

export default function AiPanel({ resumeData }) {
    const [activeTab, setActiveTab] = useState('analyze')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Analyze state
    const [analyzeJobTitle, setAnalyzeJobTitle] = useState('')
    const [analyzeResult, setAnalyzeResult] = useState(null)

    // Rewrite state
    const [bulletText, setBulletText] = useState('')
    const [rewriteJobTitle, setRewriteJobTitle] = useState('')
    const [rewriteResult, setRewriteResult] = useState(null)
    const [copiedIndex, setCopiedIndex] = useState(null)

    // Match state
    const [jobDescription, setJobDescription] = useState('')
    const [matchResult, setMatchResult] = useState(null)

    const handleAnalyze = async () => {
        setLoading(true)
        setError(null)
        setAnalyzeResult(null)
        try {
            const { data } = await api.post('/ai/analyze', {
                resumeContent: JSON.stringify(resumeData),
                jobTitle: analyzeJobTitle,
            })
            setAnalyzeResult(typeof data === 'string' ? JSON.parse(data) : data)
        } catch (e) {
            setError('Analysis failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRewrite = async () => {
        if (!bulletText.trim()) return
        setLoading(true)
        setError(null)
        setRewriteResult(null)
        try {
            const { data } = await api.post('/ai/rewrite', {
                bulletText,
                jobTitle: rewriteJobTitle,
            })
            const parsed = typeof data === 'string' ? JSON.parse(data) : data
            setRewriteResult(parsed.rewrites)
        } catch (e) {
            setError('Rewrite failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleMatch = async () => {
        if (!jobDescription.trim()) return
        setLoading(true)
        setError(null)
        setMatchResult(null)
        try {
            const { data } = await api.post('/ai/match', {
                resumeContent: JSON.stringify(resumeData),
                jobDescription,
            })
            setMatchResult(typeof data === 'string' ? JSON.parse(data) : data)
        } catch (e) {
            setError('Match failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const tabs = [
        { id: 'analyze', label: '📊 Analyze' },
        { id: 'rewrite', label: '✍️ Rewrite' },
        { id: 'match', label: '🎯 Match' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Tab bar */}
            <div style={{
                display: 'flex', gap: '4px', backgroundColor: '#0d0d14',
                padding: '4px', borderRadius: '10px', border: '1px solid #2a2a3a',
            }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => { setActiveTab(t.id); setError(null) }} style={{
                        flex: 1, padding: '8px', borderRadius: '7px', border: 'none',
                        fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                        backgroundColor: activeTab === t.id ? '#16161f' : 'transparent',
                        color: activeTab === t.id ? '#f0f0ff' : '#8b8ba7',
                        transition: 'all 0.2s ease',
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    backgroundColor: '#2a1a1a', border: '1px solid #ef4444',
                    color: '#ef4444', padding: '12px 16px', borderRadius: '8px', fontSize: '13px',
                }}>
                    {error}
                </div>
            )}

            {/* ── ANALYZE TAB ── */}
            {activeTab === 'analyze' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ color: '#8b8ba7', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                            Target job title (optional)
                        </label>
                        <input
                            style={inputStyle}
                            placeholder="e.g. Java Backend Developer"
                            value={analyzeJobTitle}
                            onChange={e => setAnalyzeJobTitle(e.target.value)}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                        />
                    </div>
                    <button onClick={handleAnalyze} disabled={loading} style={{
                        padding: '12px', borderRadius: '8px', border: 'none',
                        background: loading ? '#2a2a3a' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: '#f0f0ff', fontSize: '14px', fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}>
                        {loading ? 'Analyzing...' : '✨ Analyze My Resume'}
                    </button>

                    {analyzeResult && (
                        <div>
                            <ScoreRing score={analyzeResult.overallScore} />
                            {analyzeResult.summary && (
                                <SectionCard title="Summary" {...analyzeResult.summary} />
                            )}
                            {analyzeResult.experience && (
                                <SectionCard title="Experience" {...analyzeResult.experience} />
                            )}
                            {analyzeResult.skills && (
                                <SectionCard title="Skills" {...analyzeResult.skills} />
                            )}
                            {analyzeResult.overall && (
                                <div style={{
                                    backgroundColor: '#16161f', border: '1px solid #7c3aed44',
                                    borderRadius: '10px', padding: '16px', marginTop: '4px',
                                }}>
                                    <p style={{ color: '#8b8ba7', fontSize: '12px', fontWeight: '600', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Assessment</p>
                                    <p style={{ color: '#f0f0ff', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{analyzeResult.overall}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── REWRITE TAB ── */}
            {activeTab === 'rewrite' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ color: '#8b8ba7', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                            Bullet point to improve
                        </label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: '1.6' }}
                            placeholder="e.g. Worked on backend systems and fixed bugs"
                            value={bulletText}
                            onChange={e => setBulletText(e.target.value)}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                        />
                    </div>
                    <div>
                        <label style={{ color: '#8b8ba7', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                            Target role (optional)
                        </label>
                        <input
                            style={inputStyle}
                            placeholder="e.g. Java Backend Developer"
                            value={rewriteJobTitle}
                            onChange={e => setRewriteJobTitle(e.target.value)}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                        />
                    </div>
                    <button onClick={handleRewrite} disabled={loading || !bulletText.trim()} style={{
                        padding: '12px', borderRadius: '8px', border: 'none',
                        background: (loading || !bulletText.trim()) ? '#2a2a3a' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: '#f0f0ff', fontSize: '14px', fontWeight: '600',
                        cursor: (loading || !bulletText.trim()) ? 'not-allowed' : 'pointer',
                    }}>
                        {loading ? 'Rewriting...' : '✨ Get 3 Rewrites'}
                    </button>

                    {rewriteResult && rewriteResult.map((item, i) => (
                        <div key={i} style={{
                            backgroundColor: '#0d0d14', border: '1px solid #2a2a3a',
                            borderRadius: '10px', padding: '16px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                <p style={{ color: '#f0f0ff', fontSize: '13px', lineHeight: '1.6', margin: 0, flex: 1 }}>
                                    {item.text}
                                </p>
                                <button onClick={() => copyToClipboard(item.text, i)} style={{
                                    backgroundColor: copiedIndex === i ? '#16161f' : 'transparent',
                                    border: '1px solid #2a2a3a', borderRadius: '6px',
                                    color: copiedIndex === i ? '#22c55e' : '#8b8ba7',
                                    padding: '4px 10px', fontSize: '11px', cursor: 'pointer', flexShrink: 0,
                                }}>
                                    {copiedIndex === i ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p style={{ color: '#a78bfa', fontSize: '11px', margin: '8px 0 0' }}>
                                💡 {item.improvement}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── MATCH TAB ── */}
            {activeTab === 'match' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ color: '#8b8ba7', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                            Paste job description
                        </label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', lineHeight: '1.6' }}
                            placeholder="Paste the full job description here..."
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = '#2a2a3a'}
                        />
                    </div>
                    <button onClick={handleMatch} disabled={loading || !jobDescription.trim()} style={{
                        padding: '12px', borderRadius: '8px', border: 'none',
                        background: (loading || !jobDescription.trim()) ? '#2a2a3a' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: '#f0f0ff', fontSize: '14px', fontWeight: '600',
                        cursor: (loading || !jobDescription.trim()) ? 'not-allowed' : 'pointer',
                    }}>
                        {loading ? 'Scanning...' : '🎯 Check ATS Match'}
                    </button>

                    {matchResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <ScoreRing score={matchResult.score} />

                            {matchResult.matchedKeywords?.length > 0 && (
                                <div>
                                    <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: '600', margin: '0 0 8px' }}>
                                        ✓ Matched keywords ({matchResult.matchedKeywords.length})
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {matchResult.matchedKeywords.map((kw, i) => (
                                            <span key={i} style={{
                                                backgroundColor: '#14291f', border: '1px solid #22c55e44',
                                                color: '#22c55e', fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                                            }}>{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {matchResult.missingKeywords?.length > 0 && (
                                <div>
                                    <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', margin: '0 0 8px' }}>
                                        ✗ Missing keywords ({matchResult.missingKeywords.length})
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {matchResult.missingKeywords.map((kw, i) => (
                                            <span key={i} style={{
                                                backgroundColor: '#2a1a1a', border: '1px solid #ef444444',
                                                color: '#ef4444', fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                                            }}>{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {matchResult.feedback && (
                                <div style={{
                                    backgroundColor: '#0d0d14', border: '1px solid #2a2a3a',
                                    borderRadius: '10px', padding: '16px',
                                }}>
                                    <p style={{ color: '#f0f0ff', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                                        {matchResult.feedback}
                                    </p>
                                </div>
                            )}

                            {matchResult.suggestions?.length > 0 && (
                                <div>
                                    {matchResult.suggestions.map((s, i) => (
                                        <p key={i} style={{ color: '#a78bfa', fontSize: '12px', lineHeight: '1.6', margin: '4px 0' }}>
                                            💡 {s}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}