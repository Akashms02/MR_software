import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import html2pdf from 'html2pdf.js'
import {
    ArrowLeft,
    Printer,
    RefreshCw,
    CheckCircle2,
    X,
    Mail,
    FileText,
    ExternalLink
} from 'lucide-react'

import { PrimaryBtn, OutlineBtn } from '../ui'
import { fetchProfile } from '../../redux/actions/authActions'
import { CompanyTerminationLetter } from '../../redux/actions/companyAction'
import { getMyTeam } from '../../redux/actions/teamActions'
import { getFullAssetUrl, inlineDocumentImages, useCompanyBrandAssets } from '../../utils/getFullAssetUrl'

// Base64 SVGs for slanted accents to render reliably in html2canvas
const DECORATIVE_SVGs = {
    topGold: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOTUiIGhlaWdodD0iODYiIHZpZXdCb3g9IjAgMCAyOTUgODYiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0gMCAwIEwgMjk1IDAgTCAyOTUgODYgWiIgZmlsbD0iI2Q5NzcwNiIvPjwvc3ZnPg==',
    topGreen: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyODAgODAiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0gMCAwIEwgMjgwIDAgTCAyODAgODAgWiIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg==',
    bottomGold: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTSAwIDM1IEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgWiIgZmlsbD0iI2Q5NzcwNiIvPjwvc3ZnPg==',
    bottomGreen: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTSAwIDQ1IEwgMTAwIDAgTCAxMDAgMTAwIEwgMCAxMDAgWiIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg==',
}

const oklchToRgb = (l, c, h, a = 1) => {
    const hRad = (h * Math.PI) / 180;
    const L = l;
    const a_ = c * Math.cos(hRad);
    const b_ = c * Math.sin(hRad);
    const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
    const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
    const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;
    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;
    const r_raw = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699294 * s3;
    const g_raw = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_raw = -0.0041960863 * l3 - 0.7034186145 * m3 + 1.7076147010 * s3;
    const f = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    const r = Math.max(0, Math.min(255, Math.round(f(r_raw) * 255)));
    const g = Math.max(0, Math.min(255, Math.round(f(g_raw) * 255)));
    const b = Math.max(0, Math.min(255, Math.round(f(b_raw) * 255)));
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}

const oklabToRgb = (l, a_, b_, a = 1) => {
    const L = l;
    const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
    const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
    const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;
    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;
    const r_raw = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699294 * s3;
    const g_raw = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const b_raw = -0.0041960863 * l3 - 0.7034186145 * m3 + 1.7076147010 * s3;
    const f = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    const r = Math.max(0, Math.min(255, Math.round(f(r_raw) * 255)));
    const g = Math.max(0, Math.min(255, Math.round(f(g_raw) * 255)));
    const b = Math.max(0, Math.min(255, Math.round(f(b_raw) * 255)));
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}

const resolveModernColors = (colorStr) => {
    if (!colorStr || typeof colorStr !== 'string') return colorStr
    let resolved = colorStr

    if (resolved.includes('oklch')) {
        try {
            resolved = resolved.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
                const parts = p1.trim().split(/[\s/,]+/)
                if (parts.length >= 3) {
                    let l = parseFloat(parts[0])
                    if (parts[0].includes('%')) l /= 100
                    const c = parseFloat(parts[1])
                    const h = parseFloat(parts[2])
                    let a = 1
                    if (parts[3]) {
                        a = parseFloat(parts[3])
                        if (parts[3].includes('%')) a /= 100
                    }
                    if (!isNaN(l) && !isNaN(c) && !isNaN(h)) {
                        return oklchToRgb(l, c, h, a)
                    }
                }
                return match
            })
        } catch (e) {}
    }

    if (resolved.includes('oklab')) {
        try {
            resolved = resolved.replace(/oklab\(([^)]+)\)/g, (match, p1) => {
                const parts = p1.trim().split(/[\s/,]+/)
                if (parts.length >= 3) {
                    let l = parseFloat(parts[0])
                    if (parts[0].includes('%')) l /= 100
                    const a_coord = parseFloat(parts[1])
                    const b_coord = parseFloat(parts[2])
                    let a = 1
                    if (parts[3]) {
                        a = parseFloat(parts[3])
                        if (parts[3].includes('%')) a /= 100
                    }
                    if (!isNaN(l) && !isNaN(a_coord) && !isNaN(b_coord)) {
                        return oklabToRgb(l, a_coord, b_coord, a)
                    }
                }
                return match
            })
        } catch (e) {}
    }

    return resolved
}

