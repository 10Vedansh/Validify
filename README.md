# 🚀 Validify AI

> Transform startup ideas into validated business opportunities with AI-powered market analysis, investor readiness scoring, and strategic insights.

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Prisma](https://img.shields.io/badge/Prisma-ORM-purple)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)

---

## 🌟 Overview

Validify AI is an AI-powered startup validation platform designed to help founders evaluate ideas before investing months of development time.

The platform acts as an AI co-founder by providing:

- Market validation
- Startup idea analysis
- SWOT analysis
- Investor readiness assessment
- Business model feedback
- Strategic recommendations
- Validation reports
- Interactive AI conversations

---

## ✨ Features

### 🤖 AI Co-Founder
- Real-time startup validation
- Strategic business feedback
- Market opportunity assessment
- Product positioning insights

### 📊 Validation Dashboard
- Startup scoring system
- Validation history
- Report generation
- Progress tracking

### 💡 Startup Analysis
- Market potential evaluation
- Competitive landscape analysis
- Risk identification
- Growth opportunities

### 🔐 Authentication & Security
- Secure user registration
- JWT authentication
- Protected API routes
- Password hashing

### ☁️ Cloud Deployment
- Production-ready architecture
- Dockerized backend
- Render deployment
- Supabase database integration

---

## 🏗️ System Architecture

```text
┌─────────────────────┐
│     Frontend        │
│ React + TypeScript  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Backend        │
│    Hono + Node.js   │
└───────┬─────┬───────┘
        │     │
        ▼     ▼
 ┌─────────┐ ┌──────────┐
 │ Gemini  │ │ Supabase │
 │   AI    │ │PostgreSQL│
 └─────────┘ └──────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Axios

### Backend

- Node.js
- Hono
- Prisma ORM
- JWT Authentication
- bcrypt

### Database

- PostgreSQL
- Supabase

### AI Services

- Google Gemini
- OpenRouter

### Deployment

- Docker
- Render
- Cloudflare Workers

---

## 📂 Project Structure

```text
Validify/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── screenshots/
│   └── architecture/
│
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Supabase Account
- Gemini API Key

---

### Clone Repository

```bash
git clone https://github.com/10Vedansh/Validify.git

cd Validify
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
DATABASE_URL=
DIRECT_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply schema:

```bash
npx prisma db push
```

Run backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 🔑 Environment Variables

| Variable | Description |
|-----------|-------------|
| DATABASE_URL | Supabase pooled connection |
| DIRECT_URL | Direct PostgreSQL connection |
| JWT_ACCESS_SECRET | JWT access token secret |
| JWT_REFRESH_SECRET | JWT refresh token secret |
| GEMINI_API_KEY | Google Gemini API key |
| OPENROUTER_API_KEY | OpenRouter API key |

---

## 📸 Screenshots

### Landing Page

_Add screenshot here_

### Authentication

_Add screenshot here_

### Dashboard

_Add screenshot here_

### AI Co-Founder Chat

_Add screenshot here_

---

## 🎯 Use Cases

### Startup Founders

- Validate startup ideas
- Assess market opportunities
- Identify risks early
- Improve investor readiness

### Entrepreneurs

- Test business concepts
- Refine value propositions
- Explore growth strategies

### Students & Innovators

- Learn startup fundamentals
- Evaluate project viability
- Practice business planning

---

## 📈 Roadmap

### Version 1.0
- [x] Authentication
- [x] Startup Validation
- [x] AI Chat
- [x] Dashboard
- [x] Supabase Integration

### Version 2.0
- [ ] Investor Pitch Deck Generation
- [ ] Advanced Analytics
- [ ] Team Collaboration
- [ ] Export Reports
- [ ] Custom AI Personas

### Version 3.0
- [ ] Market Research Automation
- [ ] Competitor Tracking
- [ ] Funding Readiness Assessment
- [ ] Multi-Language Support

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Vedansh Taparia**

Building AI-powered products and startup tools.

GitHub:
https://github.com/10Vedansh

---

## ⭐ Support

If you found this project useful:

- Star the repository
- Share feedback
- Report issues
- Suggest new features

---

**Validify AI — From napkin sketch to boardroom deck.**
