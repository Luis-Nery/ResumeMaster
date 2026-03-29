import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ResumePreview from '../components/ResumePreview'

const ResumeBuilderPage = () => {
    const { userId } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [resumeData, setResumeData] = useState({
        title: '',
        personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: ''
        },
        summary: '',
        experience: [
            {
                id: 1,
                company: '',
                title: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            }
        ],
        education: [
            {
                id: 1,
                school: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: ''
            }
        ],
        skills: ['']
    })

    const updatePersonalInfo = (field, value) => {
        setResumeData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [field]: value
            }
        }))
    }

    const updateExperience = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }))
    }

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [
                ...prev.experience,
                {
                    id: Date.now(),
                    company: '',
                    title: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: ''
                }
            ]
        }))
    }

    const removeExperience = (id) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }))
    }

    const updateEducation = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }))
    }

    const addEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [
                ...prev.education,
                {
                    id: Date.now(),
                    school: '',
                    degree: '',
                    field: '',
                    startDate: '',
                    endDate: ''
                }
            ]
        }))
    }

    const removeEducation = (id) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }))
    }

    const updateSkill = (index, value) => {
        setResumeData(prev => {
            const newSkills = [...prev.skills]
            newSkills[index] = value
            return { ...prev, skills: newSkills }
        })
    }

    const addSkill = () => {
        setResumeData(prev => ({
            ...prev,
            skills: [...prev.skills, '']
        }))
    }

    const removeSkill = (index) => {
        setResumeData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }))
    }

    const handleSave = async () => {
        setLoading(true)
        setError('')
        try {
            await api.post('/resumes', {
                title: resumeData.title || 'Untitled Resume',
                content: JSON.stringify(resumeData),
                userId: userId
            })
            navigate('/dashboard')
        } catch (err) {
            setError('Failed to save resume')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* LEFT SIDE - Form */}
            <div style={{ width: '50%', overflowY: 'auto', padding: '20px' }}>
                <h1>Build Your Resume</h1>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {/* Resume Title */}
                <div>
                    <h2>Resume Title</h2>
                    <input
                        type="text"
                        placeholder="e.g. Software Engineer Resume"
                        value={resumeData.title}
                        onChange={(e) => setResumeData(prev => ({ ...prev, title: e.target.value }))}
                    />
                </div>

                {/* Personal Info */}
                <div>
                    <h2>Personal Information</h2>
                    <input type="text" placeholder="First Name"
                           value={resumeData.personalInfo.firstName}
                           onChange={(e) => updatePersonalInfo('firstName', e.target.value)} />
                    <input type="text" placeholder="Last Name"
                           value={resumeData.personalInfo.lastName}
                           onChange={(e) => updatePersonalInfo('lastName', e.target.value)} />
                    <input type="email" placeholder="Email"
                           value={resumeData.personalInfo.email}
                           onChange={(e) => updatePersonalInfo('email', e.target.value)} />
                    <input type="text" placeholder="Phone"
                           value={resumeData.personalInfo.phone}
                           onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
                    <input type="text" placeholder="Location"
                           value={resumeData.personalInfo.location}
                           onChange={(e) => updatePersonalInfo('location', e.target.value)} />
                    <input type="text" placeholder="LinkedIn URL"
                           value={resumeData.personalInfo.linkedin}
                           onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} />
                </div>

                {/* Summary */}
                <div>
                    <h2>Professional Summary</h2>
                    <textarea
                        placeholder="Write a brief professional summary..."
                        value={resumeData.summary}
                        onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                        rows={4}
                    />
                </div>

                {/* Experience */}
                <div>
                    <h2>Work Experience</h2>
                    {resumeData.experience.map(exp => (
                        <div key={exp.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                            <input type="text" placeholder="Company"
                                   value={exp.company}
                                   onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                            <input type="text" placeholder="Job Title"
                                   value={exp.title}
                                   onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} />
                            <input type="text" placeholder="Start Date"
                                   value={exp.startDate}
                                   onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                            <input type="text" placeholder="End Date"
                                   value={exp.endDate}
                                   onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} />
                            <label>
                                <input type="checkbox"
                                       checked={exp.current}
                                       onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} />
                                Currently working here
                            </label>
                            <textarea placeholder="Job description..."
                                      value={exp.description}
                                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                      rows={3} />
                            {resumeData.experience.length > 1 && (
                                <button onClick={() => removeExperience(exp.id)}>Remove</button>
                            )}
                        </div>
                    ))}
                    <button onClick={addExperience}>+ Add Experience</button>
                </div>

                {/* Education */}
                <div>
                    <h2>Education</h2>
                    {resumeData.education.map(edu => (
                        <div key={edu.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                            <input type="text" placeholder="School"
                                   value={edu.school}
                                   onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} />
                            <input type="text" placeholder="Degree"
                                   value={edu.degree}
                                   onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                            <input type="text" placeholder="Field of Study"
                                   value={edu.field}
                                   onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} />
                            <input type="text" placeholder="Start Date"
                                   value={edu.startDate}
                                   onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} />
                            <input type="text" placeholder="End Date"
                                   value={edu.endDate}
                                   onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} />
                            {resumeData.education.length > 1 && (
                                <button onClick={() => removeEducation(edu.id)}>Remove</button>
                            )}
                        </div>
                    ))}
                    <button onClick={addEducation}>+ Add Education</button>
                </div>

                {/* Skills */}
                <div>
                    <h2>Skills</h2>
                    {resumeData.skills.map((skill, index) => (
                        <div key={index}>
                            <input type="text" placeholder="e.g. Java"
                                   value={skill}
                                   onChange={(e) => updateSkill(index, e.target.value)} />
                            {resumeData.skills.length > 1 && (
                                <button onClick={() => removeSkill(index)}>Remove</button>
                            )}
                        </div>
                    ))}
                    <button onClick={addSkill}>+ Add Skill</button>
                </div>

                {/* Save Button */}
                <div style={{ marginTop: '20px', marginBottom: '40px' }}>
                    <button onClick={() => navigate('/dashboard')}>Cancel</button>
                    <button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Resume'}
                    </button>
                </div>
            </div>

            {/* RIGHT SIDE - Live Preview */}
            <div style={{ width: '50%', overflowY: 'auto', padding: '20px', borderLeft: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
                <ResumePreview resumeData={resumeData} />
            </div>
        </div>
    )
}

export default ResumeBuilderPage