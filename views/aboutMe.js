// LinkedIn-style About Me page for Cinemetrics
// Includes profile banner, skills, tools, and project details

import html from "html-literal";

export default st => html`
  <section class="about linkedIn-style">
    <!-- Banner / Header -->
    <div class="about-banner">
      <h1>James Nguyen</h1>
      <h2>Finance & Data Analytics Professional | Full Stack Developer</h2>
      <p>Bridging Accounting, Technology, and Software Engineering</p>
    </div>

    <!-- Profile Image + Quick Info -->
    <div class="about-profile">
      <img
        src="/Assets/images/aboutme.png"
        alt="James Nguyen Profile Photo"
        class="about-photo"
        width="340"
        height="340"
        loading="lazy"
        onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class='about-photo-fallback'>JN</div>')"
      />

      <div class="about-headline">
        <p><strong>Location:</strong> St. Louis, MO</p>
        <p>
          <strong>Background:</strong> Accounting Analyst • Data Scientist •
          Full Stack Developer
        </p>
        <p>
          <strong>Current:</strong> Day & Night Solar | Savvy Coders Graduate
        </p>
      </div>
    </div>

    <!-- Summary Section -->
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
    </div>

    <!-- Skills Section -->
    <div class="about-skills">
      <h2>Technical Skills & Technologies Used</h2>

      <h3>Languages & Frameworks</h3>
      <ul>
        <li>JavaScript (ES6+)</li>
        <li>HTML5 & CSS3</li>
        <li>Node.js + Express</li>
        <li>MongoDB + Mongoose</li>
        <li>SQL / PostgreSQL</li>
        <li>Python (NumPy, Pandas, Scikit-learn)</li>
      </ul>

      <h3>Frontend Tools</h3>
      <ul>
        <li>Navigo Router (SPA Routing)</li>
        <li>html-literal templating</li>
        <li>Responsive UI & Modern CSS Styling</li>
      </ul>

      <h3>Backend & API Technologies</h3>
      <ul>
        <li>JWT Authentication (Login, Signup, Protected Routes)</li>
        <li>TMDB API (Movie, Box Office, Release Data)</li>
        <li>RESTful API Design</li>
      </ul>

      <h3>Cloud, Deployment & DevOps</h3>
      <ul>
        <li>Netlify (Frontend Deployment)</li>
        <li>Render (Backend Deployment)</li>
        <li>Environment Variables (.env)</li>
        <li>Git & GitHub Project Management</li>
      </ul>

      <h3>Other Tools & Software</h3>
      <ul>
        <li>VS Code</li>
        <li>Postman (API Testing)</li>
        <li>MongoDB Atlas</li>
        <li>QuickBooks Enterprise (Finance/Accounting background)</li>
        <li>Excel automation & financial modeling</li>
        <li>Resend (Automated Email Service)</li>
      </ul>
    </div>

    <!-- Project Section -->
    <div class="about-project">
      <h2>About Cinemetrics</h2>
      <p>
        Cinemetrics is a cinematic data hub that tracks movie releases, box
        office trends, and community engagement. Built as a
        <strong>full-stack SPA</strong>, it showcases strong engineering
        fundamentals and real production-ready features.
      </p>

      <h3>Project Accomplishments</h3>
      <ul>
        <li>Integrated TMDB API for real-time movie data</li>
        <li>Built account creation, secure login, and JWT session handling</li>
        <li>User comment system backed by MongoDB</li>
        <li>Custom UI inspired by cinematic interfaces</li>
        <li>Backend email automation for user onboarding</li>
        <li>Fully deployed on Netlify + Render with environment isolation</li>
      </ul>

      <p>
        This project demonstrates my ability to architect, develop, deploy, and
        maintain complete applications from scratch — all while applying the
        same precision and analytical mindset I bring from my background in
        finance and accounting.
      </p>
    </div>

    <p class="closing">
      Thanks for exploring my work — I’m excited to keep building, scaling
      Cinemetrics, and growing as a developer.
    </p>
  </section>
`;
