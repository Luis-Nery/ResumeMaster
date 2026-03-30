import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'

const fontSizeMap = {
    small: { base: '11px', title: '26px', name: '13px', small: '10px', label: '9px' },
    medium: { base: '13.5px', title: '32px', name: '15px', small: '12px', label: '11px' },
    large: { base: '15px', title: '38px', name: '17px', small: '13px', label: '12px' },
}

const paddingMap = {
    compact: '32px 36px',
    normal: '48px 56px',
    relaxed: '64px 72px',
}

const sectionSpacingMap = {
    tight: '16px',
    normal: '32px',
    loose: '48px',
}

const ResumePreview = ({ resumeData }) => {
    const {
        template = 'classic',
        accentColor = '#1a1a1a',
        font = 'Georgia, serif',
        fontSize = 'medium',
        padding = 'normal',
    } = resumeData

    const props = {
        resumeData,
        accentColor,
        font,
        fontSizes: fontSizeMap[fontSize] || fontSizeMap.medium,
        padding: paddingMap[padding] || paddingMap.normal,
        sectionSpacing: sectionSpacingMap[resumeData.sectionSpacing] || '32px',
    }

    const renderTemplate = () => {
        switch (template) {
            case 'modern': return <ModernTemplate {...props} />
            case 'minimal': return <MinimalTemplate {...props} />
            case 'classic':
            default: return <ClassicTemplate {...props} />
        }
    }

    return (
        <div id="resume-preview">
            {renderTemplate()}
        </div>
    )
}

export default ResumePreview