export default function TerminationLetter({ onBack }) {
    const dispatch = useDispatch()
    const printableRef = useRef(null)

    const { user } = useSelector((state) => state.auth)
    const { team: employees = [] } = useSelector((state) => state.team)
    const { logoSrc, stampSrc } = useCompanyBrandAssets(user)

    useEffect(() => {
        dispatch(fetchProfile())
        dispatch(getMyTeam())
    }, [dispatch])

    // Load defaults and selection states
    const [selectedId, setSelectedId] = useState('')
    const [employeeName, setEmployeeName] = useState('RAJESH KUMAR')
    const [employeeEmail, setEmployeeEmail] = useState('')
    const [designation, setDesignation] = useState('Sr. Medical Officer')
    const [department, setDepartment] = useState('Medical Affairs')
    const [joiningDate, setJoiningDate] = useState('2021-03-15')
    const [terminationDate, setTerminationDate] = useState(() => new Date().toISOString().split('T')[0])
    const [reason, setReason] = useState('Violation of Company Policies')
    const [terminationType, setTerminationType] = useState('Termination')
    const [noticePeriod, setNoticePeriod] = useState('Immediate')
    const [lastWorkingDay, setLastWorkingDay] = useState(() => new Date().toISOString().split('T')[0])
    const [remarks, setRemarks] = useState('All company assets must be returned immediately.')

    const [hrHeadName, setHrHeadName] = useState('CH. MURTHY')
    const [hrHeadDesignation, setHrHeadDesignation] = useState('Head - HR')

    const [companyName, setCompanyName] = useState('NOEL PHARMA (INDIA) PRIVATE LIMITED')
    const [companyRegAddress, setCompanyRegAddress] = useState('Survey Nos: 1 to 40, Plot No. 109, Uppal Bhagagayath Revenue Village, Uppal-Mandal, Medchal-Malkajgiri, Hyderabad-500039')
    const [hrEmail, setHrEmail] = useState('mail-noelhr1975@gmail.com')

    const [isGenerating, setIsGenerating] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalError, setModalError] = useState('')
    const [modalData, setModalData] = useState({ emailSentTo: '', previewUrl: '', status: '' })

    // Sync company profile
    useEffect(() => {
        if (user) {
            if (user.fullName) setCompanyName(user.fullName.toUpperCase())
            if (user.address) setCompanyRegAddress(user.address)
            if (user.email) setHrEmail(user.email)
        }
    }, [user])

    // Set first employee as default once team loads
    useEffect(() => {
        if (employees.length > 0 && !selectedId) {
            const first = employees[0]
            const id = first?.employeeId || first?.id || ''
            handleLoadEmployee(id)
        }
    }, [employees])

    const handleLoadEmployee = (empId) => {
        setSelectedId(empId)
        const emp = employees.find(e => (e.employeeId || e.id)?.toString() === empId?.toString())
        if (emp) {
            setEmployeeName((emp.fullName || emp.name || '').toUpperCase())
            setDesignation(emp.designation || '')
            setDepartment(emp.department || emp.dept || '')
            setJoiningDate(emp.joiningDate || emp.joined || '2021-03-15')
            setEmployeeEmail(emp.email || '')
        }
    }

    const formatDateIN = (dateStr) => {
        if (!dateStr) return ''
        const parts = dateStr.split('-')
        if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`
        return dateStr
    }

    const handlePrint = () => {
        if (!terminationDate) setTerminationDate(new Date().toISOString().split('T')[0])
        window.print()
    }

    const handleGenerate = async () => {
        if (!employeeEmail || !employeeEmail.includes('@')) {
            setModalError('Please enter a valid employee email address before generating.')
            setShowModal(true)
            return
        }

        setIsGenerating(true)
        setModalError('')

        let originalWindowGetComputedStyle = null

        try {
            // Temporarily override the main window's getComputedStyle to resolve OKLCH/OKLAB colors dynamically
            originalWindowGetComputedStyle = window.getComputedStyle
            window.getComputedStyle = function (el, pseudoEl) {
                const style = originalWindowGetComputedStyle.call(window, el, pseudoEl)
                return new Proxy(style, {
                    get(target, prop) {
                        if (prop === 'getPropertyValue') {
                            return function(key) {
                                const val = target.getPropertyValue(key)
                                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                                    try {
                                        return resolveModernColors(val)
                                    } catch (e) {
                                        return val
                                    }
                                }
                                return val
                            }
                        }
                        const val = target[prop]
                        if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                            try {
                                return resolveModernColors(val)
                            } catch (e) {
                                return val
                            }
                        }
                        if (typeof val === 'function') {
                            return val.bind(target)
                        }
                        return val
                    }
                })
            }

            const sheetElement = printableRef.current
            if (!sheetElement) throw new Error('Document preview not ready. Please try again.')

            const fileName = `termination_letter_${employeeName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.pdf`

            await document.fonts.ready
            await inlineDocumentImages(sheetElement)
            await new Promise((resolve) => setTimeout(resolve, 100))

            // Configure html2pdf options
            const opt = {
                margin: [0, 0, 0, 0],
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    onclone: (clonedDoc) => {
                        const elements = clonedDoc.getElementsByTagName('*')

                        // Override getComputedStyle inside the iframe to dynamically convert all OKLCH/OKLAB colors on the fly!
                        if (clonedDoc.defaultView) {
                            const originalGetComputedStyle = clonedDoc.defaultView.getComputedStyle
                            clonedDoc.defaultView.getComputedStyle = function (el, pseudoEl) {
                                const style = originalGetComputedStyle.call(clonedDoc.defaultView, el, pseudoEl)
                                return new Proxy(style, {
                                    get(target, prop) {
                                        if (prop === 'getPropertyValue') {
                                            return function(key) {
                                                const val = target.getPropertyValue(key)
                                                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                                                    try {
                                                        return resolveModernColors(val)
                                                    } catch (e) {
                                                        return val
                                                    }
                                                }
                                                return val
                                            }
                                        }
                                        const val = target[prop]
                                        if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                                            try {
                                                return resolveModernColors(val)
                                            } catch (e) {
                                                return val
                                            }
                                        }
                                        if (typeof val === 'function') {
                                            return val.bind(target)
                                        }
                                        return val
                                    }
                                })
                            }
                        }

                        // Preprocess stylesheets inside the iframe to replace oklch references with fallback rgb
                        clonedDoc.querySelectorAll('style').forEach(styleTag => {
                            if (styleTag.textContent) {
                                styleTag.textContent = resolveModernColors(styleTag.textContent)
                            }
                        })

                        const properties = [
                            'color', 'backgroundColor', 'borderColor',
                            'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
                            'fill', 'stroke', 'backgroundImage', 'boxShadow'
                        ]

                        for (let i = 0; i < elements.length; i++) {
                            const el = elements[i]
                            const computed = clonedDoc.defaultView ? clonedDoc.defaultView.getComputedStyle(el) : window.getComputedStyle(el)

                            properties.forEach(prop => {
                                const val = computed[prop]
                                if (val && typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                                    try {
                                        el.style[prop] = resolveModernColors(val)
                                    } catch (err) {}
                                }
                            })
                        }

                        // Force single page A4 layout constraints
                        const sheet = clonedDoc.querySelector('.printable-sheet')
                        if (sheet) {
                            sheet.style.width = '210mm'
                            sheet.style.height = '296mm'
                            sheet.style.minHeight = '296mm'
                            sheet.style.maxHeight = '296mm'
                            sheet.style.paddingLeft = '50px'
                            sheet.style.paddingRight = '50px'
                            sheet.style.paddingTop = '16px'
                            sheet.style.paddingBottom = '16px'
                            sheet.style.boxSizing = 'border-box'
                            sheet.style.borderRadius = '0px'
                            sheet.style.border = 'none'
                            sheet.style.boxShadow = 'none'
                            sheet.style.overflow = 'hidden'

                            // Force A4 layout width for bottom SVGs/images to fix the html2canvas width="100%" bug
                            const svgOrImgs = sheet.querySelectorAll('svg, img')
                            svgOrImgs.forEach((el) => {
                                const widthAttr = el.getAttribute('width')
                                const srcAttr = el.getAttribute('src') || ''
                                if (widthAttr === '100%' || el.style.width === '100%' || srcAttr.startsWith('data:image/svg+xml')) {
                                    if (el.style.width === '100%' || widthAttr === '100%') {
                                        el.setAttribute('width', '794')
                                        el.style.width = '794px'
                                    }
                                }
                            })

                            // Compact internal spacing
                            const bodyDiv = sheet.querySelector('.letter-body-content')
                            if (bodyDiv) {
                                bodyDiv.style.gap = '8px'
                                bodyDiv.style.lineHeight = '1.35'
                                bodyDiv.style.fontSize = '11px'
                            }
                            const signatureBlock = sheet.querySelector('.signature-block')
                            if (signatureBlock) {
                                signatureBlock.style.marginTop = '10px'
                                signatureBlock.style.paddingTop = '10px'
                            }
                        }
                    }
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }

            // Generate PDF as a blob
            const pdfBlob = await html2pdf().set(opt).from(sheetElement).output('blob')

            const formData = new FormData()
            formData.append('email', employeeEmail)
            formData.append('file', pdfBlob, fileName)

            const res = await dispatch(CompanyTerminationLetter(selectedId, formData))

            if (res?.data) {
                setModalData({
                    emailSentTo: res.data.emailSentTo || employeeEmail,
                    previewUrl: res.data.previewUrl || res.data.terminationLetterPDF || '',
                    status: res.data.status || 'SENT'
                })
                setModalError('')
                setShowModal(true)
            } else {
                setModalError(res?.message || 'Failed to generate termination letter. Please try again.')
                setShowModal(true)
            }
        } catch (err) {
            setModalError(err.response?.data?.message || err.message || 'An unexpected error occurred.')
            setShowModal(true)
        } finally {
            if (originalWindowGetComputedStyle) {
                window.getComputedStyle = originalWindowGetComputedStyle
            }
            setIsGenerating(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
            {/* Control Panel (Screen-only) */}
            <div className="no-print mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {/* Navigation & Header */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <OutlineBtn onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm">
                            <ArrowLeft size={16} /> Back to Hub
                        </OutlineBtn>
                        <h3 className="text-base font-extrabold text-gray-900">Termination Customizer</h3>
                    </div>

                    {/* Preload Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-500">Load Employee:</span>
                        <select
                            onChange={e => handleLoadEmployee(e.target.value)}
                            value={selectedId}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 cursor-pointer"
                        >
                            <option value="" disabled>Select Employee…</option>
                            {employees.map(emp => (
                                <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                                    {emp.fullName || emp.name} ({emp.designation || 'Employee'})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Input Fields Grid */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    
                    <div className="col-span-full border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-red-700">Employee Details</div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Employee Name (uppercase)</label>
                        <input type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value.toUpperCase())} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Employee ID</label>
                        <input type="text" value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Employee Email</label>
                        <input type="email" value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" placeholder="employee@example.com" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Designation</label>
                        <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Department</label>
                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Joining Date</label>
                        <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>

                    <div className="col-span-full mt-4 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-red-700">Termination Specifics</div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Termination Date</label>
                        <input type="date" value={terminationDate} onChange={e => setTerminationDate(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Last Working Day</label>
                        <input type="date" value={lastWorkingDay} onChange={e => setLastWorkingDay(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Notice Period Required</label>
                        <input type="text" value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" placeholder="e.g. Immediate, 30 Days" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Separation Type</label>
                        <select value={terminationType} onChange={e => setTerminationType(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 cursor-pointer">
                            <option value="Termination">Termination</option>
                            <option value="Separation">Separation</option>
                            <option value="Layoff">Layoff</option>
                            <option value="Resignation Acceptance">Resignation Acceptance</option>
                        </select>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Primary Reason</label>
                        <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" placeholder="e.g. Violation of Policy, Restructuring" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Additional Remarks / Instructions</label>
                        <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" placeholder="e.g. Asset handover requirements..." />
                    </div>

                    <div className="col-span-full mt-4 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-red-700">HR Signatory</div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">HR Signatory Name</label>
                        <input type="text" value={hrHeadName} onChange={e => setHrHeadName(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">HR Signatory Title</label>
                        <input type="text" value={hrHeadDesignation} onChange={e => setHrHeadDesignation(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100" />
                    </div>

                    <div className="col-span-full mt-4 border-b border-gray-100 pb-1 text-xs font-black uppercase tracking-wider text-red-700">Company Information (Read-Only)</div>
                    <div className="col-span-1 sm:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Company Name</label>
                        <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 select-none">{companyName || '—'}</div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Registered Office Address</label>
                        <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 select-none whitespace-pre-wrap">{companyRegAddress || '—'}</div>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <OutlineBtn onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 px-5 py-2 text-sm">
                        <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
                        {isGenerating ? "Generating..." : "Generate & Send Letter"}
                    </OutlineBtn>
                    <PrimaryBtn onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 text-sm">
                        <Printer size={16} /> Print / Export PDF
                    </PrimaryBtn>
                </div>
            </div>

            {/* Live Paper Document Sheet (Preview & Print container) */}
            <div ref={printableRef} className="printable-sheet" style={{
                background: '#fff',
                margin: '0 auto',
                maxWidth: '800px',
                minHeight: '297mm',
                padding: '30px 60px 0 60px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                color: '#1f2937',
                lineHeight: 1.4,
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                {/* Top-Right Decorative Accents */}
                <img 
                    src={DECORATIVE_SVGs.topGold} 
                    style={{ position: 'absolute', top: 0, right: 0, zIndex: 40, width: '295px', height: '86px', userSelect: 'none', pointerEvents: 'none' }}
                    alt="" 
                />
                <img 
                    src={DECORATIVE_SVGs.topGreen} 
                    style={{ position: 'absolute', top: 0, right: 0, zIndex: 50, width: '280px', height: '80px', userSelect: 'none', pointerEvents: 'none' }}
                    alt="" 
                />

                {/* Bottom Decorative Slanted Accents */}
                <img 
                    src={DECORATIVE_SVGs.bottomGold} 
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40, width: '100%', height: '47px', userSelect: 'none', pointerEvents: 'none' }}
                    width="100%"
                    height="47"
                    alt="" 
                />
                <img 
                    src={DECORATIVE_SVGs.bottomGreen} 
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, width: '100%', height: '40px', userSelect: 'none', pointerEvents: 'none' }}
                    width="100%"
                    height="40"
                    alt="" 
                />

                {/* Main Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 10 }}>

                    {/* Letterhead Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        {/* Logo & Brand */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {logoSrc ? (
                                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <img crossOrigin="anonymous" src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            ) : (
                                <div style={{ width: '36px', height: '36px', backgroundColor: '#115e59', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>🔬</div>
                            )}
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 900, color: '#115e59', fontFamily: "'Georgia', serif", letterSpacing: '0.8px', lineHeight: 1.1, textTransform: 'uppercase', maxWidth: '280px' }}>
                                    {companyName}
                                </div>
                                <div style={{ fontSize: '9px', color: '#374151', fontWeight: 700, letterSpacing: '0.5px', marginTop: '1px' }}>
                                    {user?.adminReferenceCode ? `Ref: ${user.adminReferenceCode}` : 'Since 1975'}
                                </div>
                            </div>
                        </div>

                        {/* Document Date */}
                        <div style={{ paddingRight: '100px', marginTop: '4px', fontSize: '11.5px', color: '#1f2937', fontWeight: 600 }}>
                            Date: {formatDateIN(terminationDate)}
                        </div>
                    </div>

                    {/* Reference & Title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11.5px' }}>
                        <div>
                            <strong>Ref:</strong> GPHR/HR/TERM/2026/{selectedId}
                        </div>
                    </div>

                    <h3 style={{
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: '#b91c1c',
                        borderBottom: '1.5px solid #b91c1c',
                        paddingBottom: '2px',
                        marginBottom: '10px',
                        letterSpacing: '1px'
                    }}>
                        {terminationType} Letter
                    </h3>

                    {/* Body Text */}
                    <div className="letter-body-content" style={{ fontSize: '11px', color: '#1f2937', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.45 }}>
                        <p style={{ margin: 0 }}>
                            To,<br />
                            <strong>{employeeName}</strong><br />
                            {designation} · {department}<br />
                            Employee ID: {selectedId}
                        </p>

                        <p style={{ margin: 0, fontWeight: 700, color: '#991b1b', backgroundColor: '#fef2f2', padding: '6px 10px', borderLeft: '3px solid #ef4444', borderRadius: '0 8px 8px 0' }}>
                            Subject: Formal Notice of Employment {terminationType}
                        </p>

                        <p style={{ margin: 0, textIndent: '40px' }}>
                            Dear {employeeName},
                        </p>

                        <p style={{ margin: 0, textIndent: '40px' }}>
                            This letter serves as formal notification that your employment with M/s. <strong>{companyName}</strong> is being concluded in the capacity of <strong>{terminationType.toLowerCase()}</strong>. This decision has been reached after careful consideration of all relevant factors.
                        </p>

                        <p style={{ margin: 0, textIndent: '40px' }}>
                            The reason for this separation is: <strong>{reason}</strong>.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '8px 10px', borderRadius: '8px', fontSize: '10.5px' }}>
                            <div>
                                <span style={{ color: '#6b7280', fontWeight: 700, display: 'block', fontSize: '8.5px', textTransform: 'uppercase' }}>Date of Joining</span>
                                <strong style={{ color: '#1f2937' }}>{formatDateIN(joiningDate) || "—"}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#6b7280', fontWeight: 700, display: 'block', fontSize: '8.5px', textTransform: 'uppercase' }}>Last Working Day</span>
                                <strong style={{ color: '#b91c1c' }}>{formatDateIN(lastWorkingDay || terminationDate)}</strong>
                            </div>
                        </div>

                        {noticePeriod && (
                            <p style={{ margin: 0, textIndent: '40px' }}>
                                As per your employment agreement, your notice period is designated as <strong>{noticePeriod}</strong>. You are required to fulfill all corresponding responsibilities during this phase unless explicitly excused by human resources.
                            </p>
                        )}

                        {remarks && (
                            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '6px 10px', borderRadius: '8px', fontSize: '10px', lineHeight: 1.35 }}>
                                <span style={{ color: '#92400e', fontWeight: 800, display: 'block', textTransform: 'uppercase', fontSize: '9px', marginBottom: '1px' }}>Special Instructions</span>
                                <p style={{ margin: 0, color: '#78350f', fontWeight: 500 }}>{remarks}</p>
                            </div>
                        )}

                        <p style={{ margin: 0, textIndent: '40px' }}>
                            You are requested to hand over all company properties, files, designs, databases, security keys, laptops, and other assets in your possession to your department head, and secure a signed clearance certificate prior to your departure. Your final full &amp; final settlement, including any accrued benefits, will be released upon successful asset verification.
                        </p>

                        <p style={{ margin: 0, textIndent: '40px' }}>
                            We appreciate the contributions you made during your tenure and wish you the best in your future career endeavors.
                        </p>
                    </div>

                    {/* Signatures Row */}
                    <div className="signature-block" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: 'auto',
                        paddingTop: '8px',
                        fontSize: '11px',
                        color: '#1f2937'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>Sincerely,</div>
                            <div style={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', marginBottom: '14px' }}>for {companyName},</div>

                            {/* Stamp or Signature */}
                            {stampSrc ? (
                                <div style={{ height: '48px', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                    <img crossOrigin="anonymous" src={stampSrc} alt="Stamp" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            ) : (
                                <div style={{
                                    fontFamily: "'Brush Script MT', cursive, sans-serif",
                                    fontSize: '22px',
                                    color: '#1e3a8a',
                                    height: '28px',
                                    lineHeight: 1,
                                    transform: 'rotate(-4deg) translateX(10px)',
                                    marginBottom: '2px',
                                    userSelect: 'none'
                                }}>
                                    {hrHeadName}
                                </div>
                            )}

                            <div style={{ borderBottom: '1px solid #4b5563', width: '140px', marginBottom: '3px' }}></div>
                            <div style={{ fontWeight: 800, fontSize: '10px' }}>{hrHeadName}</div>
                            <div style={{ fontSize: '9px', color: '#4b5563' }}>{hrHeadDesignation}</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10.5px', color: '#6b7280', marginBottom: '20px' }}>Acknowledgment Signature:</div>
                            <div style={{ borderBottom: '1px solid #4b5563', width: '140px', marginBottom: '3px', marginLeft: 'auto' }}></div>
                            <div style={{ fontWeight: 800, fontSize: '10px' }}>Employee Signature</div>
                            <div style={{ fontSize: '9px', color: '#4b5563' }}>Date: {formatDateIN(terminationDate)}</div>
                        </div>
                    </div>

                </div>

                {/* Footer address info */}
                <div style={{
                    textAlign: 'center',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '6px',
                    fontSize: '9px',
                    color: '#4b5563',
                    lineHeight: 1.3,
                    zIndex: 10,
                    marginTop: '10px',
                    paddingBottom: '50px'
                }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#b45309', fontFamily: "'Georgia', serif", letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {companyName}
                    </div>
                    {companyRegAddress && <div>{companyRegAddress}</div>}
                    {hrEmail && <div style={{ fontWeight: 600 }}>Email: {hrEmail}</div>}
                </div>
            </div>

            {/* Status Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl transition-all">
                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                        >
                            <X size={18} />
                        </button>

                        {modalError ? (
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                                    <X size={24} className="text-red-500" />
                                </div>
                                <h3 className="text-base font-extrabold text-gray-900">Generation Failed</h3>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">{modalError}</p>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="mt-2 w-full rounded-xl bg-gray-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-gray-900 shadow-sm cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center gap-2 text-center mb-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                        <CheckCircle2 size={28} className="text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">Letter Dispatched!</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
                                        The termination certificate has been successfully generated and emailed.
                                    </p>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                                            <Mail size={16} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block">Email Sent To</span>
                                            <span className="text-xs font-bold text-gray-900">{modalData.emailSentTo}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block">Delivery Status</span>
                                            <span className="inline-block text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/70 border border-emerald-200/50 px-2 py-0.5 rounded-full mt-0.5">
                                                {modalData.status}
                                            </span>
                                        </div>
                                    </div>

                                    {modalData.previewUrl && (
                                        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-3.5">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                                                <FileText size={16} className="text-amber-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block">Preview Reference</span>
                                                <a
                                                    href={getFullAssetUrl(modalData.previewUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                                                >
                                                    Open Document <ExternalLink size={11} className="shrink-0" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full rounded-2xl bg-gray-950 py-3 text-sm font-extrabold text-white transition hover:bg-gray-900 shadow-sm cursor-pointer"
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}