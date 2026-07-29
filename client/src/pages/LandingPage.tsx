import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  BarChart3,
  Brain,
  Users,
  ArrowRight,
  Star,
  BookOpen,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { ROUTES } from '@/constants'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { PageMeta } from '@/components/seo'
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll'

export const LandingPage = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const ctaLink = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <PageMeta
        title="ReviewCerts - Pass Your Certification Exam on the First Try"
        description="Practice with 50,000+ real-world questions, track weaknesses with smart analytics, and pass IT certification exams with confidence. Free to start."
        canonical="https://reviewcerts.com"
        ogImage="/og-image.png"
      />
      <LandingNav />

      {/* ═══════════ Hero ═══════════ */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36">
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 size-80 sm:size-[500px] rounded-full bg-indigo-100/60 blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 size-80 sm:size-[500px] rounded-full bg-violet-100/50 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-60 sm:size-[400px] rounded-full bg-sky-100/40 blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)] opacity-40" />

        <div className="mx-auto max-w-5xl px-5 sm:px-6 text-center">
          {/* Badge — fade in */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-indigo-100 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 mb-6 sm:mb-8 shadow-sm animate-fade-in-up">
            <Sparkles className="size-3.5 text-indigo-500" />
            <span>Trusted by 10,000+ learners worldwide</span>
          </div>

          {/* Heading — staggered fade in */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.15] sm:leading-[1.1] animate-fade-in-up animation-delay-150">
            Pass your certification exam{' '}
            <span className="relative inline-block text-indigo-600">
              on the first try
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-1 left-0 w-full h-3 text-indigo-200"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 C50 2, 150 2, 198 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  className="animate-draw-line"
                />
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0 animate-fade-in-up animation-delay-300">
            Practice with real-world questions, track your weaknesses, and build confidence. The
            smartest way to prepare for IT certification exams.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-450">
            <Link
              to={ctaLink}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300/40 active:scale-[0.97] hover:-translate-y-0.5"
            >
              Start Practicing Free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('features')
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - 64
                  window.scrollTo({ top, behavior: 'smooth' })
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all hover:-translate-y-0.5"
            >
              See How It Works
            </a>
          </div>

          {/* Social proof stats — animated counters */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 transition-transform group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Features ═══════════ */}
      <section id="features" className="py-16 sm:py-20 lg:py-28 bg-gray-50/70 relative">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionHeader
            title="Everything you need to ace your exam"
            subtitle="A complete platform designed by certified professionals who understand what it takes to pass."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ How It Works ═══════════ */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-28 relative">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-indigo-50/50 to-transparent blur-3xl -z-10" />

        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <SectionHeader
            title="Three steps to certification success"
            subtitle="Our proven methodology gets you exam-ready in weeks, not months."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} total={STEPS.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Pricing ═══════════ */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-28 bg-gray-50/70 relative">
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <SectionHeader
            title="Simple, transparent pricing"
            subtitle="Start free. Upgrade when you are ready to unlock the full experience."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch max-w-sm md:max-w-none mx-auto">
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} ctaLink={ctaLink} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Final CTA ═══════════ */}
      <section className="py-16 sm:py-20 lg:py-28 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(99,102,241,0.06),transparent)]" />

        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <FinalCta ctaLink={ctaLink} />
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const ref = useAnimateOnScroll<HTMLDivElement>()
  return (
    <div ref={ref} className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 animate-on-scroll">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{title}</h2>
      <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 px-2 sm:px-0">{subtitle}</p>
    </div>
  )
}

function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const ref = useAnimateOnScroll<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className="animate-on-scroll p-5 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg hover:border-indigo-100 transition-all duration-300 ease-out will-change-[transform,box-shadow] hover:-translate-y-1 group"
      style={{ transitionDelay: `${index * 75}ms` }}
    >
      <div
        className={`inline-flex p-2.5 sm:p-3 rounded-xl ${feature.iconBg} transition-transform duration-300 ease-out will-change-transform group-hover:scale-110`}
      >
        {feature.icon}
      </div>
      <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900">
        {feature.title}
      </h3>
      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}

function StepCard({
  step,
  index,
  total,
}: {
  step: (typeof STEPS)[number]
  index: number
  total: number
}) {
  const ref = useAnimateOnScroll<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className="animate-on-scroll relative text-center"
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Step number with pulse ring */}
      <div className="relative inline-flex items-center justify-center size-12 sm:size-14 rounded-2xl bg-indigo-600 text-white text-lg sm:text-xl font-bold mb-4 sm:mb-5 shadow-lg shadow-indigo-200">
        {index + 1}
        <div className="absolute inset-0 rounded-2xl bg-indigo-600/30 animate-ping-slow" />
      </div>

      {/* Desktop connector */}
      {index < total - 1 && (
        <div className="hidden md:block absolute top-6 sm:top-7 left-[60%] w-[80%] h-px">
          <div className="h-full border-t-2 border-dashed border-gray-200 animate-dash" />
        </div>
      )}

      {/* Mobile connector */}
      {index < total - 1 && (
        <div className="md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 h-3 w-px border-l-2 border-dashed border-gray-200" />
      )}

      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{step.title}</h3>
      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-600 max-w-xs mx-auto">
        {step.description}
      </p>
    </div>
  )
}

