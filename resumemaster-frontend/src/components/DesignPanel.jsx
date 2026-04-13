const templates = [
    { id: 'classic', name: 'Classic', description: 'Traditional single column' },
    { id: 'modern', name: 'Modern', description: 'Two column with sidebar' },
    { id: 'minimal', name: 'Minimal', description: 'Clean with wide spacing' },
]

const accentColors = [
    { id: '#1a1a1a', name: 'Black' },
    { id: '#1e3a5f', name: 'Navy' },
    { id: '#4f46e5', name: 'Indigo' },
    { id: '#7c3aed', name: 'Violet' },
    { id: '#0f766e', name: 'Teal' },
    { id: '#b45309', name: 'Amber' },
    { id: '#be123c', name: 'Rose' },
    { id: '#15803d', name: 'Green' },
    { id: '#1d4ed8', name: 'Blue' },
    { id: '#7e22ce', name: 'Purple' },
    { id: '#c2410c', name: 'Orange' },
    { id: '#374151', name: 'Slate' },
]

const fonts = [
    { id: 'Georgia, serif', name: 'Georgia', label: 'Classic Serif' },
    { id: 'Arial, sans-serif', name: 'Arial', label: 'Clean Sans' },
    { id: 'Inter, sans-serif', name: 'Inter', label: 'Modern Sans' },
    { id: '"Times New Roman", serif', name: 'Times New Roman', label: 'Traditional' },
    { id: 'Garamond, serif', name: 'Garamond', label: 'Elegant Serif' },
    { id: '"Courier New", monospace', name: 'Courier New', label: 'Monospace' },
    { id: 'Verdana, sans-serif', name: 'Verdana', label: 'Wide Sans' },
    { id: '"Trebuchet MS", sans-serif', name: 'Trebuchet', label: 'Humanist' },
]

const paddingOptions = [
    { id: 'compact', name: 'Dense', description: 'Maximum writing space' },
    { id: 'normal', name: 'Balanced', description: 'Standard spacing' },
    { id: 'relaxed', name: 'Airy', description: 'More whitespace' },
]

const sectionSpacingOptions = [
    { id: 'tight', name: 'Tight', description: 'Compact sections' },
    { id: 'normal', name: 'Normal', description: 'Balanced sections' },
    { id: 'loose', name: 'Loose', description: 'Spacious sections' },
]

const fontSizeOptions = [
    { id: 'small', name: 'Small', size: '12px' },
    { id: 'medium', name: 'Medium', size: '14px' },
    { id: 'large', name: 'Large', size: '16px' },
]

/**
 * Side panel for customising the visual appearance of the resume.
 * Provides four tabbed sections — Styles (template), Fonts, Colors,
 * and Spacing — each of which calls `onUpdate` with the changed field
 * and its new value. No local state is kept: the parent owns all
 * design fields through `resumeData`.
 *
 * @param {object}   props
 * @param {object}   props.resumeData           - Current resume data including design fields
 *                                                (`template`, `font`, `fontSize`, `accentColor`,
 *                                                `padding`, `sectionSpacing`, `designTab`).
 * @param {Function} props.onUpdate             - Callback `(field: string, value: any) => void`
 *                                                invoked whenever the user changes a design setting.
 * @returns {JSX.Element} The tabbed design-options panel.
 */
