import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Flame,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { BrandMark } from "@/components/shared/BrandMark";

const tools = [
  {
    number: "01",
    icon: FileText,
    title: "Build a clear, polished resume",
    description:
      "Build a focused resume from your real experience, then export a clean, selectable PDF.",
    href: "/templates",
    linkLabel: "Explore resume templates",
  },
  {
    number: "02",
    icon: Target,
    title: "Check your fit for a role",
    description:
      "Compare your resume with a job description and find the gaps worth addressing.",
    href: "/tools/ats-resume-checker",
    linkLabel: "Check a resume",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Tailor each application",
    description:
      "Adapt your resume and cover letter to the role without losing your voice or overstating your experience.",
    href: "/tools/resume-tailor",
    linkLabel: "Tailor your resume",
  },
];

const freeIncludes = [
  "Resume drafts and templates",
  "Daily resume checks",
  "Resume roast evaluations",
  "PDF export",
];

const proIncludes = [
  "Unlimited resume drafts",
  "Unlimited resume checks",
  "Resume tailoring and cover letters",
  "More room to refine every application",
];

function ProductPreview() {
  return (
    <div className="home-preview" aria-label="Illustrative Hicejo resume workspace">
      <div className="home-preview-toolbar">
        <div className="home-window-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="home-preview-label">Hicejo workspace</span>
        <span className="home-preview-status">
          <span />
          Your work, saved
        </span>
      </div>

      <div className="home-preview-body">
        <aside className="home-preview-rail" aria-hidden="true">
          <div className="home-rail-mark">
            <Sparkles size={17} strokeWidth={1.8} />
          </div>
          <span className="home-rail-icon home-rail-icon-active">
            <FileText size={17} />
          </span>
          <span className="home-rail-icon">
            <Target size={17} />
          </span>
          <span className="home-rail-icon">
            <ShieldCheck size={17} />
          </span>
        </aside>

        <div className="home-preview-content">
          <div className="home-preview-heading">
            <div>
              <p className="home-overline">YOUR RESUME</p>
              <h2>Product designer</h2>
            </div>
            <span className="home-preview-tag">Sample workspace</span>
          </div>

          <div className="home-document-layout">
            <div className="home-resume-sheet">
              <div className="home-resume-heading">
                <span className="home-resume-avatar">AM</span>
                <div>
                  <strong>Alex Morgan</strong>
                  <span>Product Designer</span>
                </div>
                <span className="home-resume-more">···</span>
              </div>
              <div className="home-resume-contact">
                <span>San Francisco, CA</span>
                <span>alexmorgan.design</span>
              </div>
              <div className="home-resume-section">
                <b>EXPERIENCE</b>
                <div className="home-resume-role">
                  <strong>Senior Product Designer</strong>
                  <span>Northstar · 2022 — Present</span>
                  <i className="home-resume-line home-resume-line-long" />
                  <i className="home-resume-line" />
                  <i className="home-resume-line home-resume-line-short" />
                </div>
                <div className="home-resume-role">
                  <strong>Product Designer</strong>
                  <span>Studio Field · 2019 — 2022</span>
                  <i className="home-resume-line home-resume-line-long" />
                  <i className="home-resume-line home-resume-line-short" />
                </div>
              </div>
              <div className="home-resume-section home-resume-skills">
                <b>SELECTED SKILLS</b>
                <div>
                  <span>Prototyping</span>
                  <span>Research</span>
                  <span>Systems thinking</span>
                </div>
              </div>
            </div>

            <div className="home-insight-card">
              <div className="home-insight-icon">
                <Target size={16} />
              </div>
              <div className="home-insight-copy">
                <span>ROLE ALIGNMENT</span>
                <strong>Make your impact easier to see</strong>
              </div>
              <div className="home-insight-rule">
                <span />
              </div>
              <p>
                Your experience is relevant. Add a specific outcome to make it
                stronger.
              </p>
              <div className="home-insight-action">
                <span>Review suggestion</span>
                <ArrowRight size={14} />
              </div>
              <span className="home-sample-note">Example suggestion</span>
            </div>
          </div>
        </div>
      </div>
      <div className="home-preview-foot">
        <span><LockKeyhole size={13} /> You decide what to change</span>
        <span>A sample of the Hicejo workspace</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="home-page">
        <section className="home-hero">
          <div className="home-hero-grid" aria-hidden="true" />
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <p className="home-eyebrow">
                <span className="home-eyebrow-spark"><Sparkles size={13} /></span>
                Resume tools for your next move
              </p>
              <h1>
                Build a stronger
                <br />
                <em>resume for each role.</em>
              </h1>
              <p className="home-hero-description">
                Create a clear resume, see how it matches a job description,
                and get practical help improving your application and preparing
                for interviews—without inventing experience.
              </p>
              <div className="home-hero-actions">
                <Link href="/register" className="home-button home-button-primary">
                  Build your resume <ArrowRight size={16} />
                </Link>
                <Link href="#how-it-works" className="home-button home-button-secondary">
                  See how it works
                </Link>
              </div>
              <div className="home-hero-reassurance">
                <Check size={14} />
                <span>Free to start</span>
                <span className="home-reassurance-dot">·</span>
                <span>No credit card required</span>
              </div>
            </div>
            <div className="home-hero-art">
              <div className="home-orbit home-orbit-one" aria-hidden="true" />
              <div className="home-orbit home-orbit-two" aria-hidden="true" />
              <ProductPreview />
              <div className="home-hero-note">
                <span className="home-note-icon"><ShieldCheck size={16} /></span>
                <span><strong>Your experience stays yours.</strong><br />AI guidance grounded in your work.</span>
              </div>
            </div>
          </div>
          <div className="home-hero-bottom">
            <span>Less guesswork.</span>
            <span className="home-hero-bottom-line" />
            <span>More clarity at every step.</span>
          </div>
        </section>

        <section className="home-how section-shell" id="how-it-works">
          <div className="home-section-intro">
            <p className="home-overline">A CLEARER JOB SEARCH</p>
            <h2>From first draft<br />to <em>interview-ready.</em></h2>
            <p>
              Build from your experience, compare your resume with a role, and
              practice for the conversations that come next.
            </p>
          </div>
          <div className="home-steps">
            {[
              { number: "01", title: "Build your resume", text: "Bring your real experience together in a clear, focused resume." },
              { number: "02", title: "Match it to the role", text: "Compare your resume with a job description and spot what needs attention." },
              { number: "03", title: "Prepare for interviews", text: "Refine your application and practice explaining the work you have actually done." },
            ].map((step) => (
              <article className="home-step" key={step.number}>
                <span className="home-step-number">{step.number}</span>
                <div className="home-step-marker" aria-hidden="true"><span /></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-tools section-shell" id="product">
          <div className="home-tools-heading">
            <div>
              <p className="home-overline">YOUR JOB SEARCH, IN ONE WORKSPACE</p>
              <h2>Build. Match.<br /><em>Get ready.</em></h2>
            </div>
            <p>
              Create and improve your resume, check it against a role, and get
              focused support for applications and interview practice.
            </p>
          </div>
          <div className="home-tool-grid">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <article className="home-tool-card" key={tool.number}>
                  <div className="home-tool-card-top">
                    <span className="home-tool-icon"><Icon size={19} strokeWidth={1.7} /></span>
                    <span className="home-tool-number">{tool.number}</span>
                  </div>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                  <Link href={tool.href} className="home-text-link">
                    {tool.linkLabel} <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
          <Link href="/tools/resume-roast" className="home-extra-tool">
            <span className="home-extra-tool-icon"><Flame size={16} /></span>
            <span><strong>Want another perspective?</strong> Get direct, actionable feedback with Resume Roast.</span>
            <span className="home-extra-tool-link">Take a look <ArrowRight size={14} /></span>
          </Link>
        </section>

        <section className="home-principles">
          <div className="home-principles-inner">
            <div className="home-principles-copy">
              <p className="home-overline">A LITTLE LESS AI NOISE</p>
              <h2>Good help should make your work sound <em>more like you.</em></h2>
              <p>
                Your resume should reflect your experience—not a machine&apos;s
                imagination. Hicejo helps you shape the evidence you already
                have, so you can stand behind every word.
              </p>
              <Link href="/security" className="home-text-link home-light-link">
                How we think about your data <ArrowRight size={15} />
              </Link>
            </div>
            <div className="home-principle-list">
              <div className="home-principle">
                <span className="home-principle-icon"><ShieldCheck size={18} /></span>
                <div>
                  <h3>Evidence over exaggeration</h3>
                  <p>Make real contributions clearer. Never pad a resume with invented achievements.</p>
                </div>
              </div>
              <div className="home-principle">
                <span className="home-principle-icon"><Target size={18} /></span>
                <div>
                  <h3>Guidance, not guesswork</h3>
                  <p>Get specific suggestions you can assess, edit, and make your own.</p>
                </div>
              </div>
              <div className="home-principle">
                <span className="home-principle-icon"><LockKeyhole size={18} /></span>
                <div>
                  <h3>Your application, your call</h3>
                  <p>You stay in control of what to change and what to share.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-pricing section-shell" id="pricing">
          <div className="home-pricing-intro">
            <p className="home-overline">STRAIGHTFORWARD PRICING</p>
            <h2>Start where you are.</h2>
            <p>Build a better application at your own pace. No pressure, no card to get started.</p>
          </div>
          <div className="home-price-grid">
            <article className="home-price-card">
              <p className="home-price-name">Free</p>
              <p className="home-price-description">The essentials for getting started.</p>
              <p className="home-price-amount">$0 <span>/ month</span></p>
              <Link href="/register" className="home-button home-button-secondary home-price-button">
                Get started free <ArrowRight size={15} />
              </Link>
              <ul>
                {freeIncludes.map((item) => (
                  <li key={item}><Check size={15} />{item}</li>
                ))}
              </ul>
            </article>
            <article className="home-price-card home-price-card-featured">
              <span className="home-price-label">For the active search</span>
              <p className="home-price-name">Career Pro</p>
              <p className="home-price-description">More room to focus on the right opportunity.</p>
              <p className="home-price-amount">$12 <span>/ month</span></p>
              <Link href="/register" className="home-button home-button-primary home-price-button">
                Explore Career Pro <ArrowRight size={15} />
              </Link>
              <ul>
                {proIncludes.map((item) => (
                  <li key={item}><Check size={15} />{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="home-final-cta">
          <div className="home-final-cta-inner">
            <span className="home-final-spark"><Sparkles size={18} /></span>
            <p className="home-overline">YOUR NEXT MOVE, ON YOUR TERMS</p>
            <h2>Ready to make your experience<br />easier to see?</h2>
            <p>Start with what you have. Build from there.</p>
            <Link href="/register" className="home-button home-button-light">
              Start building for free <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-brand">
            <Link href="/" className="home-wordmark">
              <span className="home-footer-mark"><BrandMark className="h-5 w-5" /></span>
              Hice<span>jo</span>
            </Link>
            <p>A more thoughtful way to move your career forward.</p>
          </div>
          <div className="home-footer-links">
            <div>
              <span>TOOLS</span>
              <Link href="/templates">Resume templates</Link>
              <Link href="/tools/ats-resume-checker">Resume checker</Link>
              <Link href="/tools/resume-tailor">Resume tailor</Link>
              <Link href="/tools/cover-letter-generator">Cover letters</Link>
            </div>
            <div>
              <span>EXPLORE</span>
              <Link href="/blog">Career notes</Link>
              <Link href="/about">About Hicejo</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div>
              <span>THE DETAILS</span>
              <Link href="/security">Security</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>© {new Date().getFullYear()} Hicejo. Built for your next chapter.</span>
          <span>Thoughtful tools for your next career move.</span>
        </div>
      </footer>
    </>
  );
}