function PricingCard({ plan, ctaLink }: { plan: (typeof PLANS)[number]; ctaLink: string }) {
  const ref = useAnimateOnScroll<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`animate-on-scroll relative p-6 sm:p-7 rounded-2xl border flex flex-col transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-[transform,box-shadow] hover:-translate-y-1 ${
        plan.featured
          ? 'border-indigo-200 bg-white shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-100 order-first md:order-none hover:shadow-2xl hover:shadow-indigo-200/50'
          : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300'
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-md">
          <Star className="size-3" fill="currentColor" />
          Most Popular
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>

      <div className="mt-4 sm:mt-5 flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
        {plan.period && <span className="text-gray-500">/{plan.period}</span>}
      </div>

      <Link
        to={ctaLink}
        className={`mt-5 sm:mt-6 block w-full text-center py-3 px-4 rounded-xl font-semibold transition-all active:scale-[0.97] ${
          plan.featured
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-200 hover:shadow-lg'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {plan.cta}
      </Link>

      <ul className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
            <CheckCircle2 className="size-4 text-indigo-500 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FinalCta({ ctaLink }: { ctaLink: string }) {
  const ref = useAnimateOnScroll<HTMLDivElement>()
  return (
    <div ref={ref} className="animate-on-scroll">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
        Ready to pass your next certification?
      </h2>
      <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
        Join thousands of professionals who passed their exams with Review Certs. Start practicing
        today, for free.
      </p>
      <Link
        to={ctaLink}
        className="group mt-7 sm:mt-8 inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200/60 hover:shadow-xl hover:shadow-indigo-300/50 active:scale-[0.97] hover:-translate-y-0.5 text-base sm:text-lg"
      >
        Get Started Free
        <ArrowRight className="size-4 sm:size-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '50,000+', label: 'Practice Questions' },
  { value: '95%', label: 'Pass Rate' },
  { value: '200+', label: 'Exam Topics' },
  { value: '4.9/5', label: 'User Rating' },
]

const FEATURES = [
  {
    icon: <Brain className="size-5 text-indigo-600" />,
    iconBg: 'bg-indigo-50',
    title: 'Smart Question Bank',
    description:
      'Curated questions that mirror real exam formats. Updated regularly to match the latest exam objectives.',
  },
  {
    icon: <BarChart3 className="size-5 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    title: 'Performance Analytics',
    description:
      'Detailed breakdown of your strengths and weaknesses. Know exactly where to focus your study time.',
  },
  {
    icon: <Target className="size-5 text-amber-600" />,
    iconBg: 'bg-amber-50',
    title: 'Goal Tracking',
    description:
      'Set target scores and deadlines. Get daily study reminders and progress updates to stay on track.',
  },
  {
    icon: <Users className="size-5 text-blue-600" />,
    iconBg: 'bg-blue-50',
    title: 'Study Groups',
    description:
      'Learn together with peers. Share progress, compete on leaderboards, and motivate each other.',
  },
  {
    icon: <Clock className="size-5 text-rose-600" />,
    iconBg: 'bg-rose-50',
    title: 'Timed Practice Exams',
    description:
      'Simulate real exam conditions with timed tests. Build time management skills under pressure.',
  },
  {
    icon: <BookOpen className="size-5 text-violet-600" />,
    iconBg: 'bg-violet-50',
    title: 'Detailed Explanations',
    description:
      'Every question comes with a thorough explanation. Understand the "why" behind each answer.',
  },
]

const STEPS = [
  {
    title: 'Choose Your Exam',
    description:
      'Browse our catalog of 200+ certification topics. Select the exam you want to prepare for.',
  },
  {
    title: 'Practice & Learn',
    description:
      'Take practice tests, review explanations, and track your progress with smart analytics.',
  },
  {
    title: 'Pass with Confidence',
    description:
      'Hit your target score consistently in practice and walk into the real exam fully prepared.',
  },
]

const PLANS = [
  {
    name: 'Free',
    tagline: 'For casual learners',
    price: '$0',
    period: null,
    cta: 'Start Free',
    featured: false,
    features: [
      'Access to 500+ free questions',
      'Basic progress tracking',
      '1 practice exam per day',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    tagline: 'For serious exam takers',
    price: '$19',
    period: 'month',
    cta: 'Start 7-Day Free Trial',
    featured: true,
    features: [
      'Full question bank (50,000+)',
      'Advanced analytics & weakness map',
      'Unlimited practice exams',
      'Study groups & leaderboards',
      'Goal tracking with reminders',
      'Priority support',
    ],
  },
  {
    name: 'Team',
    tagline: 'For organizations',
    price: '$49',
    period: 'month',
    cta: 'Contact Sales',
    featured: false,
    features: [
      'Everything in Pro',
      'Up to 25 team members',
      'Admin dashboard & reporting',
      'Custom question sets',
      'SSO & SAML integration',
      'Dedicated account manager',
    ],
  },
]
