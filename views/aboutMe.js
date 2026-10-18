// About Me page for Cinemetrics — portfolio-style profile for the site owner.

import html from "html-literal";
import profilePhoto from "url:../Assets/images/profile/james-nguyen.png";
import portfolioScreenshot from "url:../Assets/images/portfolio/portfolio-site.jpg";
import baitAndSwitchScreenshot from "url:../Assets/images/portfolio/bait-and-switch.jpg";
import cinemetricsScreenshot from "url:../Assets/images/portfolio/cinemetrics-site.jpg";

const SKILL_GROUPS = [
  {
    title: "Languages & Frameworks",
    skills: ["JavaScript (ES6+)", "HTML5 & CSS3", "Node.js + Express", "MongoDB + Mongoose & SQLite", "SQL / PostgreSQL / SQLAlchemy ORM", "Python (Pandas, FastAPI, Automations)"]
  },
  {
    title: "Frontend",
    skills: ["Navigo Router (SPA Routing)", "html-literal templating", "Responsive UI & Modern CSS"]
  },
  {
    title: "Backend & APIs",
    skills: ["FastAPI & RESTful API Design", "JWT Authentication", "TMDB API Integration", "Data Engineering & ETL Pipelines"]
  },
  {
    title: "Cloud & DevOps",
    skills: ["Netlify (Frontend)", "Render (Backend)", "Environment Variables (.env)", "Git & GitHub"]
  },
  {
    title: "Other Tools",
    skills: ["VS Code & Jupyter", "Postman", "QuickBooks Enterprise, SAP, SAGE CRE 300", "Financial Modeling", "Excel Automation (openpyxl)"]
  }
];

const ACCOMPLISHMENTS = [
  "Integrated TMDB API for real-time movie, TV, and people data",
  "Built account creation, secure login, and JWT session handling",
  "User comment system backed by MongoDB, with live moderation controls",
  "Custom UI inspired by cinematic streaming interfaces",
  "Backend email automation for user onboarding",
  "Fully deployed on Netlify + Render with environment isolation"
];

const HIGHLIGHTS = [
  { stat: "9866ms → 5ms", label: "Response time on the Marvel route, after adding a response-cache layer and a boot-time warm-up" },
  { stat: "19 sources", label: "News outlets deduped and balanced so no single wire dominates the feed" },
  { stat: "11 devices", label: "Verified responsive layout — iPhone 15/16/17, Pixel 8/9/10, Galaxy S24, Z Flip 7, Z Fold 7" },
  { stat: "0 frameworks", label: "No React — native ES modules, a hand-rolled component layer, and an Express API" }
];

