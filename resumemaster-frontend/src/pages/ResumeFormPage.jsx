import {useState, useEffect, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import api from '../services/api'
import ResumePreview from '../components/ResumePreview'
import DesignPanel from '../components/DesignPanel'
import AiPanel from '../components/AiPanel'

/** Shared inline style object applied to every `<input>` and `<textarea>` in the form. */
const inputStyle = {
    backgroundColor: '#0d0d14',
    border: '1px solid #2a2a3a',
    color: '#f0f0ff',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    boxSizing: 'border-box',
}

/** Shared inline style for form field `<label>` elements. */
const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#8b8ba7',
    marginBottom: '6px',
}

/** Shared inline style for "add" action buttons (e.g. Add Bullet, Add Entry). */
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

/** Shared inline style for "remove" action buttons (e.g. Remove Entry). */
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

/** Shared inline style for entry cards (experience, education entries). */
const cardStyle = {
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '16px',
    backgroundColor: '#0d0d14',
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
}

/**
 * Ordered list of wizard steps displayed in the progress indicator.
 * Each step has a numeric `id` (used as the `currentStep` value) and a
 * human-readable `title` shown in the step indicator tooltip and label.
 */
const steps = [
    {id: 1, title: 'Title'},
    {id: 2, title: 'Personal'},
    {id: 3, title: 'Summary'},
    {id: 4, title: 'Experience'},
    {id: 5, title: 'Education'},
    {id: 6, title: 'Skills'},
    {id: 7, title: 'Review'},
]

/**
 * Default resume data used when creating a brand-new resume. All string
 * fields are empty, arrays contain a single blank entry, and design
 * settings are initialised to sensible defaults.
 */
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
        type: 'work',
        company: '',
        title: '',
        url: '',
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

/**
 * Multi-step resume editor page used for both creating (`/resume/new`) and
 * editing (`/resume/:id`) resumes.
 *
 * The left panel hosts three modes toggled by a tab bar:
 * - **Write** — a 7-step wizard (Title → Personal → Summary → Experience →
 *   Education → Skills → Review) with back/next navigation and a step
 *   progress indicator.
 * - **Design** — the {@link DesignPanel} for template, font, colour, and
 *   spacing settings.
 * - **AI** — the {@link AiPanel} for analysis, bullet rewrites, and ATS matching.
 *
 * The right panel always shows a live {@link ResumePreview}.
 *
 * **Autosave**: A 3-second debounced effect fires whenever `resumeData` or
 * `currentStep` changes. If a resume record exists it is updated via
 * `PUT /api/resumes/:id`; if the title is non-empty a new record is created
 * via `POST /api/resumes` and the URL is updated to the new id. While offline
 * or before first save the draft is kept in `localStorage`.
 *
 * @returns {JSX.Element} The split-panel resume editor or a loading spinner.
 */
