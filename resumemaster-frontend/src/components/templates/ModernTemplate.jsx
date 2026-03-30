const ModernTemplate = ({ resumeData, accentColor = '#4f46e5', font = 'Arial, sans-serif', fontSizes, padding }) => {
    const { personalInfo, summary, experience, education, skills } = resumeData

    const fs = {
        base: fontSizes?.base || '13px',
        title: fontSizes?.title || '22px',
        name: fontSizes?.name || '15px',
        small: fontSizes?.small || '12px',
        label: fontSizes?.label || '10px',
    }

    return (
        <div style={{
            fontFamily: font,
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '700px',
            margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            borderRadius: '4px',
            minHeight: '900px',
            display: 'flex',
            fontSize: fs.base,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
        }}>
            {/* LEFT SIDEBAR */}
            <div style={{
                width: '35%',
                backgroundColor: accentColor,
                padding: '40px 24px',
                color: 'white',
                flexShrink: 0,
            }}>
                <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    <h1 style={{
                        fontSize: fs.title,
                        fontWeight: '700',
                        color: 'white',
                        margin: '0 0 4px 0',
                        lineHeight: '1.3',
                    }}>
                        {personalInfo.firstName || 'Your'}{' '}
                        {personalInfo.lastName || 'Name'}
                    </h1>
                </div>

                <div style={{ marginBottom: '28px' }}>
                    <p style={{ fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
                        Contact
                    </p>
                    {personalInfo.email && (
                        <p style={{ fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px', wordBreak: 'break-all' }}>
                            {personalInfo.email}
                        </p>
                    )}
                    {personalInfo.phone && (
                        <p style={{ fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px' }}>
                            {personalInfo.phone}
                        </p>
                    )}
                    {personalInfo.location && (
                        <p style={{ fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px' }}>
                            {personalInfo.location}
                        </p>
                    )}
                    {personalInfo.linkedin && (
                        <p style={{ fontSize: fs.small, color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all' }}>
                            {personalInfo.linkedin}
                        </p>
                    )}
                </div>

                {skills.some(skill => skill) && (
                    <div>
                        <p style={{ fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
                            Skills
                        </p>
                        {skills.filter(Boolean).map((skill, idx) => (
                            <div key={idx} style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: fs.small,
                                color: 'white',
                                marginBottom: '6px',
                            }}>
                                {skill}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT CONTENT */}
            <div style={{ flex: 1, padding: padding || '40px 32px' }}>
                {summary && (
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{
                            fontSize: fs.label,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: accentColor,
                            marginBottom: '12px',
                            fontFamily: 'Arial, sans-serif',
                        }}>
                            About Me
                        </h2>
                        <p style={{ fontSize: fs.base, lineHeight: '1.7', color: '#444', margin: 0 }}>
                            {summary}
                        </p>
                    </div>
                )}

                {experience.some(exp => exp.company || exp.title) && (
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{
                            fontSize: fs.label,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: accentColor,
                            marginBottom: '12px',
                            fontFamily: 'Arial, sans-serif',
                        }}>
                            Experience
                        </h2>
                        {experience.filter(exp => exp.company || exp.title).map(exp => (
                            <div key={exp.id} style={{
                                marginBottom: '16px',
                                paddingLeft: '12px',
                                borderLeft: `3px solid ${accentColor}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                    <strong style={{ fontSize: fs.name, color: '#1a1a1a' }}>{exp.title}</strong>
                                    <span style={{ fontSize: fs.small, color: '#888', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                                        {exp.startDate}{exp.startDate && ' — '}{exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div style={{ fontSize: fs.small, color: accentColor, fontWeight: '600', marginBottom: '4px' }}>
                                    {exp.company}
                                </div>
                                {exp.description && (
                                    <p style={{ fontSize: fs.base, lineHeight: '1.6', color: '#555', margin: 0 }}>
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {education.some(edu => edu.school || edu.degree) && (
                    <div>
                        <h2 style={{
                            fontSize: fs.label,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: accentColor,
                            marginBottom: '12px',
                            fontFamily: 'Arial, sans-serif',
                        }}>
                            Education
                        </h2>
                        {education.filter(edu => edu.school || edu.degree).map(edu => (
                            <div key={edu.id} style={{
                                marginBottom: '14px',
                                paddingLeft: '12px',
                                borderLeft: `3px solid ${accentColor}`,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                    <strong style={{ fontSize: fs.name, color: '#1a1a1a' }}>{edu.school}</strong>
                                    <span style={{ fontSize: fs.small, color: '#888', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                                        {edu.startDate}{edu.startDate && ' — '}{edu.endDate}
                                    </span>
                                </div>
                                <div style={{ fontSize: fs.base, color: '#666' }}>
                                    {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModernTemplate