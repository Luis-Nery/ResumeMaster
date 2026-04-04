# ResumeMaster

An AI-powered resume builder that helps job seekers create, optimize, and tailor their resumes with real-time AI feedback.

🔗 **Live Demo:** [resumemaster.dev](https://resumemaster.dev)
📖 **API Docs:** [api.resumemaster.dev/swagger-ui/index.html](https://api.resumemaster.dev/swagger-ui/index.html)

---

## Features

- **Resume Builder** — multi-step wizard with live preview across 3 professional templates (Classic, Modern, Minimal)
- **AI Resume Analysis** — section-by-section scoring and improvement suggestions powered by Claude AI
- **AI Bullet Rewriter** — paste a weak bullet point, get 3 stronger rewrites with explanations
- **ATS Job Match** — paste a job description and get a match score with missing/matched keywords
- **PDF Export** — download any resume as a clean A4 PDF
- **Design Customization** — accent colors, fonts, spacing, and padding controls
- **JWT Authentication** — secure register/login with token-based auth

---

## Tech Stack

**Backend**
- Java 17, Spring Boot 3.5, Spring Security
- PostgreSQL 17, Spring Data JPA / Hibernate
- JWT authentication (jjwt 0.12.6)
- Anthropic Claude API (AI features)
- 39 passing tests (JUnit 5, Mockito, MockMvc)

**Frontend**
- React 18, Vite, Tailwind CSS
- Axios, React Router, html2pdf.js

**Infrastructure**
- AWS EC2 (Ubuntu 24.04) with Docker + Docker Compose
- Nginx reverse proxy with Let's Encrypt SSL
- Vercel (frontend)
- Custom domain: resumemaster.dev

---

## Architecture
```
resumemaster.dev (Vercel)          api.resumemaster.dev (AWS EC2)
      │                                      │
   React SPA              ┌─────────────────────────────────┐
      │                   │  Nginx (reverse proxy + SSL)    │
      │  HTTPS REST API   │                                 │
      └──────────────────▶│  Spring Boot (Docker)           │
                          │         │                       │
                          │  PostgreSQL (Docker)            │
                          └─────────────────────────────────┘
                                    │
                             Anthropic Claude API
```

---

## Running Locally

**Prerequisites:** Java 17, Maven, Docker Desktop
```bash
# Clone the repo
git clone https://github.com/Luis-Nery/ResumeMaster.git
cd ResumeMaster

# Create .env file in backend root
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000
ANTHROPIC_API_KEY=your_anthropic_key

# Start PostgreSQL
docker-compose up -d

# Run backend
mvn spring-boot:run

# Run frontend (in a new terminal)
cd resumemaster-frontend
npm install
npm run dev
```

Backend runs at `http://localhost:8080`  
Frontend runs at `http://localhost:5173`  
Swagger UI at `http://localhost:8080/swagger-ui/index.html`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/resumes/user/{userId}` | Get all resumes for user |
| POST | `/api/resumes` | Create resume |
| PUT | `/api/resumes/{id}` | Update resume |
| DELETE | `/api/resumes/{id}` | Delete resume |
| POST | `/api/ai/analyze` | AI resume analysis |
| POST | `/api/ai/rewrite` | AI bullet rewriter |
| POST | `/api/ai/match` | ATS job match score |

---

## Author

**Luis Nery** — Computer Science Senior, Lamar University (May 2026)

---

© 2026 Luis Nery. All rights reserved.