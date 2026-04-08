const ModernTemplate = ({ resumeData, accentColor = '#4f46e5', font = 'Arial, sans-serif', fontSizes, padding, sectionSpacing }) => {
    const { personalInfo, summary, experience, education, skills } = resumeData

    const fs = {
        base: fontSizes?.base || '13px',
        title: fontSizes?.title || '22px',
        name: fontSizes?.name || '15px',
        small: fontSizes?.small || '12px',
        label: fontSizes?.label || '10px',
    }

    const filteredEducation = education.filter(e => e.school || e.degree)

    // ─── Experience split ─────────────────────────────────────────────────────
    const workEntries = experience.filter(e => (e.type || 'work') === 'work' && (e.company || e.title))
    const projectEntries = experience.filter(e => e.type === 'project' && (e.company || e.title))

    // ─── Skills renderer ─────────────────────────────────────────────────────
    const isLegacySkills = Array.isArray(skills)
    const skillsData = isLegacySkills
        ? {displayMode: 'horizontal', bulletStyle: '•', separator: ',', columns: 2, categories: [{id: 1, name: '', items: skills}]}
        : skills

    const hasSkills = isLegacySkills
        ? skills.some(Boolean)
        : skillsData.categories.some(c => c.items.some(Boolean))

    const renderSkills = () => {
        const {displayMode, bulletStyle, separator, categories} = skillsData
        const sep = separator === ',' ? ', ' : separator === '|' ? '  |  ' : '  •  '
        const effectiveMode = displayMode === 'columns' ? 'vertical' : displayMode

        if (effectiveMode === 'horizontal') {
            return (
                <div>
                    {categories.filter(c => c.items.some(Boolean)).map(cat => (
                        <p key={cat.id} style={{fontSize: fs.small, color: 'rgba(255,255,255,0.9)', margin: '0 0 6px 0', lineHeight: '1.7'}}>
                            {cat.name && <strong style={{color: 'white'}}>{cat.name}: </strong>}
                            {cat.items.filter(Boolean).join(sep)}
                        </p>
                    ))}
                </div>
            )
        }

        return (
            <div>
                {categories.filter(c => c.items.some(Boolean)).map(cat => (
                    <div key={cat.id} style={{marginBottom: '10px'}}>
                        {cat.name && (
                            <p style={{fontSize: fs.small, fontWeight: '700', color: 'white', margin: '0 0 4px 0'}}>
                                {cat.name}
                            </p>
                        )}
                        {cat.items.filter(Boolean).map((item, i) => (
                            <div key={i} style={{display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.small, color: 'rgba(255,255,255,0.9)'}}>
                                <span style={{flexShrink: 0}}>{bulletStyle || '•'}</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    // ─── Shared entry renderer ────────────────────────────────────────────────
    const renderEntry = (exp, idx, arr) => {
        const isLast = idx === arr.length - 1
        return (
            <div key={exp.id} style={{marginBottom: isLast ? '0' : '16px', paddingLeft: '12px', borderLeft: `3px solid ${accentColor}`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px'}}>
                    <strong style={{fontSize: fs.name, color: '#1a1a1a'}}>{exp.title}</strong>
                    <span style={{fontSize: fs.small, color: '#888', whiteSpace: 'nowrap', marginLeft: '12px'}}>
                        {exp.startDate}{exp.startDate && ' — '}{exp.current ? 'Present' : exp.endDate}
                    </span>
                </div>
                <div style={{fontSize: fs.small, color: accentColor, fontWeight: '600', marginBottom: '4px'}}>
                    {exp.company}
                    {exp.url && (
                        <span style={{fontWeight: '400', color: '#888'}}> &nbsp;|&nbsp; {exp.url}</span>
                    )}
                </div>
                {exp.description && (
                    <p style={{fontSize: fs.base, lineHeight: '1.6', color: '#555', margin: '0 0 6px 0'}}>
                        {exp.description}
                    </p>
                )}
                {exp.bullets && exp.bullets.some(b => b.trim()) && (
                    <div style={{margin: 0}}>
                        {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                            <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '3px', fontSize: fs.base, lineHeight: '1.6', color: '#555'}}>
                                <span style={{flexShrink: 0, marginTop: '1px'}}>{exp.bulletStyle || '•'}</span>
                                <span>{bullet}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const sectionTitle = (text) => (
        <h2 style={{fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: '12px', fontFamily: 'Arial, sans-serif'}}>
            {text}
        </h2>
    )

    return (
        <div style={{
            fontFamily: font,
            background: `linear-gradient(to right, ${accentColor} 35%, white 35%)`,
            width: '100%',
            maxWidth: '700px',
            margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            borderRadius: '4px',
            minHeight: '1122px',
            display: 'flex',
            alignItems: 'stretch',
            fontSize: fs.base,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
        }}>
            {/* LEFT SIDEBAR */}
            <div style={{width: '35%', padding: '40px 24px', color: 'white', flexShrink: 0}}>

                {/* Name */}
                <div style={{marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                    <h1 style={{fontSize: fs.title, fontWeight: '700', color: 'white', margin: '0 0 4px 0', lineHeight: '1.3'}}>
                        {personalInfo.firstName || 'Your'}{' '}{personalInfo.lastName || 'Name'}
                    </h1>
                </div>

                {/* Contact */}
                <div style={{marginBottom: '28px'}}>
                    <p style={{fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', marginBottom: '10px'}}>
                        Contact
                    </p>
                    {personalInfo.email && (
                        <p style={{fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px', wordBreak: 'break-all'}}>
                            {personalInfo.email}
                        </p>
                    )}
                    {personalInfo.phone && (
                        <p style={{fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px'}}>
                            {personalInfo.phone}
                        </p>
                    )}
                    {personalInfo.location && (
                        <p style={{fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px'}}>
                            {personalInfo.location}
                        </p>
                    )}
                    {personalInfo.linkedin && (
                        <p style={{fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px', wordBreak: 'break-all'}}>
                            {personalInfo.linkedin}
                        </p>
                    )}
                    {personalInfo.github && (
                        <p style={{fontSize: fs.small, color: 'rgba(255,255,255,0.9)', marginBottom: '6px', wordBreak: 'break-all'}}>
                            {personalInfo.github}
                        </p>
                    )}
                </div>

                {/* Skills */}
                {hasSkills && (
                    <div>
                        <p style={{fontSize: fs.label, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', marginBottom: '10px'}}>
                            Skills
                        </p>
                        {renderSkills()}
                    </div>
                )}
            </div>

            {/* RIGHT CONTENT */}
            <div style={{flex: 1, padding: padding || '40px 32px'}}>

                {/* Summary */}
                {summary && (
                    <div style={{marginBottom: sectionSpacing || '24px'}}>
                        {sectionTitle('About Me')}
                        <p style={{fontSize: fs.base, lineHeight: '1.7', color: '#444', margin: 0}}>{summary}</p>
                    </div>
                )}

                {/* Work Experience */}
                {workEntries.length > 0 && (
                    <div style={{marginBottom: sectionSpacing || '24px'}}>
                        {sectionTitle('Experience')}
                        {workEntries.map((exp, idx) => renderEntry(exp, idx, workEntries))}
                    </div>
                )}

                {/* Projects */}
                {projectEntries.length > 0 && (
                    <div style={{marginBottom: sectionSpacing || '24px'}}>
                        {sectionTitle('Projects')}
                        {projectEntries.map((exp, idx) => renderEntry(exp, idx, projectEntries))}
                    </div>
                )}

                {/* Education */}
                {filteredEducation.length > 0 && (
                    <div style={{marginBottom: sectionSpacing || '24px'}}>
                        {sectionTitle('Education')}
                        {filteredEducation.map((edu, idx) => {
                            const isLast = idx === filteredEducation.length - 1
                            return (
                                <div key={edu.id} style={{marginBottom: isLast ? '0' : '14px', paddingLeft: '12px', borderLeft: `3px solid ${accentColor}`}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px'}}>
                                        <strong style={{fontSize: fs.name, color: '#1a1a1a'}}>{edu.school}</strong>
                                        <span style={{fontSize: fs.small, color: '#888', whiteSpace: 'nowrap', marginLeft: '12px'}}>
                                            {edu.startDate}{edu.startDate && ' — '}{edu.endDate}
                                        </span>
                                    </div>
                                    <div style={{fontSize: fs.base, color: '#666', marginBottom: '3px'}}>
                                        {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                                        {edu.gpa && <span style={{color: '#777'}}> &nbsp;|&nbsp; GPA: {edu.gpa}</span>}
                                    </div>
                                    {edu.accomplishmentBullets && edu.accomplishmentBullets.some(b => b.trim()) && (
                                        <div style={{margin: 0}}>
                                            {edu.accomplishmentBullets.filter(b => b.trim()).map((bullet, i) => (
                                                <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.small, lineHeight: '1.6', color: '#777'}}>
                                                    <span style={{flexShrink: 0, marginTop: '1px'}}>{edu.accomplishmentBulletStyle || '•'}</span>
                                                    <span>{bullet}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {edu.accomplishments && !edu.accomplishmentBullets && (
                                        <p style={{fontSize: fs.small, color: '#777', lineHeight: '1.6', margin: 0}}>{edu.accomplishments}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModernTemplate