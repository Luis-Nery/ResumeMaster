import {useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import api from '../services/api'
import ResumePreview from '../components/ResumePreview'
import DesignPanel from '../components/DesignPanel'
import AiPanel from '../components/AiPanel'

const inputStyle = {
    backgroundColor: '#0d0d14',
    border: '1px solid #2a2a3a',
    color: '#f0f0ff',
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
}

const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#8b8ba7',
    marginBottom: '6px',
}

const addButtonStyle = {
    backgroundColor: '#7c3aed22',
    border: '1px solid #7c3aed44',
    color: '#a78bfa',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '12px',
}

const removeButtonStyle = {
    backgroundColor: '#ef444411',
    border: '1px solid #ef444433',
    color: '#ef4444',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    marginTop: '8px',
}

const steps = [
    {id: 1, title: 'Title'},
    {id: 2, title: 'Personal'},
    {id: 3, title: 'Summary'},
    {id: 4, title: 'Experience'},
    {id: 5, title: 'Education'},
    {id: 6, title: 'Skills'},
    {id: 7, title: 'Review'},
]

const emptyResumeData = {
    template: 'classic',
    accentColor: '#1a1a1a',
    font: 'Georgia, serif',
    fontSize: 'medium',
    padding: 'normal',
    title: '',
    sectionSpacing: 'normal',
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: ''
    },
    summary: '',
    experience: [{
        id: 1,
        company: '',
        title: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        bullets: [''],
        bulletStyle: '•'
    }],
    education: [{
        id: 1,
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        accomplishmentBullets: [''],
        accomplishmentBulletStyle: '•'
    }],
    skills: {
        displayMode: 'horizontal',
        bulletStyle: '•',
        separator: ',',
        columns: 2,
        categories: [
            {id: 1, name: '', items: ['']}
        ]
    }
}