const ResumeFormPage = () => {
    const {id} = useParams()
    const {userId} = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(!!id)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [downloading, setDownloading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [visitedSteps, setVisitedSteps] = useState(new Set([1]))
    const [resumeId, setResumeId] = useState(id || null)
    const [resumeData, setResumeData] = useState(emptyResumeData)
    const [mode, setMode] = useState('write')
    const localKey = `resume_draft_${id || 'new'}`
    const saveTimeout = useRef(null)

    useEffect(() => {
        if (id) {
            fetchResume()
        } else {
            localStorage.removeItem(localKey)
            setResumeData(emptyResumeData)
            setCurrentStep(1)
            setVisitedSteps(new Set([1]))
        }
    }, [id])

    useEffect(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(async () => {
            if (resumeId) {
                try {
                    await api.put(`/resumes/${resumeId}`, {
                        title: resumeData.title || 'Untitled Resume',
                        content: JSON.stringify(resumeData),
                        isComplete: false,
                        currentStep: currentStep
                    })
                } catch (err) {
                    setError('Autosave failed — check your connection')
                }
            } else if (resumeData.title.trim()) {
                try {
                    const response = await api.post('/resumes', {
                        title: resumeData.title || 'Untitled Resume',
                        content: JSON.stringify(resumeData),
                        userId: userId,
                        isComplete: false,
                        currentStep: currentStep
                    })
                    const newId = response.data.id
                    setResumeId(newId)
                    localStorage.removeItem(localKey)
                    window.history.replaceState(null, '', `/resume/${newId}`)
                } catch (err) {
                    localStorage.setItem(localKey, JSON.stringify({
                        resumeData,
                        currentStep,
                        visitedSteps: [...visitedSteps]
                    }))
                }
            } else {
                localStorage.setItem(localKey, JSON.stringify({
                    resumeData,
                    currentStep,
                    visitedSteps: [...visitedSteps]
                }))
            }
        }, 3000)
        return () => clearTimeout(saveTimeout.current)
    }, [resumeData, currentStep])

    /**
     * Fetches an existing resume by id from `GET /api/resumes/:id`, parses
     * the JSON content field, restores the current step, and marks all steps
     * as visited so the user can jump between them freely.
     *
     * @async
     * @returns {Promise<void>}
     */
    const fetchResume = async () => {
        try {
            const response = await api.get(`/resumes/${id}`)
            const parsed = JSON.parse(response.data.content)
            setResumeData(parsed)
            setCurrentStep(response.data.currentStep || 1)
            setVisitedSteps(new Set([1, 2, 3, 4, 5, 6, 7]))
            localStorage.removeItem(`resume_draft_${id}`)
        } catch (err) {
            setError('Failed to load resume')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Persists the current resume data as a checkpoint. Creates a new resume
     * record if none exists yet, otherwise updates the existing one. Updates
     * the URL to the new resume id and clears the local draft on first save.
     *
     * @async
     * @param {number}  nextStep              - The step number to record as the resume's progress.
     * @param {boolean} [isComplete=false]    - Whether to mark the resume as fully complete.
     * @returns {Promise<void>}
     */
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

    /**
     * Saves a checkpoint for the current step and advances to the next step.
     * Adds the next step to the set of visited steps so it becomes clickable.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleNext = async () => {
        await saveCheckpoint(currentStep + 1)
        const next = currentStep + 1
        setVisitedSteps(prev => new Set([...prev, next]))
        setCurrentStep(next)
    }

    /**
     * Navigates directly to a step when the user clicks the step indicator.
     * Does nothing if the step is not yet clickable (not visited and not current).
     *
     * @param {number} stepId - The id of the step to navigate to.
     */
    const handleStepClick = (stepId) => {
        if (!isStepClickable(stepId)) return
        setCurrentStep(stepId)
    }

    /**
     * Returns whether the step indicator circle for `stepId` should respond
     * to clicks. A step is clickable if it is the current step or has been
     * previously visited.
     *
     * @param {number} stepId - The id of the step to check.
     * @returns {boolean} `true` if the step is reachable.
     */
    const isStepClickable = (stepId) => {
        if (stepId === currentStep) return true
        if (visitedSteps.has(stepId)) return true
        return false
    }

    /**
     * Saves the resume as complete (step 7, `isComplete: true`), clears any
     * local drafts, and navigates back to the dashboard.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleSave = async () => {
        await saveCheckpoint(7, true)
        localStorage.removeItem(localKey)
        localStorage.removeItem(`resume_draft_${resumeId}`)
        navigate('/dashboard')
    }

    /**
     * Generates and downloads a PDF of the current resume.
     *
     * Clones the rendered template DOM node from `#resume-preview`, forces
     * it to a fixed 794 px width (A4), serialises it to an HTML string, and
     * sends it to `POST /api/pdf/generate`. The backend uses Puppeteer to
     * render and return the PDF bytes, which are then downloaded as a file.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleDownload = async () => {
        const element = document.getElementById('resume-preview').firstElementChild
        if (!element) return

        const filename = `${resumeData.title || 'resume'}.pdf`
        setDownloading(true)
        setError('')

        try {
            const clone = element.cloneNode(true)
            clone.style.width = '794px'
            clone.style.maxWidth = '794px'
            clone.style.margin = '0'
            clone.style.boxShadow = 'none'
            clone.style.borderRadius = '0'

            const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; word-break: break-word; overflow-wrap: break-word; }
  body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  span { font-size: inherit; line-height: inherit; }
</style>
</head>
<body>${clone.outerHTML}</body>
</html>`

            const response = await api.post('/pdf/generate', {html}, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}))
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setError('PDF generation failed — please try again')
            console.error('PDF generation failed:', err)
        } finally {
            setDownloading(false)
        }
    }
    /** Highlights an input border in accent purple when it gains focus. */
    const focusInput = (e) => e.target.style.borderColor = '#7c3aed'
    /** Resets an input border to the default dark colour when it loses focus. */
    const blurInput = (e) => e.target.style.borderColor = '#2a2a3a'

    /**
     * Updates a single field in `resumeData.personalInfo`.
     *
     * @param {string} field - The personalInfo key to update (e.g. `'email'`).
     * @param {string} value - The new value for that field.
     */
    const updatePersonalInfo = (field, value) => {
        setResumeData(prev => ({...prev, personalInfo: {...prev.personalInfo, [field]: value}}))
    }

    /**
     * Updates a single field on an experience entry identified by `expId`.
     *
     * @param {number} expId  - The `id` of the experience entry to update.
     * @param {string} field  - The field name to change.
     * @param {*}      value  - The new field value.
     */
    const updateExperience = (expId, field, value) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === expId ? {...exp, [field]: value} : exp)
        }))
    }

    /**
     * Appends a new blank work experience entry to `resumeData.experience`.
     * The new entry uses `Date.now()` as a unique id.
     */
    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, {
                id: Date.now(), type: 'work', company: '', title: '', url: '',
                startDate: '', endDate: '', current: false,
                description: '', bullets: [''], bulletStyle: '•'
            }]
        }))
    }

    /**
     * Removes the experience entry with the given id from `resumeData.experience`.
     *
     * @param {number} expId - The `id` of the experience entry to remove.
     */
    const removeExperience = (expId) => {
        setResumeData(prev => ({...prev, experience: prev.experience.filter(exp => exp.id !== expId)}))
    }

    /**
     * Appends an empty bullet string to the `bullets` array of the experience
     * entry identified by `expId`.
     *
     * @param {number} expId - The `id` of the target experience entry.
     */
    const addBullet = (expId) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? {...exp, bullets: [...(exp.bullets || ['']), '']} : exp
            )
        }))
    }

    /**
     * Removes the bullet at position `index` from the `bullets` array of the
     * experience entry identified by `expId`.
     *
     * @param {number} expId  - The `id` of the target experience entry.
     * @param {number} index  - Zero-based index of the bullet to remove.
     */
    const removeBullet = (expId, index) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? {...exp, bullets: (exp.bullets || ['']).filter((_, i) => i !== index)} : exp
            )
        }))
    }

    /**
     * Updates the bullet text at position `index` in the `bullets` array of
     * the experience entry identified by `expId`.
     *
     * @param {number} expId  - The `id` of the target experience entry.
     * @param {number} index  - Zero-based index of the bullet to update.
     * @param {string} value  - The new bullet text.
     */
    const updateBullet = (expId, index, value) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === expId ? {...exp, bullets: (exp.bullets || ['']).map((b, i) => i === index ? value : b)} : exp
            )
        }))
    }

    /**
     * Updates a single field on an education entry identified by `eduId`.
     *
     * @param {number} eduId  - The `id` of the education entry to update.
     * @param {string} field  - The field name to change.
     * @param {*}      value  - The new field value.
     */
    const updateEducation = (eduId, field, value) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === eduId ? {...edu, [field]: value} : edu)
        }))
    }

    /**
     * Appends a new blank education entry to `resumeData.education`.
     */
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

    /**
     * Removes the education entry with the given id from `resumeData.education`.
     *
     * @param {number} eduId - The `id` of the education entry to remove.
     */
    const removeEducation = (eduId) => {
        setResumeData(prev => ({...prev, education: prev.education.filter(edu => edu.id !== eduId)}))
    }

    /**
     * Appends an empty accomplishment bullet to the `accomplishmentBullets`
     * array of the education entry identified by `eduId`.
     *
     * @param {number} eduId - The `id` of the target education entry.
     */
    const addAccomplishment = (eduId) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === eduId ? {...edu, accomplishmentBullets: [...(edu.accomplishmentBullets || ['']), '']} : edu
            )
        }))
    }

    /**
     * Removes the accomplishment bullet at position `index` from the
     * education entry identified by `eduId`.
     *
     * @param {number} eduId  - The `id` of the target education entry.
     * @param {number} index  - Zero-based index of the bullet to remove.
     */
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

    /**
     * Updates the text of an accomplishment bullet at position `index` in the
     * education entry identified by `eduId`.
     *
     * @param {number} eduId  - The `id` of the target education entry.
     * @param {number} index  - Zero-based index of the bullet to update.
     * @param {string} value  - The new bullet text.
     */
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

    /**
     * Returns the skills data in the current structured format. Migrates
     * legacy resumes that stored skills as a flat string array by wrapping
     * them in the new categories object shape.
     *
     * @returns {{ displayMode: string, bulletStyle: string, separator: string, columns: number, categories: Array }} Normalised skills object.
     */
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

    /**
     * Updates a top-level metadata field on the skills object
     * (e.g. `displayMode`, `bulletStyle`, `separator`, `columns`).
     *
     * @param {string} field - The skills metadata key to update.
     * @param {*}      value - The new value.
     */
    const updateSkillsMeta = (field, value) => {
        setResumeData(prev => ({...prev, skills: {...getSkills(), [field]: value}}))
    }

    /**
     * Appends a new blank skill category to the skills categories array.
     */
    const addCategory = () => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {...s, categories: [...s.categories, {id: Date.now(), name: '', items: ['']}]}
        }))
    }

    /**
     * Removes the skill category with the given id.
     *
     * @param {number} catId - The `id` of the category to remove.
     */
    const removeCategory = (catId) => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {...s, categories: s.categories.filter(c => c.id !== catId)}
        }))
    }

    /**
     * Updates the name of a skill category.
     *
     * @param {number} catId  - The `id` of the category to rename.
     * @param {string} value  - The new category name.
     */
    const updateCategoryName = (catId, value) => {
        const s = getSkills()
        setResumeData(prev => ({
            ...prev,
            skills: {...s, categories: s.categories.map(c => c.id === catId ? {...c, name: value} : c)}
        }))
    }

    /**
     * Appends an empty skill string to the items array of the category
     * identified by `catId`.
     *
     * @param {number} catId - The `id` of the target category.
     */
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

    /**
     * Removes the skill item at position `index` from the category
     * identified by `catId`.
     *
     * @param {number} catId  - The `id` of the target category.
     * @param {number} index  - Zero-based index of the item to remove.
     */
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

    /**
     * Updates the skill text at position `index` in the category identified
     * by `catId`.
     *
     * @param {number} catId  - The `id` of the target category.
     * @param {number} index  - Zero-based index of the item to update.
     * @param {string} value  - The new skill text.
     */
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

    /**
     * Returns the JSX for the currently active wizard step. Each case
     * renders the appropriate form fields for that step's data slice.
     *
     * Step mapping:
     * 1 — Resume title
     * 2 — Personal information
     * 3 — Professional summary
     * 4 — Work experience & projects
     * 5 — Education
     * 6 — Skills (with display-mode controls)
     * 7 — Review summary + save button
     *
     * @returns {JSX.Element|null} The form UI for the current step.
     */
    const renderStep = () => {
        const skills = getSkills()

        switch (currentStep) {
            case 1:
                return (
                    <div style={{minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
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
                    <div style={{minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Personal Information
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            This appears at the top of your resume.
                        </p>
                        <div style={{display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '16px'}}>
                            <div style={{minWidth: 0}}>
                                <label style={labelStyle}>First Name</label>
                                <input type="text" placeholder="John" value={resumeData.personalInfo.firstName}
                                       onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div style={{minWidth: 0}}>
                                <label style={labelStyle}>Last Name</label>
                                <input type="text" placeholder="Doe" value={resumeData.personalInfo.lastName}
                                       onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div style={{minWidth: 0}}>
                                <label style={labelStyle}>Email</label>
                                <input type="email" placeholder="you@example.com" value={resumeData.personalInfo.email}
                                       onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div style={{minWidth: 0}}>
                                <label style={labelStyle}>Phone</label>
                                <input type="text" placeholder="+1 (555) 000-0000" value={resumeData.personalInfo.phone}
                                       onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div style={{minWidth: 0}}>
                                <label style={labelStyle}>Location</label>
                                <input type="text" placeholder="City, State" value={resumeData.personalInfo.location}
                                       onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div style={{minWidth: 0}}>
                                <label style={labelStyle}>LinkedIn</label>
                                <input type="text" placeholder="linkedin.com/in/you"
                                       value={resumeData.personalInfo.linkedin}
                                       onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                            <div style={{minWidth: 0}}>
                                <label style={labelStyle}>GitHub</label>
                                <input type="text" placeholder="github.com/yourusername"
                                       value={resumeData.personalInfo.github || ''}
                                       onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                       style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div style={{minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
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
                    <div style={{minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Experience
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            Add work experience and projects. Each entry can be tagged separately.
                        </p>
                        {resumeData.experience.map((exp, idx) => {
                            const isProject = (exp.type || 'work') === 'project'
                            return (
                                <div key={exp.id} style={{
                                    ...cardStyle,
                                    border: `1px solid ${isProject ? '#4f46e533' : '#2a2a3a'}`,
                                }}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', minWidth: 0}}>
                                        <p style={{fontSize: '12px', color: '#8b8ba7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, flexShrink: 0}}>
                                            Entry {idx + 1}
                                        </p>
                                        <div style={{display: 'flex', gap: '4px', backgroundColor: '#16161f', padding: '3px', borderRadius: '8px', border: '1px solid #2a2a3a', flexShrink: 0}}>
                                            {[
                                                {value: 'work', label: '💼 Work'},
                                                {value: 'project', label: '🚀 Project'},
                                            ].map(opt => (
                                                <button key={opt.value}
                                                        onClick={() => updateExperience(exp.id, 'type', opt.value)}
                                                        style={{
                                                            padding: '5px 14px', borderRadius: '6px', border: 'none',
                                                            fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                                            backgroundColor: (exp.type || 'work') === opt.value ? (opt.value === 'project' ? '#4f46e5' : '#7c3aed') : 'transparent',
                                                            color: (exp.type || 'work') === opt.value ? '#f0f0ff' : '#8b8ba7',
                                                            transition: 'all 0.15s ease',
                                                        }}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '12px', marginBottom: '12px'}}>
                                        <div style={{minWidth: 0}}>
                                            <label style={labelStyle}>{isProject ? 'Project Name' : 'Company'}</label>
                                            <input type="text"
                                                   placeholder={isProject ? 'e.g. ResumeMaster' : 'e.g. Google'}
                                                   value={exp.company}
                                                   onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                   style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                        </div>
                                        <div style={{minWidth: 0}}>
                                            <label style={labelStyle}>{isProject ? 'Role / Tech Stack' : 'Job Title'}</label>
                                            <input type="text"
                                                   placeholder={isProject ? 'e.g. Java, Spring Boot, React' : 'e.g. Software Engineer'}
                                                   value={exp.title}
                                                   onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                   style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                        </div>
                                        <div style={{minWidth: 0}}>
                                            <label style={labelStyle}>Start Date</label>
                                            <input type="text" placeholder="Jan 2022" value={exp.startDate}
                                                   onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                   style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                        </div>
                                        <div style={{minWidth: 0}}>
                                            <label style={labelStyle}>End Date</label>
                                            <input type="text" placeholder="Present" value={exp.endDate}
                                                   disabled={exp.current}
                                                   onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                   style={{...inputStyle, opacity: exp.current ? 0.4 : 1}}
                                                   onFocus={focusInput} onBlur={blurInput}/>
                                        </div>
                                    </div>
                                    {isProject && (
                                        <div style={{marginBottom: '12px', minWidth: 0}}>
                                            <label style={labelStyle}>Project URL (optional)</label>
                                            <input type="text"
                                                   placeholder="e.g. resumemaster.dev or github.com/you/project"
                                                   value={exp.url || ''}
                                                   onChange={(e) => updateExperience(exp.id, 'url', e.target.value)}
                                                   style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                        </div>
                                    )}
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8b8ba7', marginBottom: '12px', cursor: 'pointer'}}>
                                        <input type="checkbox" checked={exp.current}
                                               onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}/>
                                        {isProject ? 'Ongoing project' : 'Currently working here'}
                                    </label>
                                    <div style={{marginBottom: '16px', minWidth: 0}}>
                                        <label style={labelStyle}>Description (optional)</label>
                                        <textarea
                                            placeholder={isProject ? 'Brief overview of what this project does...' : 'Brief overview of your role...'}
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
                                    <div style={{minWidth: 0, width: '100%'}}>
                                        <label style={labelStyle}>Bullet Points</label>
                                        {(exp.bullets || ['']).map((bullet, bulletIdx) => (
                                            <div key={bulletIdx} style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', minWidth: 0, width: '100%'}}>
                                                <span style={{color: '#8b8ba7', fontSize: '14px', flexShrink: 0}}>{exp.bulletStyle || '•'}</span>
                                                <input type="text"
                                                       placeholder={isProject ? 'e.g. Reduced load time by 60% using lazy loading' : 'e.g. Reduced API response time by 40%'}
                                                       value={bullet}
                                                       onChange={(e) => updateBullet(exp.id, bulletIdx, e.target.value)}
                                                       style={{...inputStyle, flex: 1, minWidth: 0}}
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
                                            Remove Entry
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                        <button onClick={addExperience} style={addButtonStyle}>+ Add Another Entry</button>
                    </div>
                )

            case 5:
                return (
                    <div style={{minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Education
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '32px'}}>
                            Add your educational background.
                        </p>
                        {resumeData.education.map((edu, idx) => (
                            <div key={edu.id} style={{...cardStyle, border: '1px solid #2a2a3a'}}>
                                <p style={{fontSize: '12px', color: '#8b8ba7', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                                    School {idx + 1}
                                </p>
                                <div style={{display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '12px', marginBottom: '12px'}}>
                                    <div style={{minWidth: 0}}>
                                        <label style={labelStyle}>School</label>
                                        <input type="text" placeholder="MIT" value={edu.school}
                                               onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div style={{minWidth: 0}}>
                                        <label style={labelStyle}>Degree</label>
                                        <input type="text" placeholder="Bachelor of Science" value={edu.degree}
                                               onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                </div>
                                <div style={{display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: '12px', marginBottom: '16px'}}>
                                    <div style={{minWidth: 0}}>
                                        <label style={labelStyle}>Field of Study</label>
                                        <input type="text" placeholder="Computer Science" value={edu.field}
                                               onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div style={{minWidth: 0}}>
                                        <label style={labelStyle}>GPA</label>
                                        <input type="text" placeholder="3.8" value={edu.gpa || ''}
                                               onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div style={{minWidth: 0}}>
                                        <label style={labelStyle}>Start</label>
                                        <input type="text" placeholder="2020" value={edu.startDate}
                                               onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                    <div style={{minWidth: 0}}>
                                        <label style={labelStyle}>End</label>
                                        <input type="text" placeholder="2024" value={edu.endDate}
                                               onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                               style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                    </div>
                                </div>
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
                                <div style={{minWidth: 0, width: '100%'}}>
                                    <label style={labelStyle}>Academic Accomplishments (optional)</label>
                                    {(edu.accomplishmentBullets || ['']).map((bullet, bulletIdx) => (
                                        <div key={bulletIdx} style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', minWidth: 0, width: '100%'}}>
                                            <span style={{color: '#8b8ba7', fontSize: '14px', flexShrink: 0}}>{edu.accomplishmentBulletStyle || '•'}</span>
                                            <input type="text"
                                                   placeholder="e.g. Dean's List, Magna Cum Laude..."
                                                   value={bullet}
                                                   onChange={(e) => updateAccomplishment(edu.id, bulletIdx, e.target.value)}
                                                   style={{...inputStyle, flex: 1, minWidth: 0}}
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
                    <div style={{minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
                        <h2 style={{fontSize: '22px', fontWeight: '600', color: '#f0f0ff', marginBottom: '8px'}}>
                            Skills
                        </h2>
                        <p style={{fontSize: '14px', color: '#8b8ba7', marginBottom: '24px'}}>
                            Organize your skills by category.
                        </p>
                        <div style={{marginBottom: '20px'}}>
                            <label style={labelStyle}>Display Mode</label>
                            <div style={{display: 'flex', gap: '8px'}}>
                                {[
                                    {id: 'horizontal', label: 'Horizontal', desc: 'Languages: Java, Python'},
                                    {id: 'vertical', label: 'Vertical', desc: 'Bulleted list per category'},
                                    {id: 'columns', label: 'Columns', desc: 'Multi-column layout'},
                                ].map(m => (
                                    <button key={m.id} onClick={() => updateSkillsMeta('displayMode', m.id)}
                                            style={{
                                                flex: 1, padding: '10px 8px', borderRadius: '8px', border: '1px solid',
                                                borderColor: skills.displayMode === m.id ? '#7c3aed' : '#2a2a3a',
                                                backgroundColor: skills.displayMode === m.id ? '#7c3aed22' : 'transparent',
                                                color: skills.displayMode === m.id ? '#a78bfa' : '#8b8ba7',
                                                cursor: 'pointer', textAlign: 'center', minWidth: 0,
                                            }}>
                                        <div style={{fontSize: '13px', fontWeight: '600'}}>{m.label}</div>
                                        <div style={{fontSize: '11px', marginTop: '2px', opacity: 0.7}}>{m.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {skills.displayMode === 'columns' && (
                            <div style={{marginBottom: '20px'}}>
                                <label style={labelStyle}>Number of Columns</label>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    {[2, 3, 4].map(n => (
                                        <button key={n} onClick={() => updateSkillsMeta('columns', n)}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                                                    borderColor: (skills.columns || 2) === n ? '#7c3aed' : '#2a2a3a',
                                                    backgroundColor: (skills.columns || 2) === n ? '#7c3aed22' : 'transparent',
                                                    color: (skills.columns || 2) === n ? '#a78bfa' : '#8b8ba7',
                                                    cursor: 'pointer', textAlign: 'center',
                                                    fontSize: '14px', fontWeight: '600', minWidth: 0,
                                                }}>
                                            {n} Columns
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {skills.displayMode === 'horizontal' && (
                            <div style={{marginBottom: '20px'}}>
                                <label style={labelStyle}>Separator</label>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    {[
                                        {id: ',', label: 'Comma', preview: 'Java, Python, SQL'},
                                        {id: '•', label: 'Bullet', preview: 'Java • Python • SQL'},
                                        {id: '|', label: 'Pipe', preview: 'Java | Python | SQL'},
                                    ].map(sep => (
                                        <button key={sep.id} onClick={() => updateSkillsMeta('separator', sep.id)}
                                                style={{
                                                    flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid',
                                                    borderColor: skills.separator === sep.id ? '#7c3aed' : '#2a2a3a',
                                                    backgroundColor: skills.separator === sep.id ? '#7c3aed22' : 'transparent',
                                                    color: skills.separator === sep.id ? '#a78bfa' : '#8b8ba7',
                                                    cursor: 'pointer', textAlign: 'center', minWidth: 0,
                                                }}>
                                            <div style={{fontSize: '13px', fontWeight: '600'}}>{sep.label}</div>
                                            <div style={{fontSize: '11px', marginTop: '2px', opacity: 0.7}}>{sep.preview}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {(skills.displayMode === 'vertical' || skills.displayMode === 'columns') && (
                            <div style={{marginBottom: '20px'}}>
                                <label style={labelStyle}>Bullet Style</label>
                                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                    {['•', '▪', '–', '→', '✓', '★'].map(style => (
                                        <button key={style} onClick={() => updateSkillsMeta('bulletStyle', style)}
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
                        {skills.categories.map((cat) => (
                            <div key={cat.id} style={{...cardStyle, border: '1px solid #2a2a3a', padding: '16px'}}>
                                <div style={{marginBottom: '12px', minWidth: 0}}>
                                    <label style={labelStyle}>Category Name (optional)</label>
                                    <input type="text" placeholder="e.g. Languages, Frameworks, Tools..."
                                           value={cat.name}
                                           onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                                           style={inputStyle} onFocus={focusInput} onBlur={blurInput}/>
                                </div>
                                <label style={labelStyle}>Skills</label>
                                {cat.items.map((item, itemIdx) => (
                                    <div key={itemIdx} style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', minWidth: 0, width: '100%'}}>
                                        <input type="text" placeholder="e.g. Java" value={item}
                                               onChange={(e) => updateCategoryItem(cat.id, itemIdx, e.target.value)}
                                               style={{...inputStyle, flex: 1, minWidth: 0}}
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
                                        <button onClick={() => removeCategory(cat.id)} style={{...removeButtonStyle, marginTop: '0'}}>
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
                    <div style={{minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
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
                                {label: 'Work Experience', value: `${resumeData.experience.filter(e => (e.type || 'work') === 'work' && e.company).length} position(s)`},
                                {label: 'Projects', value: `${resumeData.experience.filter(e => e.type === 'project' && e.company).length} project(s)`},
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
        <div style={{display: 'flex', height: 'calc(100vh - 64px)', backgroundColor: '#0d0d14', overflow: 'hidden'}}>
            <div style={{
                width: '50%',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '40px',
                borderRight: '1px solid #2a2a3a',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                boxSizing: 'border-box',
            }}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', minWidth: 0}}>
                    <div style={{display: 'flex', gap: '4px', backgroundColor: '#0d0d14', padding: '4px', borderRadius: '10px', border: '1px solid #2a2a3a', flexShrink: 0}}>
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
                    <button onClick={handleDownload} disabled={downloading} style={{
                        backgroundColor: '#16161f', border: '1px solid #2a2a3a',
                        color: downloading ? '#7c3aed' : '#8b8ba7',
                        padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                        cursor: downloading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                    }}
                            onMouseEnter={e => { if (!downloading) { e.currentTarget.style.borderColor = '#7c3aed44'; e.currentTarget.style.color = '#f0f0ff' }}}
                            onMouseLeave={e => { if (!downloading) { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#8b8ba7' }}}>
                        {downloading ? 'Generating PDF...' : '↓ Download PDF'}
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
                                        <div key={step.id} style={{display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 0, minWidth: 0}}>
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
                        <div style={{flex: 1, minWidth: 0, width: '100%'}}>{renderStep()}</div>
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