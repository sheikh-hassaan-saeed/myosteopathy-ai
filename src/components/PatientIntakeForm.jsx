import { use, useState } from 'react'

const STEPS = 2

const PatientIntakeForm = () => {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({ fullName: '', age: '', phone: '' })
    const [errors, setErrors] = useState({})
    const [symptoms, setSymptoms] = useState("")
    const [aiResponse, setAiResponse] = useState("")
    const [aiError, setAiError] = useState("")
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    const validateStep1 = () => {
        const next = {}
        if (!form.fullName.trim()) next.fullName = 'Full name is required.'
        if (!form.age.trim()) next.age = 'Age is required.'
        else if (isNaN(form.age) || +form.age < 1 || +form.age > 120) next.age = 'Enter a valid age.'
        if (!form.phone.trim()) next.phone = 'Phone number is required.'
        return next
    }

    const handleNext = () => {
        const errs = validateStep1()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setStep(2)
    }

    const AnalyzeAI = async () => {
        setLoading(true)
        setAiError("")
        setAiResponse("")
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant for MyOsteopathy clinic. Analyze patient symptoms and recommend the most suitable treatment from: Osteopathy, Sports Massage, or Rehabilitation."
                        },
                        {
                            role: "user",
                            content: `Patient: ${form.fullName}, Age: ${form.age}, Symptoms: ${symptoms}`
                        }
                    ]
                })
            })
            const data = await response.json()
            if (!response.ok) {
                setAiError(data.error?.message || "API request failed. Please check your API key.")
                return
            }
            setAiResponse(data.choices[0].message.content)
        } catch (err) {
            setAiError("Something went wrong. Please try again.")
            console.log(err)
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center sm:p-6">
            <div className="w-full max-w-4xl bg-white sm:rounded-3xl shadow-md overflow-hidden flex flex-col sm:flex-row">

                {/* ── Left panel ── */}
                <div className="sm:w-2/5 bg-linear-to-b from-teal-50 to-white flex flex-col justify-between px-5 py-8 sm:px-8 sm:py-12">
                    <div>
                        {/* Icon + clinic image side by side */}
                        <div className="flex items-center  mb-16">
                            <div className="w-14 h-14 rounded-full bg-teal-400 flex items-center justify-center shadow-sm shrink-0">
                                <img src='/assets/images/myicon.svg' className="w-12 h-12 object-contain" />
                            </div>
                            <div className=" overflow-hidden flex-1">
                                <img src='/assets/images/MyOsteopahty_AI.jpeg' className="w-full h-14 object-cover" />
                            </div>
                        </div>

                        {/* Text content */}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
                                Check Your Symptoms
                            </h1>
                            <p className="text-md text-gray-500 leading-relaxed">
                                Tell us about yourself to get started.
                            </p>
                        </div>
                    </div>

                    {/* Step dots */}
                    <div className="flex items-center gap-2">
                        {Array.from({ length: STEPS }).map((_, i) => (
                            <span
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 bg-teal-400' : 'w-2 bg-gray-200'
                                    }`}
                            />
                        ))}
                        <span className="ml-2 text-sm text-gray-400 font-medium">Step {step} of {STEPS}</span>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="sm:w-3/5 px-5 py-8 sm:px-8 sm:py-12 flex flex-col justify-center">
                    {step === 1 && (
                        <>
                            <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-1">Step 1</p>
                            <h2 className="text-xl font-bold text-gray-900 mb-8">Personal Information</h2>

                            {/* Full Name */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={set('fullName')}
                                    placeholder="e.g. Sarah Johnson"
                                    className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-300 transition ${errors.fullName ? 'ring-2 ring-red-300 bg-red-50' : ''
                                        }`}
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Age */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Age <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={form.age}
                                    onChange={set('age')}
                                    placeholder="e.g. 34"
                                    min="1"
                                    max="120"
                                    className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-300 transition ${errors.age ? 'ring-2 ring-red-300 bg-red-50' : ''
                                        }`}
                                />
                                {errors.age && (
                                    <p className="mt-1 text-xs text-red-500">{errors.age}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={set('phone')}
                                    placeholder="e.g. 07700 900123"
                                    className={`w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-300 transition ${errors.phone ? 'ring-2 ring-red-300 bg-red-50' : ''
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                                )}
                            </div>

                            <button
                                onClick={handleNext}
                                className="w-full cursor-pointer bg-teal-400 hover:bg-teal-500 text-white font-semibold text-md rounded-full py-3.5 transition-colors duration-200 shadow-sm"
                            >
                                Next &rarr;
                            </button>

                            <p className="text-center text-sm text-gray-400 mt-4">
                                Already registered?{' '}
                                <a href="https://portal.myosteopathy.io/login" className="text-teal-500 hover:underline font-medium">
                                    Log in here
                                </a>
                            </p>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-1">Step 2</p>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">What brings you in?</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Hi <span className="font-medium text-gray-700">{form.fullName}</span>, describe your symptoms in as much detail as you can.
                            </p>

                            <textarea
                                rows={6}
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="e.g. I've had lower back pain for the past two weeks, it gets worse when I sit for long periods..."
                                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-300 transition resize-none mb-6"
                            />

                            <button
                                className="w-full cursor-pointer bg-teal-400 hover:bg-teal-500 text-white font-semibold text-sm rounded-full py-3.5 transition-colors duration-200 shadow-sm"
                                onClick={AnalyzeAI}
                                disabled={loading}
                            >
                                {loading ? "Analyzing" : "✦ Analyse with AI"}
                            </button>

                            {aiError && (
                                <div className="mt-4 bg-red-50 rounded-xl p-4 text-sm text-red-600">
                                    {aiError}
                                </div>
                            )}

                            {aiResponse && (
                                <div className="mt-6 bg-teal-50 rounded-xl p-5 text-sm text-gray-700">
                                    <p className="font-semibold text-teal-600 mb-2">AI Recommendation</p>
                                    <p>{aiResponse}</p>
                                    <a href='https://booking.myosteopathy.io/jsMqS1KQrF/QoCKik7TznoouPI'> <button className="mt-4 w-full bg-teal-400 text-white rounded-full cursor-pointer py-3 font-semibold">
                                        Book Appointment →
                                    </button></a>
                                </div>
                            )}

                            <button
                                onClick={() => setStep(1)}
                                className="mt-3 w-full border border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-500 font-medium text-sm rounded-full py-3.5 transition-colors duration-200"
                            >
                                &larr; Back
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PatientIntakeForm
