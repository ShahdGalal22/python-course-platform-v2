import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useCourseContent } from "../hooks/useCourseContent.js";

const features = [
  { icon: "🎯", title: "Beginner-first", text: "No prior experience needed — every concept builds on the last." },
  { icon: "🎥", title: "Bite-sized videos", text: "Short, focused lessons you can watch between classes." },
  { icon: "🧩", title: "Practical coding", text: "Real code you type and run, not just slides." },
  { icon: "📱", title: "Learn anywhere", text: "Works comfortably on your phone, tablet, or laptop." }
];

const testimonials = [
  { name: "Layla, 16", quote: "I finally understand loops. The examples actually made sense." },
  { name: "Omar, 18", quote: "Went from zero to writing my own small scripts in a few weeks." },
  { name: "Nour, 17", quote: "Explained simply, no confusing jargon. Exactly what I needed." }
];

const faqs = [
  { q: "Do I need any experience?", a: "No — this course starts from the very basics and builds up gradually." },
  { q: "What do I need to get started?", a: "Just a computer (or even a phone/tablet to watch lessons) and curiosity." },
  { q: "How do I get access to lessons?", a: "Register for a free account, then unlock each lesson with the access code you receive after registering or paying." },
  { q: "Can I watch on my phone?", a: "Yes — the whole platform, including the video player, is fully responsive." }
];

export default function LandingPage() {
  const { sessions, loading } = useCourseContent();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        <div className="inline-flex items-center gap-2 font-mono text-xs text-mint-dim dark:text-mint-bright bg-mint/10 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-blink" />
          beginner friendly · self-paced
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight mb-5 max-w-3xl mx-auto">
          Learn Python, one clear lesson at a time.
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Learn Python step by step through simple explanations and practical coding.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn-primary w-full sm:w-auto px-8">Start learning </Link>
          <a href="#course" className="btn-secondary w-full sm:w-auto px-8">See the curriculum</a>
        </div>
      </section>

      {/* About the course */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">About the course</h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
          Python Basics is a practical, video-based course built for students who are brand new to
          programming. Each session introduces one idea at a time — with plain explanations first,
          then real code — so you always know why something works, not just how to type it.
        </p>
      </section>

      {/* Why learn Python */}
      <section className="bg-paper-surface dark:bg-ink-soft py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">Why learn Python?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card p-5">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-display font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="course" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-2">Course curriculum</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-10">
          {sessions.reduce((n, s) => n + s.lessons.length, 0) || "Several"} lessons across {sessions.length || "five"} sessions.
        </p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-32" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s, i) => (
              <div key={s.id} className="card p-5">
                <span className="font-mono text-xs text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display font-semibold mt-1 mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{s.description}</p>
                <span className="text-xs font-mono text-slate-400">{s.lessons.length} lesson{s.lessons.length !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Instructor */}
      <section id="instructor" className="bg-paper-surface dark:bg-ink-soft py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
          <div className="w-28 h-28 rounded-full bg-mint/15 flex items-center justify-center text-4xl shrink-0">👩‍🏫</div>
          <div>
            <h2 className="font-display text-2xl font-bold mb-1">Meet your instructor</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Shahd Mohamed Galal
              a Python instructor with a passion for teaching programming in a simple, engaging, and practical way.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">What students say</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-5">
              <p className="text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <p className="text-xs font-mono text-slate-400">— {t.name}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Placeholder testimonials — replace with real student feedback.</p>
      </section>

      {/* Pricing */}
      <section className="bg-paper-surface dark:bg-ink-soft py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8">Pricing</h2>
          <div className="card p-8">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">One-time</p>
            <p className="font-display text-4xl font-bold mb-4">Contact for price</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Pay via InstaPay, then receive your access codes on WhatsApp.
            </p>
            <Link to="/register" className="btn-primary w-full">Register to get started</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <details key={f.q} className="card p-5 group">
              <summary className="font-display font-medium cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <span className="text-slate-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
