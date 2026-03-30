const MinimalTemplate = ({ resumeData, accentColor = '#111111', font = 'Arial, sans-serif', fontSizes, padding }) => {
    const { personalInfo, summary, experience, education, skills } = resumeData

    const fs = {
        base: fontSizes?.base || '13px',
        title: fontSizes?.title || '36px',
        name: fontSizes?.name || '14px',
        small: fontSizes?.small || '11px',
        label: fontSizes?.label || '10px',
    }

    const sectionHeader = {
        fontSize: fs.label,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: '#999',
        marginBottom: '16px',
        fontFamily: 'Arial, sans-serif',
    }

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
            <div style={{ marginBottom: '48px' }}>
                <h1 style={{
                    fontSize: fs.title,
                    fontWeight: '300',
                    letterSpacing: '0.08em',
                    color: '#1a1a1a',
                    margin: '0 0 16px 0',
                    textTransform: 'uppercase',
                    fontFamily: font,
                }}>
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                </h1>
                <div style={{ width: '40px', height: '2px', backgroundColor: accentColor, marginBottom: '16px' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', fontSize: fs.small, color: '#888' }}>
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.linkedin && <span style={{ color: accentColor }}>{personalInfo.linkedin}</span>}
                </div>
            </div>

            {/* Summary */}
            {summary && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={sectionHeader}>Profile</h2>
                    <p style={{
                        fontSize: fs.base,
                        lineHeight: '1.9',
                        color: '#555',
                        margin: 0,
                        borderLeft: `2px solid ${accentColor}`,
                        paddingLeft: '16px',
                    }}>
                        {summary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {experience.some(exp => exp.company || exp.title) && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={sectionHeader}>Experience</h2>
                    {experience.filter(exp => exp.company || exp.title).map(exp => (
                        <div key={exp.id} style={{
                            marginBottom: '24px',
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '0 24px',
                        }}>
                            <div style={{ paddingTop: '2px' }}>
                                <p style={{ fontSize: fs.small, color: '#999', margin: 0, lineHeight: '1.6' }}>
                                    {exp.startDate}{exp.startDate && ' —'}<br />
                                    {exp.current ? 'Present' : exp.endDate}
                                </p>
                            </div>
                            <div>
                                <strong style={{ fontSize: fs.name, color: '#1a1a1a', display: 'block', marginBottom: '2px' }}>
                                    {exp.title}
                                </strong>
                                <p style={{ fontSize: fs.small, color: accentColor === '#111111' ? '#666' : accentColor, marginBottom: '6px', fontWeight: '500' }}>
                                    {exp.company}
                                </p>
                                {exp.description && (
                                    <p style={{ fontSize: fs.base, lineHeight: '1.7', color: '#666', margin: 0 }}>
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {education.some(edu => edu.school || edu.degree) && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={sectionHeader}>Education</h2>
                    {education.filter(edu => edu.school || edu.degree).map(edu => (
                        <div key={edu.id} style={{
                            marginBottom: '20px',
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr',
                            gap: '0 24px',
                        }}>
                            <div style={{ paddingTop: '2px' }}>
                                <p style={{ fontSize: fs.small, color: '#999', margin: 0, lineHeight: '1.6' }}>
                                    {edu.startDate}{edu.startDate && ' —'}<br />
                                    {edu.endDate}
                                </p>
                            </div>
                            <div>
                                <strong style={{ fontSize: fs.name, color: '#1a1a1a', display: 'block', marginBottom: '2px' }}>
                                    {edu.school}
                                </strong>
                                <p style={{ fontSize: fs.base, color: '#666', margin: 0 }}>
                                    {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {skills.some(skill => skill) && (
                <div>
                    <h2 style={sectionHeader}>Skills</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {skills.filter(Boolean).map((skill, idx) => (
                            <span key={idx} style={{
                                fontSize: fs.small,
                                color: '#555',
                                padding: '4px 12px',
                                border: '1px solid #e5e5e5',
                                borderRadius: '2px',
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MinimalTemplate