const ResumeFormPage = () => {
    const {id} = useParams()
    const {userId} = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(!!id)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [currentStep, setCurrentStep] = useState(1)
    const [visitedSteps, setVisitedSteps] = useState(new Set([1]))
    const [resumeId, setResumeId] = useState(id || null)
    const [resumeData, setResumeData] = useState(emptyResumeData)
    const [mode, setMode] = useState('write')
    const localKey = `resume_draft_${id || 'new'}`
    const saveTimeout = useRef(null)
    const previewRef = useRef(null)

    useEffect(() => {
        if (id) {
            fetchResume()
        } else {
            const draft = localStorage.getItem(localKey)
            if (draft) {
                try {
                    const parsed = JSON.parse(draft)
                    setResumeData(parsed.resumeData || emptyResumeData)
                    setCurrentStep(parsed.currentStep || 1)
                    setVisitedSteps(new Set(parsed.visitedSteps || [1]))
                } catch (e) {}
            }
        }
    }, [id])

    useEffect(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => {
            localStorage.setItem(localKey, JSON.stringify({
                resumeData,
                currentStep,
                visitedSteps: [...visitedSteps]
            }))
        }, 500)
        return () => clearTimeout(saveTimeout.current)
    }, [resumeData, currentStep])

    const fetchResume = async () => {
        try {
            const response = await api.get(`/resumes/${id}`)
            const parsed = JSON.parse(response.data.content)
            const draft = localStorage.getItem(`resume_draft_${id}`)
            if (draft) {
                try {
                    const localDraft = JSON.parse(draft)
                    setResumeData(localDraft.resumeData || parsed)
                    setCurrentStep(localDraft.currentStep || response.data.currentStep || 1)
                    setVisitedSteps(new Set(localDraft.visitedSteps || [1, 2, 3, 4, 5, 6, 7]))
                } catch (e) {
                    setResumeData(parsed)
                    setCurrentStep(response.data.currentStep || 1)
                    setVisitedSteps(new Set([1, 2, 3, 4, 5, 6, 7]))
                }
            } else {
                setResumeData(parsed)
                setCurrentStep(response.data.currentStep || 1)
                setVisitedSteps(new Set([1, 2, 3, 4, 5, 6, 7]))
            }
        } catch (err) {
            setError('Failed to load resume')
        } finally {
            setLoading(false)
        }
    }

    const saveCheckpoint = async (nextStep, isComplete = false) => {
        setSaving(true)
        try {
            if (!resumeId) {
                const response = await api.post('/resumes', {
                    title: resumeData.title || 'Untitled Resume',
                    content: JSON.stringify(resumeData),
                    userId: userId,
                    isComplete: false,
                    currentStep: nextStep
                })
                const newId = response.data.id
                setResumeId(newId)
                localStorage.removeItem('resume_draft_new')
                localStorage.setItem(`resume_draft_${newId}`, JSON.stringify({
                    resumeData,
                    currentStep: nextStep,
                    visitedSteps: [...visitedSteps]
                }))
                window.history.replaceState(null, '', `/resume/${newId}`)
            } else {
                await api.put(`/resumes/${resumeId}`, {
                    title: resumeData.title || 'Untitled Resume',
                    content: JSON.stringify(resumeData),
                    isComplete,
                    currentStep: nextStep
                })
            }
        } catch (err) {
            setError('Failed to save checkpoint')
        } finally {
            setSaving(false)
        }
    }

    const handleNext = async () => {
        await saveCheckpoint(currentStep + 1)
        const next = currentStep + 1
        setVisitedSteps(prev => new Set([...prev, next]))
        setCurrentStep(next)
    }

    const handleStepClick = (stepId) => {
        if (!isStepClickable(stepId)) return
        setCurrentStep(stepId)
    }

    const isStepClickable = (stepId) => {
        if (stepId === currentStep) return true
        if (visitedSteps.has(stepId)) return true
        if (stepId === currentStep + 1) return true
        return false
    }

    const handleSave = async () => {
        await saveCheckpoint(7, true)
        localStorage.removeItem(localKey)
        localStorage.removeItem(`resume_draft_${resumeId}`)
        navigate('/dashboard')
    }

    const handleDownload = async () => {
        const element = document.getElementById('resume-preview').firstElementChild
        if (!element) return
        const html2pdf = (await import('html2pdf.js')).default
        const filename = `${resumeData.title || 'resume'}.pdf`
        const clone = element.cloneNode(true)
        clone.style.width = '794px'
        clone.style.maxWidth = '794px'
        clone.style.margin = '0'
        clone.style.boxShadow = 'none'
        clone.style.borderRadius = '0'
        document.body.appendChild(clone)
        const options = {
            margin: 0,
            filename,
            image: {type: 'jpeg', quality: 1.0},
            html2canvas: {scale: 2, useCORS: true, letterRendering: true, scrollX: 0, scrollY: 0, width: 794},
            jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait'}
        }
        html2pdf().set(options).from(clone).save().then(() => document.body.removeChild(clone))
    }

    const focusInput = (e) => e.target.style.borderColor = '#7c3aed'
    const blurInput = (e) => e.target.style.borderColor = '#2a2a3a'

    const updatePersonalInfo = (field, value) => {
        setResumeData(prev => ({...prev, personalInfo: {...prev.personalInfo, [field]: value}}))
    }

    const updateExperience = (expId, field, value) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === expId ? {...exp, [field]: value} : exp)
        }))
    }

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                id: Date.now(), company: '', title: '', startDate: '', endDate: '',
                current: false, description: '', bullets: [''], bulletStyle: '•'
            }]
        }))
    }

    const removeExperience = (expId) => {
        setResumeData(prev => ({...prev, experience: prev.experience.filter(exp => exp.id !== expId)}))
    }

    const addBullet = (expId) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? {...exp, bullets: [...(exp.bullets || ['']), '']} : exp
            )
        }))
    }

    const removeBullet = (expId, index) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? {...exp, bullets: (exp.bullets || ['']).filter((_, i) => i !== index)} : exp
            )
        }))
    }

    const updateBullet = (expId, index, value) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? {...exp, bullets: (exp.bullets || ['']).map((b, i) => i === index ? value : b)} : exp
            )
        }))
    }

    const updateEducation = (eduId, field, value) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === eduId ? {...edu, [field]: value} : edu)
        }))
    }

    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, {
                id: Date.now(), school: '', degree: '', field: '',
                startDate: '', endDate: '', gpa: '',
                accomplishmentBullets: [''], accomplishmentBulletStyle: '•'
            }]
        }))
    }

    const removeEducation = (eduId) => {
        setResumeData(prev => ({...prev, education: prev.education.filter(edu => edu.id !== eduId)}))
    }

    const addAccomplishment = (eduId) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === eduId ? {...edu, accomplishmentBullets: [...(edu.accomplishmentBullets || ['']), '']} : edu
            )
        }))
    }

    const removeAccomplishment = (eduId, index) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === eduId ? {
                    ...edu,
                    accomplishmentBullets: (edu.accomplishmentBullets || ['']).filter((_, i) => i !== index)
                } : edu
            )
        }))
    }

    const updateAccomplishment = (eduId, index, value) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === eduId ? {
                    ...edu,
                    accomplishmentBullets: (edu.accomplishmentBullets || ['']).map((b, i) => i === index ? value : b)
                } : edu
            )
        }))
    }

    // ─── Skills helpers ───────────────────────────────────────────────────────

    const getSkills = () => {
        if (Array.isArray(resumeData.skills)) {
            return {
                displayMode: 'horizontal',
                bulletStyle: '•',
                separator: ',',
                columns: 2,
                categories: [{id: 1, name: '', items: resumeData.skills}]
            }
        }
        return resumeData.skills
    }

    const updateSkillsMeta = (field, value) => {
        setResumeData(prev => ({...prev, skills: {...getSkills(), [field]: value}}))
    }

    const addCategory = () => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {...s, categories: [...s.categories, {id: Date.now(), name: '', items: ['']}]}
        }))
    }

    const removeCategory = (catId) => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {...s, categories: s.categories.filter(c => c.id !== catId)}
        }))
    }

    const updateCategoryName = (catId, value) => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {...s, categories: s.categories.map(c => c.id === catId ? {...c, name: value} : c)}
        }))
    }

    const addCategoryItem = (catId) => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {
                ...s,
                categories: s.categories.map(c => c.id === catId ? {...c, items: [...c.items, '']} : c)
            }
        }))
    }

    const removeCategoryItem = (catId, index) => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {
                ...s,
                categories: s.categories.map(c =>
                    c.id === catId ? {...c, items: c.items.filter((_, i) => i !== index)} : c
                )
            }
        }))
    }

    const updateCategoryItem = (catId, index, value) => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {
                ...s,
                categories: s.categories.map(c =>
                    c.id === catId ? {...c, items: c.items.map((item, i) => i === index ? value : item)} : c
                )
            }
        }))
    }

    const renderStep = () => {
        const skills = getSkills()

        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            {id ? 'Edit Resume' : "Let's start with a title"}
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            Give your resume a name so you can find it easily later.
                        </p>
                        <label style={labelStyle}>Resume Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Software Engineer Resume"
                            value={resumeData.title}
                            onChange={(e) => setResumeData(prev => ({...prev, title: e.target.value}))}
                            style={inputStyle}
                            onFocus={focusInput}
                            onBlur={blurInput}
                            autoFocus
                        />
                    </div>
                )

            case 2:
                return (
                    <div>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Personal Information
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            This appears at the top of your resume.
                        </p>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                            <div>
                                <label style={labelStyle}>First Name</label>
                                <input type="text" placeholder="John" value={resumeData.personalInfo.firstName}
                                       onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div>
                                <label style={labelStyle}>Last Name</label>
                                <input type="text" placeholder="Doe" value={resumeData.personalInfo.lastName}
                                       onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input type="email" placeholder="you@example.com" value={resumeData.personalInfo.email}
                                       onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input type="text" placeholder="+1 (555) 000-0000" value={resumeData.personalInfo.phone}
                                       onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div>
                                <label style={labelStyle}>Location</label>
                                <input type="text" placeholder="City, State" value={resumeData.personalInfo.location}
                                       onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div>
                                <label style={labelStyle}>LinkedIn</label>
                                <input type="text" placeholder="linkedin.com/in/you" value={resumeData.personalInfo.linkedin}
                                       onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div>
                                <label style={labelStyle}>GitHub</label>
                                <input type="text" placeholder="github.com/yourusername" value={resumeData.personalInfo.github || ''}
                                       onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Professional Summary
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            A short paragraph that highlights who you are and what you bring to the table.
                        </p>
                        <label style={labelStyle}>Summary</label>
                        <textarea
                            placeholder="e.g. Results-driven software engineer with 3+ years of experience..."
                            value={resumeData.summary}
                            onChange={(e) => setResumeData(prev => ({...prev, summary: e.target.value}))}
                            rows={8}
                            style={{...inputStyle, resize: 'vertical', lineHeight: '1.7'}}
                            onFocus={focusInput} onBlur={blurInput}
                        />
                        <p style={{fontSize: '12px', color: '#8b8ba7', marginTop: '8px'}}>
                            {resumeData.summary.length} characters
                        </p>
                    </div>
                )

            case 4:
                return (
                    <div>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Work Experience
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            Add your most recent experience first.
                        </p>
                        {resumeData.experience.map((exp, idx) => (
                            <div key={exp.id} style={{
                                padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3a',
                                marginBottom: '16px', backgroundColor: '#0d0d14'
                            }}>
                                <p style={{fontSize: '12px', color: '#8b8ba7', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                                    Position {idx + 1}
                                </p>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'}}>
                                    <div>
                                        <label style={labelStyle}>Company</label>
                                        <input type="text" placeholder="Google" value={exp.company}
                                               onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Job Title</label>
                                        <input type="text" placeholder="Software Engineer" value={exp.title}
                                               onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Start Date</label>
                                        <input type="text" placeholder="Jan 2022" value={exp.startDate}
                                               onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>End Date</label>
                                        <input type="text" placeholder="Present" value={exp.endDate} disabled={exp.current}
                                               onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                               style={{...inputStyle, opacity: exp.current ? 0.4 : 1}}
                                               onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                </div>
                                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8b8ba7', marginBottom: '12px', cursor: 'pointer'}}>
                                    <input type="checkbox" checked={exp.current}
                                           onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}/>
                                    Currently working here
                                </label>
                                <div style={{marginBottom: '16px'}}>
                                    <label style={labelStyle}>Description (optional)</label>
                                    <textarea
                                        placeholder="Brief overview of your role..."
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                        rows={2}
                                        style={{...inputStyle, resize: 'vertical', lineHeight: '1.6'}}
                                        onFocus={focusInput} onBlur={blurInput}/>
                                </div>
                                <div style={{marginBottom: '16px'}}>
                                    <label style={labelStyle}>Bullet Style</label>
                                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                        {['•', '▪', '–', '→', '✓', '★'].map(style => (
                                            <button key={style}
                                                    onClick={() => updateExperience(exp.id, 'bulletStyle', style)}
                                                    style={{
                                                        padding: '6px 14px', borderRadius: '6px', border: '1px solid',
                                                        borderColor: (exp.bulletStyle || '•') === style ? '#7c3aed' : '#2a2a3a',
                                                        backgroundColor: (exp.bulletStyle || '•') === style ? '#7c3aed22' : 'transparent',
                                                        color: (exp.bulletStyle || '•') === style ? '#a78bfa' : '#8b8ba7',
                                                        fontSize: '14px', cursor: 'pointer',
                                                    }}>
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Bullet Points</label>
                                    {(exp.bullets || ['']).map((bullet, bulletIdx) => (
                                        <div key={bulletIdx} style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px'}}>
                                            <span style={{color: '#8b8ba7', fontSize: '14px', flexShrink: 0}}>{exp.bulletStyle || '•'}</span>
                                            <input type="text" placeholder="e.g. Reduced API response time by 40%"
                                                   value={bullet}
                                                   onChange={(e) => updateBullet(exp.id, bulletIdx, e.target.value)}
                                                   style={{...inputStyle, flex: 1}}
                                                   onFocus={focusInput} onBlur={blurInput}/>
                                            {(exp.bullets || ['']).length > 1 && (
                                                <button onClick={() => removeBullet(exp.id, bulletIdx)}
                                                        style={{backgroundColor: '#ef444411', border: '1px solid #ef444433', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', flexShrink: 0}}>
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addBullet(exp.id)} style={{...addButtonStyle, marginTop: '4px'}}>
                                        + Add Bullet
                                    </button>
                                </div>
                                {resumeData.experience.length > 1 && (
                                    <button onClick={() => removeExperience(exp.id)} style={{...removeButtonStyle, marginTop: '16px'}}>
                                        Remove Position
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addExperience} style={addButtonStyle}>+ Add Another Position</button>
                    </div>
                )

            case 5:
                return (
                    <div>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Education
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            Add your educational background.
                        </p>
                        {resumeData.education.map((edu, idx) => (
                            <div key={edu.id} style={{
                                padding: '20px', borderRadius: '12px', border: '1px solid #2a2a3a',
                                marginBottom: '16px', backgroundColor: '#0d0d14'
                            }}>
                                <p style={{fontSize: '12px', color: '#8b8ba7', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                                    School {idx + 1}
                                </p>

                                {/* Row 1: School + Degree */}
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'}}>
                                    <div>
                                        <label style={labelStyle}>School</label>
                                        <input type="text" placeholder="MIT" value={edu.school}
                                               onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Degree</label>
                                        <input type="text" placeholder="Bachelor of Science" value={edu.degree}
                                               onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                </div>

                                {/* Row 2: Field + GPA + Start + End all in one row */}
                                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px'}}>
                                    <div>
                                        <label style={labelStyle}>Field of Study</label>
                                        <input type="text" placeholder="Computer Science" value={edu.field}
                                               onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>GPA</label>
                                        <input type="text" placeholder="3.8" value={edu.gpa || ''}
                                               onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Start</label>
                                        <input type="text" placeholder="2020" value={edu.startDate}
                                               onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>End</label>
                                        <input type="text" placeholder="2024" value={edu.endDate}
                                               onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                </div>

                                {/* Accomplishment Bullet Style */}
                                <div style={{marginBottom: '12px'}}>
                                    <label style={labelStyle}>Accomplishment Bullet Style</label>
                                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                        {['•', '▪', '–', '→', '✓', '★'].map(style => (
                                            <button key={style}
                                                    onClick={() => updateEducation(edu.id, 'accomplishmentBulletStyle', style)}
                                                    style={{
                                                        padding: '6px 14px', borderRadius: '6px', border: '1px solid',
                                                        borderColor: (edu.accomplishmentBulletStyle || '•') === style ? '#7c3aed' : '#2a2a3a',
                                                        backgroundColor: (edu.accomplishmentBulletStyle || '•') === style ? '#7c3aed22' : 'transparent',
                                                        color: (edu.accomplishmentBulletStyle || '•') === style ? '#a78bfa' : '#8b8ba7',
                                                        fontSize: '14px', cursor: 'pointer',
                                                    }}>
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Accomplishment Bullets */}
                                <div>
                                    <label style={labelStyle}>Academic Accomplishments (optional)</label>
                                    {(edu.accomplishmentBullets || ['']).map((bullet, bulletIdx) => (
                                        <div key={bulletIdx} style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px'}}>
                                            <span style={{color: '#8b8ba7', fontSize: '14px', flexShrink: 0}}>{edu.accomplishmentBulletStyle || '•'}</span>
                                            <input type="text"
                                                   placeholder="e.g. Dean's List, Magna Cum Laude..."
                                                   value={bullet}
                                                   onChange={(e) => updateAccomplishment(edu.id, bulletIdx, e.target.value)}
                                                   style={{...inputStyle, flex: 1}}
                                                   onFocus={focusInput} onBlur={blurInput}/>
                                            {(edu.accomplishmentBullets || ['']).length > 1 && (
                                                <button onClick={() => removeAccomplishment(edu.id, bulletIdx)}
                                                        style={{backgroundColor: '#ef444411', border: '1px solid #ef444433', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', flexShrink: 0}}>
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => addAccomplishment(edu.id)} style={{...addButtonStyle, marginTop: '4px'}}>
                                        + Add Accomplishment
                                    </button>
                                </div>

                                {resumeData.education.length > 1 && (
                                    <button onClick={() => removeEducation(edu.id)} style={{...removeButtonStyle, marginTop: '16px'}}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addEducation} style={addButtonStyle}>+ Add Another School</button>
                    </div>
                )

            case 6:
                return (
                    <div>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Skills
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '24px'}}>
                            Organize your skills by category.
                        </p>

                        {/* Display Mode */}
                        <div style={{marginBottom: '20px'}}>
                            <label style={labelStyle}>Display Mode</label>
                            <div style={{display: 'flex', gap: '8px'}}>
                                {[
                                    {id: 'horizontal', label: 'Horizontal', desc: 'Languages: Java, Python'},
                                    {id: 'vertical', label: 'Vertical', desc: 'Bulleted list per category'},
                                    {id: 'columns', label: 'Columns', desc: 'Multi-column layout'},
                                ].map(m => (
                                    <button key={m.id}
                                            onClick={() => updateSkillsMeta('displayMode', m.id)}
                                            style={{
                                                flex: 1, padding: '10px 8px', borderRadius: '8px', border: '1px solid',
                                                borderColor: skills.displayMode === m.id ? '#7c3aed' : '#2a2a3a',
                                                backgroundColor: skills.displayMode === m.id ? '#7c3aed22' : 'transparent',
                                                color: skills.displayMode === m.id ? '#a78bfa' : '#8b8ba7',
                                                cursor: 'pointer', textAlign: 'center',
                                            }}>
                                        <div style={{fontSize: '13px', fontWeight: '600'}}>{m.label}</div>
                                        <div style={{fontSize: '11px', marginTop: '2px', opacity: 0.7}}>{m.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column Count — only for columns mode */}
                        {skills.displayMode === 'columns' && (
                            <div style={{marginBottom: '20px'}}>
                                <label style={labelStyle}>Number of Columns</label>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    {[2, 3, 4].map(n => (
                                        <button key={n}
                                                onClick={() => updateSkillsMeta('columns', n)}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                                                    borderColor: (skills.columns || 2) === n ? '#7c3aed' : '#2a2a3a',
                                                    backgroundColor: (skills.columns || 2) === n ? '#7c3aed22' : 'transparent',
                                                    color: (skills.columns || 2) === n ? '#a78bfa' : '#8b8ba7',
                                                    cursor: 'pointer', textAlign: 'center',
                                                    fontSize: '14px', fontWeight: '600',
                                                }}>
                                            {n} Columns
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Separator — only for horizontal */}
                        {skills.displayMode === 'horizontal' && (
                            <div style={{marginBottom: '20px'}}>
                                <label style={labelStyle}>Separator</label>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    {[
                                        {id: ',', label: 'Comma', preview: 'Java, Python, SQL'},
                                        {id: '•', label: 'Bullet', preview: 'Java • Python • SQL'},
                                        {id: '|', label: 'Pipe', preview: 'Java | Python | SQL'},
                                    ].map(sep => (
                                        <button key={sep.id}
                                                onClick={() => updateSkillsMeta('separator', sep.id)}
                                                style={{
                                                    flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid',
                                                    borderColor: skills.separator === sep.id ? '#7c3aed' : '#2a2a3a',
                                                    backgroundColor: skills.separator === sep.id ? '#7c3aed22' : 'transparent',
                                                    color: skills.separator === sep.id ? '#a78bfa' : '#8b8ba7',
                                                    cursor: 'pointer', textAlign: 'center',
                                                }}>
                                            <div style={{fontSize: '13px', fontWeight: '600'}}>{sep.label}</div>
                                            <div style={{fontSize: '11px', marginTop: '2px', opacity: 0.7}}>{sep.preview}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bullet Style — only for vertical and columns */}
                        {(skills.displayMode === 'vertical' || skills.displayMode === 'columns') && (
                            <div style={{marginBottom: '20px'}}>
                                <label style={labelStyle}>Bullet Style</label>
                                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                    {['•', '▪', '–', '→', '✓', '★'].map(style => (
                                        <button key={style}
                                                onClick={() => updateSkillsMeta('bulletStyle', style)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '6px', border: '1px solid',
                                                    borderColor: skills.bulletStyle === style ? '#7c3aed' : '#2a2a3a',
                                                    backgroundColor: skills.bulletStyle === style ? '#7c3aed22' : 'transparent',
                                                    color: skills.bulletStyle === style ? '#a78bfa' : '#8b8ba7',
                                                    fontSize: '14px', cursor: 'pointer',
                                                }}>
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories */}
                        {skills.categories.map((cat, catIdx) => (
                            <div key={cat.id} style={{
                                padding: '16px', borderRadius: '12px', border: '1px solid #2a2a3a',
                                marginBottom: '12px', backgroundColor: '#0d0d14'
                            }}>
                                <div style={{marginBottom: '12px'}}>
                                    <label style={labelStyle}>Category Name (optional)</label>
                                    <input type="text"
                                           placeholder="e.g. Languages, Frameworks, Tools..."
                                           value={cat.name}
                                           onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                                           style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                </div>
                                <label style={labelStyle}>Skills</label>
                                {cat.items.map((item, itemIdx) => (
                                    <div key={itemIdx} style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px'}}>
                                        <input type="text"
                                               placeholder="e.g. Java"
                                               value={item}
                                               onChange={(e) => updateCategoryItem(cat.id, itemIdx, e.target.value)}
                                               style={{...inputStyle, flex: 1}}
                                               onFocus={focusInput} onBlur={blurInput}/>
                                        {cat.items.length > 1 && (
                                            <button onClick={() => removeCategoryItem(cat.id, itemIdx)}
                                                    style={{backgroundColor: '#ef444411', border: '1px solid #ef444433', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', flexShrink: 0}}>
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px'}}>
                                    <button onClick={() => addCategoryItem(cat.id)} style={{...addButtonStyle, marginTop: '0'}}>
                                        + Add Skill
                                    </button>
                                    {skills.categories.length > 1 && (
                                        <button onClick={() => removeCategory(cat.id)}
                                                style={{...removeButtonStyle, marginTop: '0'}}>
                                            Remove Category
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button onClick={addCategory} style={addButtonStyle}>+ Add Category</button>
                    </div>
                )

            case 7:
                return (
                    <div>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Looking good!
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            Review your resume on the right. When you're happy with it, save it.
                        </p>
                        <div style={{backgroundColor: '#0d0d14', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px', marginBottom: '24px'}}>
                            {[
                                {label: 'Title', value: resumeData.title || 'Not set'},
                                {label: 'Name', value: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`.trim() || 'Not set'},
                                {label: 'Email', value: resumeData.personalInfo.email || 'Not set'},
                                {label: 'Experience', value: `${resumeData.experience.filter(e => e.company).length} position(s)`},
                                {label: 'Education', value: `${resumeData.education.filter(e => e.school).length} school(s)`},
                                {label: 'Skills', value: `${skills.categories.reduce((acc, c) => acc + c.items.filter(Boolean).length, 0)} skill(s)`},
                            ].map((item, idx, arr) => (
                                <div key={item.label} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < arr.length - 1 ? '1px solid #2a2a3a' : 'none'}}>
                                    <span style={{fontSize: '13px', color: '#8b8ba7'}}>{item.label}</span>
                                    <span style={{fontSize: '13px', color: '#f0f0ff'}}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        {error && (
                            <div style={{backgroundColor: '#2a1a1a', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px'}}>
                                {error}
                            </div>
                        )}
                        <button onClick={handleSave} disabled={saving} style={{
                            width: '100%', padding: '14px',
                            background: saving ? '#2a2a3a' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                            border: 'none', borderRadius: '10px', color: '#f0f0ff',
                            fontSize: '15px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
                        }}>
                            {saving ? 'Saving...' : id ? 'Save Changes' : 'Save Resume'}
                        </button>
                    </div>
                )

            default:
                return null
        }
    }

    if (loading) return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', backgroundColor: '#0d0d14'}}>
            <p style={{color: '#8b8ba7'}}>Loading resume...</p>
        </div>
    )

    return (
        <div style={{display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: '#0d0d14'}}>
            <div style={{width: '50%', overflowY: 'auto', padding: '40px', borderRight: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px'}}>
                    <div style={{display: 'flex', gap: '4px', backgroundColor: '#0d0d14', padding: '4px', borderRadius: '10px', border: '1px solid #2a2a3a'}}>
                        {[{id: 'write', label: '✏️ Write'}, {id: 'design', label: '🎨 Design'}, {id: 'ai', label: '✨ AI'}].map(m => (
                            <button key={m.id} onClick={() => setMode(m.id)} style={{
                                padding: '8px 20px', borderRadius: '7px', border: 'none', fontSize: '13px',
                                fontWeight: '500', cursor: 'pointer',
                                backgroundColor: mode === m.id ? '#16161f' : 'transparent',
                                color: mode === m.id ? '#f0f0ff' : '#8b8ba7',
                                transition: 'all 0.2s ease',
                            }}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleDownload} style={{
                        backgroundColor: '#16161f', border: '1px solid #2a2a3a', color: '#8b8ba7',
                        padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed44'; e.currentTarget.style.color = '#f0f0ff' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#8b8ba7' }}>
                        ↓ Download PDF
                    </button>
                </div>

                {mode === 'write' ? (
                    <>
                        <div style={{marginBottom: '40px'}}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                                {steps.map((step, idx) => {
                                    const clickable = isStepClickable(step.id)
                                    const completed = visitedSteps.has(step.id) && step.id < currentStep
                                    const active = step.id === currentStep
                                    return (
                                        <div key={step.id} style={{display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 0}}>
                                            <div onClick={() => clickable && handleStepClick(step.id)} title={step.title} style={{
                                                width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                                                fontWeight: '600', flexShrink: 0, cursor: clickable ? 'pointer' : 'not-allowed',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: active ? '#7c3aed' : completed ? '#4f46e5' : clickable ? '#16161f' : '#0d0d14',
                                                border: active ? '2px solid #a78bfa' : completed ? '2px solid #4f46e5' : clickable ? '2px solid #2a2a3a' : '2px solid #1a1a24',
                                                color: active || completed ? '#f0f0ff' : clickable ? '#8b8ba7' : '#3a3a4a',
                                            }}>
                                                {completed ? '✓' : step.id}
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div style={{flex: 1, height: '2px', backgroundColor: completed ? '#4f46e5' : '#2a2a3a', margin: '0 4px', transition: 'background-color 0.3s ease'}}/>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <p style={{fontSize: '12px', color: '#8b8ba7', textAlign: 'center'}}>
                                Step {currentStep} of {steps.length} — {steps[currentStep - 1].title}
                                {saving && <span style={{color: '#7c3aed', marginLeft: '8px'}}>saving...</span>}
                            </p>
                        </div>
                        <div style={{flex: 1}}>{renderStep()}</div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #2a2a3a'}}>
                            <button onClick={() => currentStep === 1 ? navigate('/dashboard') : setCurrentStep(prev => prev - 1)}
                                    style={{backgroundColor: '#16161f', border: '1px solid #2a2a3a', color: '#8b8ba7', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'}}>
                                {currentStep === 1 ? 'Cancel' : '← Back'}
                            </button>
                            {currentStep < steps.length && (
                                <button onClick={handleNext} disabled={saving} style={{
                                    background: saving ? '#2a2a3a' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                    border: 'none', color: '#f0f0ff', padding: '10px 24px', borderRadius: '8px',
                                    fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer',
                                }}>
                                    {saving ? 'Saving...' : 'Next →'}
                                </button>
                            )}
                        </div>
                    </>
                ) : mode === 'design' ? (
                    <DesignPanel resumeData={resumeData} onUpdate={(field, value) => setResumeData(prev => ({...prev, [field]: value}))}/>
                ) : null}
                <div style={{display: mode === 'ai' ? 'block' : 'none'}}>
                    <AiPanel resumeData={resumeData}/>
                </div>
            </div>
            <div style={{width: '50%', overflowY: 'auto', backgroundColor: '#f8f9fc', padding: '40px'}}>
                <ResumePreview resumeData={resumeData}/>
            </div>
        </div>
    )
}

export default ResumeFormPage