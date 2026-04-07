const MinimalTemplate = ({
                             resumeData,
                             accentColor = '#111111',
                             font = 'Arial, sans-serif',
                             fontSizes,
                             padding,
                             sectionSpacing
                         }) => {
    const {personalInfo, summary, experience, education, skills} = resumeData

    const fs = {
        base: fontSizes?.base || '13px',
        title: fontSizes?.title || '36px',
        name: fontSizes?.name || '14px',
        small: fontSizes?.small || '11px',
        label: fontSizes?.label || '10px',
    }

    const gap = sectionSpacing || '24px'

    const filteredExperience = experience.filter(e => e.company || e.title)
    const filteredEducation = education.filter(e => e.school || e.degree)

    const contactFields = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedin,
        personalInfo.github,
    ].filter(Boolean)

    const contactText = contactFields.join('   |   ')
    const base = parseFloat(fs.small) || 11
    const contactFontSize = Math.min(base, Math.max(7, 4200 / Math.max(1, contactText.length)))

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
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
        }}>

            {/* Header */}
            <div style={{marginBottom: gap}}>
                <h1 style={{
                    fontSize: fs.title,
                    fontWeight: '200',
                    letterSpacing: '0.1em',
                    color: '#1a1a1a',
                    margin: '0 0 8px 0',
                    textTransform: 'uppercase',
                    fontFamily: font,
                }}>
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                </h1>
                <div style={{
                    width: '100%',
                    height: '1px',
                    background: `linear-gradient(to right, ${accentColor}, transparent)`,
                    marginBottom: '8px',
                }}/>
                <p style={{
                    fontSize: contactFontSize + 'px',
                    color: '#555',
                    margin: 0,
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    width: '100%',
                }}>
                    {contactText}
                </p>
            </div>

            {/* Summary */}
            {summary && (
                <div style={{marginBottom: gap}}>
                    <p style={{
                        fontSize: fs.label,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: accentColor,
                        marginBottom: '8px',
                    }}>
                        Profile
                    </p>
                    <p style={{
                        fontSize: fs.base,
                        lineHeight: '1.7',
                        color: '#333',
                        margin: 0,
                    }}>
                        {summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {filteredExperience.length > 0 && (
                <div style={{marginBottom: gap}}>
                    <p style={{
                        fontSize: fs.label,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: accentColor,
                        marginBottom: '12px',
                    }}>
                        Experience
                    </p>
                    {filteredExperience.map((exp, idx) => {
                        const isLast = idx === filteredExperience.length - 1
                        return (
                            <div key={exp.id} style={{
                                marginBottom: isLast ? '0' : '16px',
                                paddingBottom: isLast ? '0' : '16px',
                                borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: '2px'
                                }}>
                                    <strong style={{fontSize: fs.name, color: '#1a1a1a', fontWeight: '600'}}>
                                        {exp.title}
                                    </strong>
                                    <span style={{fontSize: fs.small, color: '#777', letterSpacing: '0.02em'}}>
                                        {exp.startDate}{exp.startDate && ' — '}{exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <p style={{
                                    fontSize: fs.small,
                                    color: accentColor === '#111111' ? '#666' : accentColor,
                                    margin: '0 0 6px 0',
                                    fontWeight: '500',
                                }}>
                                    {exp.company}
                                </p>
                                {exp.description && (
                                    <p style={{
                                        fontSize: fs.base,
                                        lineHeight: '1.6',
                                        color: '#444',
                                        margin: 0,
                                    }}>
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Education */}
            {filteredEducation.length > 0 && (
                <div style={{marginBottom: gap}}>
                    <p style={{
                        fontSize: fs.label,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: accentColor,
                        marginBottom: '12px',
                    }}>
                        Education
                    </p>
                    {filteredEducation.map((edu, idx) => {
                        const isLast = idx === filteredEducation.length - 1
                        return (
                            <div key={edu.id} style={{
                                marginBottom: isLast ? '0' : '14px',
                                paddingBottom: isLast ? '0' : '14px',
                                borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginBottom: '2px'
                                }}>
                                    <strong style={{fontSize: fs.name, color: '#1a1a1a', fontWeight: '600'}}>
                                        {edu.school}
                                    </strong>
                                    <span style={{fontSize: fs.small, color: '#777'}}>
                                        {edu.startDate}{edu.startDate && ' — '}{edu.endDate}
                                    </span>
                                </div>
                                <p style={{fontSize: fs.small, color: '#555', margin: 0}}>
                                    {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Skills */}
            {skills.some(skill => skill) && (
                <div>
                    <p style={{
                        fontSize: fs.label,
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: accentColor,
                        marginBottom: '8px',
                    }}>
                        Skills
                    </p>
                    <p style={{
                        fontSize: fs.base,
                        color: '#444',
                        margin: 0,
                        lineHeight: '1.8',
                        letterSpacing: '0.02em',
                    }}>
                        {skills.filter(Boolean).join('   ·   ')}
                    </p>
                </div>
            )}
        </div>
    )
}

export default MinimalTemplate