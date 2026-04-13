import ClassicTemplate from './templates/ClassicTemplate'
import ModernTemplate from './templates/ModernTemplate'
import MinimalTemplate from './templates/MinimalTemplate'

/**
 * Maps the user-chosen `fontSize` setting ('small' | 'medium' | 'large')
 * to concrete CSS pixel values used by every template component.
 */
const fontSizeMap = {
    small: { base: '11px', title: '26px', name: '13px', small: '10px', label: '9px' },
    medium: { base: '13.5px', title: '32px', name: '15px', small: '12px', label: '11px' },
    large: { base: '15px', title: '38px', name: '17px', small: '13px', label: '12px' },
}

/**
 * Maps the `padding` setting ('compact' | 'normal' | 'relaxed') to a CSS
 * shorthand padding string passed to each template.
 */
const paddingMap = {
    compact: '32px 36px',
    normal: '48px 56px',
    relaxed: '64px 72px',
}

/**
 * Maps the `sectionSpacing` setting ('tight' | 'normal' | 'loose') to a CSS
 * pixel value passed as `sectionSpacing` to each template.
 */
const sectionSpacingMap = {
    tight: '16px',
    normal: '32px',
    loose: '48px',
}

/**
 * Converts resume data into a rendered resume document by delegating to the
 * appropriate template component based on `resumeData.template`.
 *
 * Design options (`accentColor`, `font`, `fontSize`, `padding`,
 * `sectionSpacing`) are resolved from lookup maps and forwarded to the
 * template as normalised props. The root `<div>` carries the id
 * `resume-preview` so the PDF download handler in ResumeFormPage can
 * locate and clone its first child.
 *
 * @param {object} props
 * @param {object} props.resumeData - Full resume data object including both
 *   content fields and design settings.
 * @returns {JSX.Element} The selected resume template rendered as HTML.
 */
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

    /**
     * Selects and returns the template component that corresponds to the
     * current `template` setting. Falls back to ClassicTemplate for unknown
     * values.
     *
     * @returns {JSX.Element} The instantiated template component.
     */
    const renderTemplate = () => {
        switch (template) {
            case 'modern': return <ModernTemplate {...props} />
            case 'minimal': return <MinimalTemplate {...props} />
            case 'classic':
            default: return <ClassicTemplate {...props} />
        }
    }

    return (
        <div id="resume-preview" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', overflow: 'hidden' }}>
            {renderTemplate()}
        </div>
    )
}

export default ResumePreview