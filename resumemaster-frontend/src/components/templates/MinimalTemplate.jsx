import { useState, useEffect, useRef } from 'react'

const MinimalTemplate = ({
                             resumeData,
                             accentColor = '#111111',
                             font = 'Arial, sans-serif',
                             fontSizes,
                             padding,
                             sectionSpacing
                         }) => {
    const {personalInfo, summary, experience, education, skills} = resumeData
    const contactRef = useRef(null)
    const [contactFontSize, setContactFontSize] = useState(null)

    const fs = {
        base: fontSizes?.base || '13px',
        title: fontSizes?.title || '36px',
        name: fontSizes?.name || '14px',
        small: fontSizes?.small || '11px',
        label: fontSizes?.label || '10px',
    }

    const gap = sectionSpacing || '24px'
    const filteredEducation = education.filter(e => e.school || e.degree)

    // ─── Experience split ─────────────────────────────────────────────────────
    const workEntries = experience.filter(e => (e.type || 'work') === 'work' && (e.company || e.title))
    const projectEntries = experience.filter(e => e.type === 'project' && (e.company || e.title))

    const contactFields = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedin,
        personalInfo.github,
    ].filter(Boolean)

    const contactText = contactFields.join('   |   ')
    const baseSize = parseFloat(fs.small) || 11

    useEffect(() => {
        const el = contactRef.current
        if (!el) return
        el.style.fontSize = baseSize + 'px'
        let size = baseSize
        while (el.scrollWidth > el.clientWidth && size > 7) {
            size -= 0.5
            el.style.fontSize = size + 'px'
        }
        setContactFontSize(size)
    }, [contactText, baseSize])

    // ─── Skills renderer ─────────────────────────────────────────────────────
    const isLegacySkills = Array.isArray(skills)
    const skillsData = isLegacySkills
        ? {displayMode: 'horizontal', bulletStyle: '•', separator: ',', columns: 2, categories: [{id: 1, name: '', items: skills}]}
        : skills

    const hasSkills = isLegacySkills
        ? skills.some(Boolean)
        : skillsData.categories.some(c => c.items.some(Boolean))

    const renderSkills = () => {
        const {displayMode, bulletStyle, separator, columns, categories} = skillsData
        const sep = separator === ',' ? ', ' : separator === '|' ? '  |  ' : '  •  '
        const colCount = columns || 2

        if (displayMode === 'horizontal') {
            return (
                <div>
                    {categories.filter(c => c.items.some(Boolean)).map(cat => (
                        <p key={cat.id} style={{fontSize: fs.base, color: '#444', margin: '0 0 4px 0', lineHeight: '1.7', letterSpacing: '0.02em'}}>
                            {cat.name && <strong style={{color: '#1a1a1a'}}>{cat.name}: </strong>}
                            {cat.items.filter(Boolean).join(sep)}
                        </p>
                    ))}
                </div>
            )
        }

        if (displayMode === 'vertical') {
            return (
                <div>
                    {categories.filter(c => c.items.some(Boolean)).map(cat => (
                        <div key={cat.id} style={{marginBottom: '8px'}}>
                            {cat.name && (
                                <p style={{fontSize: fs.base, fontWeight: '600', color: '#1a1a1a', margin: '0 0 4px 0'}}>
                                    {cat.name}
                                </p>
                            )}
                            {cat.items.filter(Boolean).map((item, i) => (
                                <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.base, color: '#444'}}>
                                    <span style={{flexShrink: 0}}>{bulletStyle || '•'}</span>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )
        }

        if (displayMode === 'columns') {
            return (
                <div style={{display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, gap: '8px 16px'}}>
                    {categories.filter(c => c.items.some(Boolean)).map(cat => (
                        <div key={cat.id} style={{minWidth: 0}}>
                            {cat.name && (
                                <p style={{fontSize: fs.base, fontWeight: '600', color: '#1a1a1a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    {cat.name}
                                </p>
                            )}
                            {cat.items.filter(Boolean).map((item, i) => (
                                <div key={i} style={{display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.base, color: '#444'}}>
                                    <span style={{flexShrink: 0}}>{bulletStyle || '•'}</span>
                                    <span style={{wordBreak: 'break-word'}}>{item}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )
        }
    }

    // ─── Shared entry renderer ────────────────────────────────────────────────
    const renderEntry = (exp, idx, arr) => {
        const isLast = idx === arr.length - 1
        return (
            <div key={exp.id} style={{
                marginBottom: isLast ? '0' : '16px',
                paddingBottom: isLast ? '0' : '16px',
                borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
            }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px'}}>
                    <strong style={{fontSize: fs.name, color: '#1a1a1a', fontWeight: '600'}}>{exp.title}</strong>
                    <span style={{fontSize: fs.small, color: '#777', letterSpacing: '0.02em'}}>
                        {exp.startDate}{exp.startDate && ' — '}{exp.current ? 'Present' : exp.endDate}
                    </span>
                </div>
                <p style={{fontSize: fs.small, color: accentColor === '#111111' ? '#666' : accentColor, margin: '0 0 4px 0', fontWeight: '500'}}>
                    {exp.company}
                    {exp.url && (
                        <span style={{fontWeight: '400', color: '#888'}}> &nbsp;|&nbsp; {exp.url}</span>
                    )}
                </p>
                {exp.description && (
                    <p style={{fontSize: fs.base, lineHeight: '1.6', color: '#444', margin: '0 0 6px 0'}}>
                        {exp.description}
                    </p>
                )}
                {exp.bullets && exp.bullets.some(b => b.trim()) && (
                    <div style={{margin: 0}}>
                        {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                            <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '3px', fontSize: fs.base, lineHeight: '1.6', color: '#444'}}>
                                <span style={{flexShrink: 0, marginTop: '1px'}}>{exp.bulletStyle || '•'}</span>
                                <span>{bullet}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const sectionLabel = (text) => (
        <p style={{fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, marginBottom: '12px'}}>
            {text}
        </p>
    )

    return (
        <div style={{
            fontFamily: font,
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '700px',
            margin: '0 auto',
            padding: padding || '60px 64px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            borderRadius: '4px',
            minHeight: '900px',
            color: '#1a1a1a',
            fontSize: fs.base,
            boxSizing: 'border-box',
        }}>

            {/* Header */}
            <div style={{marginBottom: gap, overflow: 'hidden', width: '100%'}}>
                <h1 style={{fontSize: fs.title, fontWeight: '200', letterSpacing: '0.1em', color: '#1a1a1a', margin: '0 0 8px 0', textTransform: 'uppercase', fontFamily: font}}>
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                </h1>
                <div style={{width: '100%', height: '1px', background: `linear-gradient(to right, ${accentColor}, transparent)`, marginBottom: '8px'}}/>
                <p ref={contactRef} style={{
                    fontSize: (contactFontSize || baseSize) + 'px', color: '#555', margin: 0,
                    letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden',
                    width: '100%', boxSizing: 'border-box',
                }}>
                    {contactText}
                </p>
            </div>

            {/* Summary */}
            {summary && (
                <div style={{marginBottom: gap}}>
                    <p style={{fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, marginBottom: '8px'}}>
                        Profile
                    </p>
                    <p style={{fontSize: fs.base, lineHeight: '1.7', color: '#333', margin: 0}}>{summary}</p>
                </div>
            )}

            {/* Work Experience */}
            {workEntries.length > 0 && (
                <div style={{marginBottom: gap}}>
                    {sectionLabel('Experience')}
                    {workEntries.map((exp, idx) => renderEntry(exp, idx, workEntries))}
                </div>
            )}

            {/* Projects */}
            {projectEntries.length > 0 && (
                <div style={{marginBottom: gap}}>
                    {sectionLabel('Projects')}
                    {projectEntries.map((exp, idx) => renderEntry(exp, idx, projectEntries))}
                </div>
            )}

            {/* Education */}
            {filteredEducation.length > 0 && (
                <div style={{marginBottom: gap}}>
                    {sectionLabel('Education')}
                    {filteredEducation.map((edu, idx) => {
                        const isLast = idx === filteredEducation.length - 1
                        return (
                            <div key={edu.id} style={{
                                marginBottom: isLast ? '0' : '14px',
                                paddingBottom: isLast ? '0' : '14px',
                                borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                            }}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px'}}>
                                    <strong style={{fontSize: fs.name, color: '#1a1a1a', fontWeight: '600'}}>{edu.school}</strong>
                                    <span style={{fontSize: fs.small, color: '#777'}}>
                                        {edu.startDate}{edu.startDate && ' — '}{edu.endDate}
                                    </span>
                                </div>
                                <p style={{fontSize: fs.small, color: '#555', margin: '0 0 3px 0'}}>
                                    {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                                    {edu.gpa && <span style={{color: '#666'}}> &nbsp;|&nbsp; GPA: {edu.gpa}</span>}
                                </p>
                                {edu.accomplishmentBullets && edu.accomplishmentBullets.some(b => b.trim()) && (
                                    <div style={{margin: 0}}>
                                        {edu.accomplishmentBullets.filter(b => b.trim()).map((bullet, i) => (
                                            <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.small, lineHeight: '1.6', color: '#666'}}>
                                                <span style={{flexShrink: 0, marginTop: '1px'}}>{edu.accomplishmentBulletStyle || '•'}</span>
                                                <span>{bullet}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {edu.accomplishments && !edu.accomplishmentBullets && (
                                    <p style={{fontSize: fs.small, color: '#666', lineHeight: '1.6', margin: 0}}>{edu.accomplishments}</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Skills */}
            {hasSkills && (
                <div>
                    <p style={{fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, marginBottom: '8px'}}>
                        Skills
                    </p>
                    {renderSkills()}
                </div>
            )}
        </div>
    )
}

export default MinimalTemplate