const DesignPanel = ({ resumeData, onUpdate }) => {
    const activeTab = resumeData.designTab || 'styles'

    /**
     * Switches the active design tab by writing `designTab` into resume data.
     *
     * @param {string} tab - One of `'styles'`, `'fonts'`, `'colors'`, `'spacing'`.
     */
    const setTab = (tab) => onUpdate('designTab', tab)

    return (
        <div style={{
            backgroundColor: '#16161f',
            border: '1px solid #2a2a3a',
            borderRadius: '12px',
            overflow: 'hidden',
            flex: 1,
        }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3a' }}>
                {['styles', 'fonts', 'colors', 'spacing'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setTab(tab)}
                        style={{
                            flex: 1,
                            padding: '12px 6px',
                            fontSize: '11px',
                            fontWeight: '500',
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                            border: 'none',
                            backgroundColor: activeTab === tab ? '#0d0d14' : 'transparent',
                            color: activeTab === tab ? '#f0f0ff' : '#8b8ba7',
                            borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>

                {/* Styles Tab */}
                {activeTab === 'styles' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {templates.map(t => (
                            <div
                                key={t.id}
                                onClick={() => onUpdate('template', t.id)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: `2px solid ${resumeData.template === t.id ? '#7c3aed' : '#2a2a3a'}`,
                                    backgroundColor: resumeData.template === t.id ? '#7c3aed11' : '#0d0d14',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    height: '80px',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    marginBottom: '8px',
                                    overflow: 'hidden',
                                }}>
                                    {t.id === 'classic' && (
                                        <div style={{ padding: '8px' }}>
                                            <div style={{ height: '6px', backgroundColor: '#1a1a1a', borderRadius: '2px', marginBottom: '4px', width: '60%', margin: '0 auto 4px' }} />
                                            <div style={{ height: '2px', backgroundColor: '#e5e5e5', marginBottom: '6px' }} />
                                            <div style={{ height: '3px', backgroundColor: '#eee', borderRadius: '2px', marginBottom: '3px', width: '90%' }} />
                                            <div style={{ height: '3px', backgroundColor: '#eee', borderRadius: '2px', marginBottom: '3px', width: '75%' }} />
                                            <div style={{ height: '3px', backgroundColor: '#eee', borderRadius: '2px', width: '85%' }} />
                                        </div>
                                    )}
                                    {t.id === 'modern' && (
                                        <div style={{ display: 'flex', height: '100%' }}>
                                            <div style={{ width: '35%', backgroundColor: resumeData.accentColor || '#4f46e5', padding: '6px' }}>
                                                <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '2px', marginBottom: '3px' }} />
                                                <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', marginBottom: '3px' }} />
                                                <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                                            </div>
                                            <div style={{ flex: 1, padding: '6px' }}>
                                                <div style={{ height: '3px', backgroundColor: '#eee', borderRadius: '2px', marginBottom: '3px' }} />
                                                <div style={{ height: '3px', backgroundColor: '#eee', borderRadius: '2px', marginBottom: '3px', width: '80%' }} />
                                                <div style={{ height: '3px', backgroundColor: '#eee', borderRadius: '2px', width: '90%' }} />
                                            </div>
                                        </div>
                                    )}
                                    {t.id === 'minimal' && (
                                        <div style={{ padding: '8px' }}>
                                            <div style={{ height: '8px', backgroundColor: '#1a1a1a', borderRadius: '2px', marginBottom: '3px', width: '50%' }} />
                                            <div style={{ height: '2px', backgroundColor: resumeData.accentColor || '#111', width: '20px', marginBottom: '6px' }} />
                                            <div style={{ height: '2px', backgroundColor: '#eee', borderRadius: '2px', marginBottom: '4px', width: '90%' }} />
                                            <div style={{ height: '2px', backgroundColor: '#eee', borderRadius: '2px', marginBottom: '4px', width: '75%' }} />
                                            <div style={{ height: '2px', backgroundColor: '#eee', borderRadius: '2px', width: '85%' }} />
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: resumeData.template === t.id ? '#a78bfa' : '#f0f0ff', margin: '0 0 2px 0' }}>
                                    {t.name}
                                </p>
                                <p style={{ fontSize: '11px', color: '#8b8ba7', margin: 0 }}>
                                    {t.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Fonts Tab */}
                {activeTab === 'fonts' && (
                    <div>
                        <p style={{ fontSize: '12px', color: '#8b8ba7', marginBottom: '12px' }}>Font Family</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                            {fonts.map(f => (
                                <div
                                    key={f.id}
                                    onClick={() => onUpdate('font', f.id)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: `2px solid ${resumeData.font === f.id ? '#7c3aed' : '#2a2a3a'}`,
                                        backgroundColor: resumeData.font === f.id ? '#7c3aed11' : '#0d0d14',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <p style={{ fontFamily: f.id, fontSize: '20px', color: '#f0f0ff', margin: '0 0 4px 0' }}>
                                        Aa
                                    </p>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: resumeData.font === f.id ? '#a78bfa' : '#f0f0ff', margin: '0 0 2px 0' }}>
                                        {f.name}
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#8b8ba7', margin: 0 }}>
                                        {f.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '12px', color: '#8b8ba7', marginBottom: '12px' }}>Font Size</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {fontSizeOptions.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => onUpdate('fontSize', s.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: `2px solid ${resumeData.fontSize === s.id ? '#7c3aed' : '#2a2a3a'}`,
                                        backgroundColor: resumeData.fontSize === s.id ? '#7c3aed11' : '#0d0d14',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <p style={{ fontSize: s.size, color: '#f0f0ff', margin: '0 0 4px 0', fontWeight: '600' }}>
                                        Aa
                                    </p>
                                    <p style={{ fontSize: '11px', color: resumeData.fontSize === s.id ? '#a78bfa' : '#8b8ba7', margin: 0 }}>
                                        {s.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Colors Tab */}
                {activeTab === 'colors' && (
                    <div>
                        <p style={{ fontSize: '12px', color: '#8b8ba7', marginBottom: '12px' }}>Accent Color</p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            {accentColors.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => onUpdate('accentColor', c.id)}
                                    title={c.name}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: c.id,
                                        cursor: 'pointer',
                                        border: resumeData.accentColor === c.id ? '3px solid #f0f0ff' : '3px solid transparent',
                                        outline: resumeData.accentColor === c.id ? '2px solid #7c3aed' : 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                            ))}
                        </div>
                        <p style={{ fontSize: '12px', color: '#8b8ba7', marginBottom: '8px' }}>Custom Color</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input
                                type="color"
                                value={resumeData.accentColor || '#1a1a1a'}
                                onChange={(e) => onUpdate('accentColor', e.target.value)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    border: '1px solid #2a2a3a',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    padding: '2px',
                                }}
                            />
                            <span style={{ fontSize: '13px', color: '#8b8ba7' }}>
                                {resumeData.accentColor || '#1a1a1a'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Spacing Tab */}
                {activeTab === 'spacing' && (
                    <div>
                        <p style={{ fontSize: '12px', color: '#8b8ba7', marginBottom: '12px' }}>Page Padding</p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                            {paddingOptions.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => onUpdate('padding', p.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: `2px solid ${resumeData.padding === p.id ? '#7c3aed' : '#2a2a3a'}`,
                                        backgroundColor: resumeData.padding === p.id ? '#7c3aed11' : '#0d0d14',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '40px',
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: p.id === 'compact' ? '2px' : p.id === 'normal' ? '6px' : '10px',
                                    }}>
                                        <div style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6', borderRadius: '2px' }} />
                                    </div>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: resumeData.padding === p.id ? '#a78bfa' : '#f0f0ff', margin: '0 0 2px 0' }}>
                                        {p.name}
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#8b8ba7', margin: 0 }}>
                                        {p.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: '12px', color: '#8b8ba7', marginBottom: '12px' }}>Section Spacing</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {sectionSpacingOptions.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => onUpdate('sectionSpacing', s.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: `2px solid ${resumeData.sectionSpacing === s.id ? '#7c3aed' : '#2a2a3a'}`,
                                        backgroundColor: resumeData.sectionSpacing === s.id ? '#7c3aed11' : '#0d0d14',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '40px',
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-around',
                                        padding: s.id === 'tight' ? '2px 4px' : s.id === 'normal' ? '5px 4px' : '9px 4px',
                                    }}>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} style={{ height: '2px', backgroundColor: '#e5e5e5', borderRadius: '1px' }} />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: resumeData.sectionSpacing === s.id ? '#a78bfa' : '#f0f0ff', margin: '0 0 2px 0' }}>
                                        {s.name}
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#8b8ba7', margin: 0 }}>
                                        {s.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DesignPanel