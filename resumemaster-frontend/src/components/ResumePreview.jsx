const ResumePreview = ({ resumeData }) => {
    const { personalInfo, summary, experience, education, skills } = resumeData

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '40px', backgroundColor: 'white', minHeight: '100%' }}>

            {/* Header — Name and Contact */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '28px' }}>
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                </h1>
                <p style={{ margin: '5px 0', color: '#555' }}>
                    {[personalInfo.email, personalInfo.phone, personalInfo.location]
                        .filter(Boolean)
                        .join(' | ')}
                </p>
                {personalInfo.linkedin && (
                    <p style={{ margin: '5px 0', color: '#555' }}>{personalInfo.linkedin}</p>
                )}
            </div>

            {/* Summary */}
            {summary && (
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '4px', fontSize: '16px', textTransform: 'uppercase' }}>
                        Professional Summary
                    </h2>
                    <p>{summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.some(exp => exp.company || exp.title) && (
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '4px', fontSize: '16px', textTransform: 'uppercase' }}>
                        Work Experience
                    </h2>
                    {experience.map(exp => (
                        <div key={exp.id} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{exp.title || 'Job Title'}</strong>
                                <span style={{ color: '#555' }}>
                                    {exp.startDate} {exp.startDate && '—'} {exp.current ? 'Present' : exp.endDate}
                                </span>
                            </div>
                            <div style={{ color: '#555' }}>{exp.company}</div>
                            {exp.description && <p style={{ marginTop: '5px' }}>{exp.description}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {education.some(edu => edu.school || edu.degree) && (
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '4px', fontSize: '16px', textTransform: 'uppercase' }}>
                        Education
                    </h2>
                    {education.map(edu => (
                        <div key={edu.id} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{edu.school || 'School Name'}</strong>
                                <span style={{ color: '#555' }}>
                                    {edu.startDate} {edu.startDate && '—'} {edu.endDate}
                                </span>
                            </div>
                            <div style={{ color: '#555' }}>
                                {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {skills.some(skill => skill) && (
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '4px', fontSize: '16px', textTransform: 'uppercase' }}>
                        Skills
                    </h2>
                    <p>{skills.filter(Boolean).join(' • ')}</p>
                </div>
            )}
        </div>
    )
}

export default ResumePreview