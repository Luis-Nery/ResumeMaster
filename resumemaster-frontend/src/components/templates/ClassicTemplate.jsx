import { useState, useEffect, useRef } from 'react'

const ClassicTemplate = ({
                             resumeData,
                             accentColor = '#1a1a1a',
                             font = 'Georgia, serif',
                             fontSizes,
                             padding,
                             sectionSpacing
                         }) => {
    const {personalInfo, summary, experience, education, skills} = resumeData
    const contactRef = useRef(null)
    const [contactFontSize, setContactFontSize] = useState(null)

    const fs = {
        base: fontSizes?.base || '13.5px',
        title: fontSizes?.title || '32px',
        name: fontSizes?.name || '16px',
        small: fontSizes?.small || '12px',
        label: fontSizes?.label || '11px',
    }

    const sectionHeader = {
        fontSize: fs.label,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: accentColor,
        marginBottom: '10px',
        fontFamily: 'Arial, sans-serif',
        borderBottom: `2px solid ${accentColor}`,
        paddingBottom: '4px',
    }

    const contactFields = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedin,
        personalInfo.github,
    ].filter(Boolean)

    const contactText = contactFields.join('   |   ')
    const baseSize = parseFloat(fs.small) || 12

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

    return (
        <div style={{
            fontFamily: font,
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '700px',
            margin: '0 auto',
            padding: padding || '48px 56px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            borderRadius: '4px',
            minHeight: '1122px',
            color: '#1a1a1a',
            fontSize: fs.base,
            boxSizing: 'border-box',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: `3px solid ${accentColor}`,
                width: '100%',
                overflow: 'hidden',
            }}>
                <h1 style={{
                    margin: '0 0 8px 0',
                    fontSize: fs.title,
                    fontWeight: '700',
                    letterSpacing: '0.02em',
                    color: '#1a1a1a',
                    fontFamily: font,
                }}>
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                </h1>
                <p ref={contactRef} style={{
                    fontSize: (contactFontSize || baseSize) + 'px',
                    color: '#555',
                    margin: 0,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    width: '100%',
                    boxSizing: 'border-box',
                }}>
                    {contactText}
                </p>
            </div>

            {/* Summary */}
            {summary && (
                <div style={{marginBottom: sectionSpacing || '24px'}}>
                    <h2 style={sectionHeader}>Professional Summary</h2>
                    <p style={{fontSize: fs.base, lineHeight: '1.7', color: '#333', margin: 0}}>
                        {summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {experience.some(exp => exp.company || exp.title) && (
                <div style={{marginBottom: sectionSpacing || '24px'}}>
                    <h2 style={sectionHeader}>Work Experience</h2>
                    {experience.filter(exp => exp.company || exp.title).map(exp => (
                        <div key={exp.id} style={{marginBottom: '16px'}}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '2px'
                            }}>
                                <strong style={{fontSize: fs.name, color: '#1a1a1a'}}>{exp.title}</strong>
                                <span style={{
                                    fontSize: fs.small,
                                    color: '#777',
                                    whiteSpace: 'nowrap',
                                    marginLeft: '16px'
                                }}>
                                    {exp.startDate}{exp.startDate && ' — '}{exp.current ? 'Present' : exp.endDate}
                                </span>
                            </div>
                            <div style={{fontSize: fs.base, color: '#555', fontStyle: 'italic', marginBottom: '6px'}}>
                                {exp.company}
                            </div>
                            {exp.description && (
                                <p style={{fontSize: fs.base, lineHeight: '1.6', color: '#333', margin: '0 0 6px 0'}}>
                                    {exp.description}
                                </p>
                            )}
                            {exp.bullets && exp.bullets.some(b => b.trim()) && (
                                <div style={{margin: 0}}>
                                    {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            gap: '8px',
                                            alignItems: 'flex-start',
                                            marginBottom: '3px',
                                            fontSize: fs.base,
                                            lineHeight: '1.6',
                                            color: '#333',
                                        }}>
                                            <span style={{flexShrink: 0, marginTop: '1px'}}>{exp.bulletStyle || '•'}</span>
                                            <span>{bullet}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {education.some(edu => edu.school || edu.degree) && (
                <div style={{marginBottom: sectionSpacing || '24px'}}>
                    <h2 style={sectionHeader}>Education</h2>
                    {education.filter(edu => edu.school || edu.degree).map(edu => (
                        <div key={edu.id} style={{marginBottom: '14px'}}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '2px'
                            }}>
                                <strong style={{fontSize: fs.name, color: '#1a1a1a'}}>{edu.school}</strong>
                                <span style={{
                                    fontSize: fs.small,
                                    color: '#777',
                                    whiteSpace: 'nowrap',
                                    marginLeft: '16px'
                                }}>
                                    {edu.startDate}{edu.startDate && ' — '}{edu.endDate}
                                </span>
                            </div>
                            <div style={{fontSize: fs.base, color: '#555', fontStyle: 'italic'}}>
                                {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {skills.some(skill => skill) && (
                <div>
                    <h2 style={sectionHeader}>Skills</h2>
                    <p style={{
                        fontSize: fs.base,
                        color: '#374151',
                        margin: 0,
                        lineHeight: '1.8',
                    }}>
                        {skills.filter(Boolean).join(' • ')}
                    </p>
                </div>
            )}
        </div>
    )
}

export default ClassicTemplate