const EXPERIENCE = [
  {
    company: "Day & Night Solar",
    title: "Finance & Operations Analyst · Internal Developer",
    dates: "Oct 2025 — Present",
    location: "Collinsville, IL",
    bullets: [
      "Sole developer of the internal operations platform (Python + SQLite) for a commercial solar and energy-storage contractor, consolidating accounting, banking, project, and procurement data into normalized workflows and generated reporting.",
      "Established a source-of-truth architecture: the accounting system stays authoritative, while databases, spreadsheets, and dashboards are derived, dated views with freshness checks.",
      "Automated QuickBooks import preparation with validation, duplicate/conflict checks, and a human approval step — the system fails closed instead of guessing.",
      "Built a reconciliation engine using normalized identifiers and confidence scoring to match bank activity against accounting and project records.",
      "Designed a governed AI agent workflow on Claude Code with task handoffs, recorded decisions, and automated tests around finance safety and data integrity."
    ]
  },
  {
    company: "Keeley Companies",
    title: "Data Analyst",
    dates: "Mar 2025 — May 2025",
    location: "St. Louis, MO",
    bullets: [
      "ERP data migration from SAGE CRE 300 to CMiC — extracted, validated, and reconciled data between systems.",
      "Compared old and new system data meticulously, feeding detailed discrepancy reports to the ETL team.",
      "Handled large datasets in SQL, VS Code, and advanced Excel (XLOOKUP, VLOOKUP, INDEX/MATCH) to ensure migration accuracy."
    ]
  },
  {
    company: "Curtiss-Wright Corporation",
    title: "Staff Accountant",
    dates: "Nov 2022 — Aug 2023",
    location: "Charlotte, NC",
    bullets: [
      "Managed financial reporting and reconciliations on SAP and Oracle, ensuring accuracy across financial statements.",
      "Automated data reconciliation processes, reducing manual errors and improving close efficiency.",
      "Supported budgeting and forecasting by analyzing historical financial trends; managed fixed assets on Sage FAS."
    ]
  },
  {
    company: "Robert Half",
    title: "Professional Consultant",
    dates: "Oct 2021 — Jul 2022",
    location: "Charlotte, NC",
    bullets: [
      "Client-side accounting and reconciliation across Elgi, Essity, and Mood Media.",
      "Covered month-end close, journal entries, bank reconciliation, 401K, bonus, commissions, and audit support.",
      "Automated data reconciliation using Excel to reduce manual cycles."
    ]
  },
  {
    company: "NTT",
    title: "Reconciliation Analyst",
    dates: "May 2019 — Sep 2021",
    location: "Charlotte, NC",
    bullets: [
      "Specialized in sales tax rebates and vendor reconciliations for enterprise tech clients, including Cisco and Dell.",
      "Processed high-volume invoices and resolved unmatched discrepancies in holding accounts on SAP and Oracle.",
      "Covered 11 vendors weekly as payment-processing backup while supporting accurate financial reporting."
    ]
  },
  {
    company: "Top Nails Tech",
    title: "Founder / Business Owner",
    dates: "Aug 2005 — Apr 2018",
    location: "Morganton, NC",
    bullets: [
      "Founded and ran a service business generating $200K+ annual revenue with full P&L ownership — payroll, AP/AR, lease negotiation, and state compliance.",
      "Led a team of six and drove 10–12% year-over-year revenue growth through multi-platform digital marketing.",
      "Built repeatable operational processes from scratch — the origin of how I think about internal tooling today."
    ]
  }
];

// Reverse-chronological by end date, newest first — keeps the timeline
// readable instead of jumping 2025 → 2023 → 2024 → 2025 → 2012.
const EDUCATION = [
  {
    program: "WorkKeys Silver — National Career Readiness",
    school: "ACT",
    dates: "Dec 2025",
    detail: "National Career Readiness Certificate at the Silver level, validating applied math, workplace documents, and graphic literacy."
  },
  {
    program: "Full Stack Web Development Certificate",
    school: "Savvy Coders",
    dates: "Sep 2025 — Dec 2025",
    detail: "12-week immersive full-stack bootcamp in a facilitated Scrum environment running two-week sprints. Built and deployed the Cinemetrics capstone to Netlify/Render."
  },
  {
    program: "Agile Fundamentals (ICP)",
    school: "ICAgile",
    dates: "2024",
    detail: "The lens now used for sprint planning and iterative delivery on internal tooling work."
  },
  {
    program: "Data Science Certification",
    school: "TripleTen",
    dates: "Sep 2023 — May 2024",
    detail: "16 end-to-end data science projects covering Python fundamentals, EDA, statistical testing, classical ML, tree ensembles, NLP, time series, and a CNN regression for computer vision."
  },
  {
    program: "Bachelor's Degree in Accounting",
    school: "Belmont Abbey College",
    dates: "Completed 2012",
    detail: "Financial accounting, managerial accounting, auditing, taxation, and business law — the foundation for a decade of reconciliation work across enterprise ERPs."
  }
];

const LEARNING = [
  { icon: "fa-robot", title: "AI agent workflows", detail: "Claude Code agents, MCP tools, and local models — run with explicit handoffs, recorded decisions, and evidence checks before anything acts." },
  { icon: "fa-brain", title: "Machine learning", detail: "16 applied projects through TripleTen — a CatBoost churn model (AUC-ROC 0.844) and a CNN age-regression model (~7yr MAE) among them." },
  { icon: "fa-code", title: "Multi-agent development", detail: "Running several Claude Code sessions in parallel on Cinemetrics — named lanes, shared-file conflict rules, and a living project log instead of one thread doing everything in sequence." }
];

function skillPills(skills) {
  return skills.map(s => `<span class="skill-pill">${s}</span>`).join("");
}

