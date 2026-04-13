import { useState, useEffect, useRef } from 'react'

/**
 * Classic single-column resume template with a centred header, a thick
 * accent-coloured underline beneath the name, and uppercase section headers.
 *
 * The contact line is auto-shrunk when it overflows the available width so
 * it always fits on one line. Experience entries are split into separate
 * "Work Experience" and "Projects" sections based on their `type` field.
 * Skills support `horizontal`, `vertical`, and `columns` display modes.
 *
 * @param {object}  props
 * @param {object}  props.resumeData      - Full resume data (personalInfo, summary,
 *                                          experience, education, skills, etc.).
 * @param {string}  [props.accentColor='#1a1a1a'] - CSS colour used for section
 *                                          headers and decorative borders.
 * @param {string}  [props.font='Georgia, serif'] - CSS font-family for the document.
 * @param {object}  props.fontSizes        - Object with keys `base`, `title`, `name`,
 *                                          `small`, `label` mapping to CSS sizes.
 * @param {string}  props.padding          - CSS shorthand padding for the page.
 * @param {string}  props.sectionSpacing   - CSS margin-bottom between resume sections.
 * @returns {JSX.Element} A white, print-ready resume document.
 */
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

    // ─── Experience split ─────────────────────────────────────────────────────
    const workEntries = experience.filter(e => (e.type || 'work') === 'work' && (e.company || e.title))
    const projectEntries = experience.filter(e => e.type === 'project' && (e.company || e.title))

    /**
     * Renders a single work or project experience entry with title, company,
     * date range, optional description, and bullet points.
     *
     * @param {object} exp - An experience object from `resumeData.experience`.
     * @returns {JSX.Element} A styled entry block.
     */
    const renderExperienceEntry = (exp) => (
        <div key={exp.id} style={{marginBottom: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px'}}>
                <strong style={{fontSize: fs.name, color: '#1a1a1a'}}>{exp.title}</strong>
                <span style={{fontSize: fs.small, color: '#777', whiteSpace: 'nowrap', marginLeft: '16px'}}>
                    {exp.startDate}{exp.startDate && ' — '}{exp.current ? 'Present' : exp.endDate}
                </span>
            </div>
            <div style={{fontSize: fs.base, color: '#555', fontStyle: 'italic', marginBottom: '4px'}}>
                {exp.company}
                {exp.url && (
                    <span style={{fontStyle: 'normal', color: accentColor === '#1a1a1a' ? '#555' : accentColor}}>
                        {' '}&nbsp;|&nbsp; {exp.url}
                    </span>
                )}
            </div>
            {exp.description && (
                <p style={{fontSize: fs.base, lineHeight: '1.6', color: '#333', margin: '0 0 6px 0'}}>
                    {exp.description}
                </p>
            )}
            {exp.bullets && exp.bullets.some(b => b.trim()) && (
                <div style={{margin: 0}}>
                    {exp.bullets.filter(b => b.trim()).map((bullet, i) => (
                        <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '3px', fontSize: fs.base, lineHeight: '1.6', color: '#333'}}>
                            <span style={{flexShrink: 0, marginTop: '1px'}}>{exp.bulletStyle || '•'}</span>
                            <span>{bullet}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    // ─── Skills renderer ─────────────────────────────────────────────────────
    const isLegacySkills = Array.isArray(skills)
    const skillsData = isLegacySkills
        ? {displayMode: 'horizontal', bulletStyle: '•', separator: ',', columns: 2, categories: [{id: 1, name: '', items: skills}]}
        : skills

    const hasSkills = isLegacySkills
        ? skills.some(Boolean)
        : skillsData.categories.some(c => c.items.some(Boolean))

    /**
     * Renders the skills section according to the current display mode:
     * - `horizontal` — comma/bullet/pipe-separated inline list per category.
     * - `vertical`   — bulleted list per category.
     * - `columns`    — CSS grid with configurable column count.
     *
     * @returns {JSX.Element} The rendered skills block.
     */
    const renderSkills = () => {
        const {displayMode, bulletStyle, separator, columns, categories} = skillsData
        const sep = separator === ',' ? ', ' : separator === '|' ? '  |  ' : '  •  '
        const colCount = columns || 2

        if (displayMode === 'horizontal') {
            return (
                <div>
                    {categories.filter(c => c.items.some(Boolean)).map(cat => (
                        <p key={cat.id} style={{fontSize: fs.base, color: '#374151', margin: '0 0 4px 0', lineHeight: '1.7'}}>
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
                                <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.base, color: '#374151'}}>
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
                                <div key={i} style={{display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.base, color: '#374151'}}>
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
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                textAlign: 'center', marginBottom: '28px', paddingBottom: '20px',
                borderBottom: `3px solid ${accentColor}`, width: '100%', overflow: 'hidden',
            }}>
                <h1 style={{margin: '0 0 8px 0', fontSize: fs.title, fontWeight: '700', letterSpacing: '0.02em', color: '#1a1a1a', fontFamily: font}}>
                    {personalInfo.firstName || 'Your'} {personalInfo.lastName || 'Name'}
                </h1>
                <p ref={contactRef} style={{
                    fontSize: (contactFontSize || baseSize) + 'px', color: '#555', margin: 0,
                    textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden',
                    width: '100%', boxSizing: 'border-box',
                }}>
                    {contactText}
                </p>
            </div>

            {/* Summary */}
            {summary && (
                <div style={{marginBottom: sectionSpacing || '24px'}}>
                    <h2 style={sectionHeader}>Professional Summary</h2>
                    <p style={{fontSize: fs.base, lineHeight: '1.7', color: '#333', margin: 0}}>{summary}</p>
                </div>
            )}

            {/* Work Experience */}
            {workEntries.length > 0 && (
                <div style={{marginBottom: sectionSpacing || '24px'}}>
                    <h2 style={sectionHeader}>Work Experience</h2>
                    {workEntries.map(renderExperienceEntry)}
                </div>
            )}

            {/* Projects */}
            {projectEntries.length > 0 && (
                <div style={{marginBottom: sectionSpacing || '24px'}}>
                    <h2 style={sectionHeader}>Projects</h2>
                    {projectEntries.map(renderExperienceEntry)}
                </div>
            )}

            {/* Education */}
            {education.some(edu => edu.school || edu.degree) && (
                <div style={{marginBottom: sectionSpacing || '24px'}}>
                    <h2 style={sectionHeader}>Education</h2>
                    {education.filter(edu => edu.school || edu.degree).map(edu => (
                        <div key={edu.id} style={{marginBottom: '14px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px'}}>
                                <strong style={{fontSize: fs.name, color: '#1a1a1a'}}>{edu.school}</strong>
                                <span style={{fontSize: fs.small, color: '#777', whiteSpace: 'nowrap', marginLeft: '16px'}}>
                                    {edu.startDate}{edu.startDate && ' — '}{edu.endDate}
                                </span>
                            </div>
                            <div style={{fontSize: fs.base, color: '#555', fontStyle: 'italic', marginBottom: '3px'}}>
                                {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                                {edu.gpa && <span style={{fontStyle: 'normal', color: '#555'}}> &nbsp;|&nbsp; GPA: {edu.gpa}</span>}
                            </div>
                            {edu.accomplishmentBullets && edu.accomplishmentBullets.some(b => b.trim()) && (
                                <div style={{margin: 0}}>
                                    {edu.accomplishmentBullets.filter(b => b.trim()).map((bullet, i) => (
                                        <div key={i} style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '2px', fontSize: fs.small, lineHeight: '1.6', color: '#555'}}>
                                            <span style={{flexShrink: 0, marginTop: '1px'}}>{edu.accomplishmentBulletStyle || '•'}</span>
                                            <span>{bullet}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {edu.accomplishments && !edu.accomplishmentBullets && (
                                <p style={{fontSize: fs.small, color: '#555', lineHeight: '1.6', margin: 0}}>{edu.accomplishments}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {hasSkills && (
                <div>
                    <h2 style={sectionHeader}>Skills</h2>
                    {renderSkills()}
                </div>
            )}
        </div>
    )
}

export default ClassicTemplate