export default () => html`
  <section class="about linkedIn-style">
    <div class="about-hero">
      <div class="about-hero-photo-wrap">
        <img
          src="${profilePhoto}"
          alt="James Nguyen Profile Photo"
          class="about-photo"
          width="200"
          height="200"
          loading="lazy"
          onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=\\'about-photo-fallback\\'>JN</div>')"
        />
      </div>
      <div class="about-hero-text">
        <h1>James Nguyen</h1>
        <h2>Finance &amp; Operations Analyst &middot; Internal Developer</h2>
        <p class="about-tagline">
          10+ years accounting &amp; reconciliation &rarr; data science &rarr; full-stack.
          Python &middot; SQL &middot; FastAPI &middot; always building.
        </p>
        <p class="about-location"><i class="fa-solid fa-location-dot"></i> St. Louis, MO</p>
        <div class="about-cta-row">
          <a class="about-cta about-cta--primary" href="/cinemetrics-journey.html">
            <i class="fa-solid fa-timeline"></i> Build Journey
          </a>
          <a class="about-cta" href="https://jamesnguyen.netlify.app/" target="_blank" rel="noopener noreferrer">
            <i class="fa-solid fa-user"></i> Portfolio
          </a>
          <a class="about-cta" href="https://www.linkedin.com/in/jamesmnguyen704/" target="_blank" rel="noopener noreferrer">
            <i class="fa-brands fa-linkedin"></i> LinkedIn
          </a>
          <a class="about-cta" href="https://github.com/jamesmnguyen704" target="_blank" rel="noopener noreferrer">
            <i class="fa-brands fa-github"></i> GitHub
          </a>
        </div>
      </div>
    </div>

    <div class="about-facts">
      <div class="about-fact">
        <span class="about-fact-label">Background</span>
        <span class="about-fact-value">Accounting Analyst &middot; Data Scientist &middot; Full Stack Developer</span>
      </div>
      <div class="about-fact">
        <span class="about-fact-label">Currently</span>
        <span class="about-fact-value">Day &amp; Night Solar &middot; Savvy Coders Graduate</span>
      </div>
      <div class="about-fact">
        <span class="about-fact-label">Certification</span>
        <span class="about-fact-value">Data Science Certification &mdash; TripleTen (2023&ndash;2024)</span>
      </div>
    </div>

    <div class="about-summary">
      <h2>About Me</h2>
      <p>
        Hi, I'm <strong>James Nguyen</strong> — a multidisciplinary professional
        with a background in accounting and financial analysis who transitioned
        into software engineering, data analytics, and full-stack web
        development.
      </p>
      <p>
        I built <strong>Cinemetrics</strong> as my Savvy Coders Capstone
        Project, blending my passion for movies, analytics, and user-focused
        design. This project became a full production-ready application
        integrating authentication, APIs, databases, and modern web
        architecture.
      </p>
      <p>
        At <strong>Day &amp; Night Solar</strong>, I'm rebuilding internal operations
        from the ground up across a commercial solar portfolio — 170+ projects
        spanning 15 states — as the sole developer on <strong>Project Waffles</strong>,
        a local-first operations-automation platform that turns fragmented
        exports, statements, and documents into a traceable workflow instead of
        quietly guessing.
      </p>
    </div>

    <div class="about-experience">
      <h2>Experience</h2>
      <div class="experience-timeline">
        ${EXPERIENCE.map(
          job => `
            <div class="experience-card">
              <div class="experience-header">
                <div>
                  <h3>${job.title}</h3>
                  <span class="experience-company">${job.company}</span>
                </div>
                <div class="experience-meta">
                  <span class="experience-dates">${job.dates}</span>
                  <span class="experience-location"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
                </div>
              </div>
              <ul class="experience-bullets">
                ${job.bullets.map(b => `<li>${b}</li>`).join("")}
              </ul>
            </div>
          `
        ).join("")}
      </div>
    </div>

    <div class="about-education">
      <h2>Education &amp; Credentials</h2>
      <div class="education-list">
        ${EDUCATION.map(
          e => `
            <div class="education-card">
              <div>
                <h3>${e.program}</h3>
                <span class="education-school">${e.school}</span>
              </div>
              <span class="education-dates">${e.dates}</span>
              <p class="education-detail">${e.detail}</p>
            </div>
          `
        ).join("")}
      </div>
    </div>

    <div class="about-learning">
      <h2>What I'm Learning Right Now</h2>
      <div class="learning-grid">
        ${LEARNING.map(
          l => `
            <div class="learning-card">
              <i class="fa-solid ${l.icon}"></i>
              <h3>${l.title}</h3>
              <p>${l.detail}</p>
            </div>
          `
        ).join("")}
      </div>
    </div>

    <div class="about-skills">
      <h2>Technical Skills &amp; Technologies</h2>
      ${SKILL_GROUPS.map(
        group => `
          <h3>${group.title}</h3>
          <div class="skill-pill-row">${skillPills(group.skills)}</div>
        `
      ).join("")}
    </div>

    <div class="about-project">
      <h2>About Cinemetrics</h2>
      <img class="about-project-hero-img" src="${cinemetricsScreenshot}" alt="Cinemetrics home page" loading="lazy" />
      <p>
        Cinemetrics is a cinematic data hub that tracks movie releases, box
        office trends, and community engagement. Built as a
        <strong>full-stack SPA</strong>, it showcases strong engineering
        fundamentals and real production-ready features.
      </p>
      <ul class="about-accomplishments">
        ${ACCOMPLISHMENTS.map(a => `<li><i class="fa-solid fa-circle-check"></i> ${a}</li>`).join("")}
      </ul>

      <h3>Things I'm Proud Of</h3>
      <div class="about-highlights">
        ${HIGHLIGHTS.map(
          h => `
            <div class="about-highlight-card">
              <span class="about-highlight-stat">${h.stat}</span>
              <span class="about-highlight-label">${h.label}</span>
            </div>
          `
        ).join("")}
      </div>
      <p>
        This project demonstrates my ability to architect, develop, deploy, and
        maintain complete applications from scratch — all while applying the
        same precision and analytical mindset I bring from my background in
        finance and accounting.
      </p>
    </div>

    <div class="about-other-project">
      <h2>Other Projects</h2>

      <div class="project-card">
        <img class="project-card-img" src="${portfolioScreenshot}" alt="jamesnguyen.netlify.app portfolio site" loading="lazy" />
        <div class="project-card-body">
          <h3>Personal Portfolio</h3>
          <p>
            My main site — background, work, projects, and short lessons on
            finance automation and AI workflows. Built with Astro.
          </p>
          <a class="about-cta" href="https://jamesnguyen.netlify.app/" target="_blank" rel="noopener noreferrer">
            <i class="fa-solid fa-user"></i> View Portfolio
          </a>
        </div>
      </div>

      <div class="project-card">
        <img class="project-card-img" src="${baitAndSwitchScreenshot}" alt="Bait and Switch fishing app" loading="lazy" />
        <div class="project-card-body">
          <h3>Bait &amp; Switch — Midwest Angler's Log</h3>
          <p>
            A fishing app for the St. Louis / Metro East area: a live interactive
            map of nearby lakes, rivers, and ponds with real-time conditions
            (wind, pressure, moonrise and sunset), a species catalog, gear
            tracking, tournaments, a catch feed, and a 7-day trip planner.
          </p>
          <a class="about-cta" href="https://bait-and-switch-jamesmnguyen704s-projects.vercel.app/" target="_blank" rel="noopener noreferrer">
            <i class="fa-solid fa-location-dot"></i> View Bait &amp; Switch
          </a>
        </div>
      </div>

      <div class="project-card">
        <div class="project-card-body">
          <h3>Project Waffles <span class="project-private-tag">Private</span></h3>
          <p>
            A local-first control plane for Day &amp; Night Solar's back office,
            built around a six-stage pipeline — intake, normalization, loading,
            reconciliation, attribution, and publication — that turns messy
            exports and documents into a traceable, evidence-backed workflow.
            Controlled accounting exports are always staged for human approval,
            never auto-committed.
          </p>
          <p>
            Current focus: role-scoped AI assistants that coordinate through
            typed approvals instead of free-for-all access, a single
            bank-to-books reconciliation matcher replacing several
            disagreeing ones, and warehouse "contracts" that catch a stale
            table pretending to be fresh.
          </p>
        </div>
      </div>
    </div>

    <div class="about-closing">
      <p>Thanks for exploring my work — I'm excited to keep building, scaling Cinemetrics, and growing as a developer. LinkedIn, GitHub, and my portfolio are up top if you'd like to connect.</p>
    </div>
  </section>
`;
