# LMS & Real-Time Communication Platform

A full-featured Learning Management System (LMS) combined with real-time communication capabilities, designed for educators and students to collaborate, teach, and learn seamlessly. Every user has dual identities as both a **Student** and **Teacher** with XP-based progression systems.

## 🌟 Overview

This application is a comprehensive educational platform that enables:

- **Dual User Identities**: Every user can be a student and teacher simultaneously, with independent XP and level progression
- **Classroom Management**: Create, manage, and enroll in multiple classes
- **Real-Time Communication**: Live text chat and peer-to-peer video/screen sharing
- **Assessment System**: Advanced exam engine supporting multiple question types (multiple choice, open-ended, etc.)
- **Experience & Leveling**: Gamified progression system rewarding educational activities

## ✨ Key Features

### User & Role Management

- Dual identity system: **Student Profile** and **Teacher Profile**
- Independent XP tracking for each role
- Achievements and leveling based on user actions
- Google authentication integration

### Classroom System

- Create and manage classrooms (earns Teacher XP)
- Student enrollment and class management
- Role-based access control (Teacher/Student)
- Class announcements and resource sharing

### Real-Time Communication

- **Text Chat**: Instant messaging in classrooms via WebSocket
- **Video & Screen Sharing**: Peer-to-peer (P2P) video conferencing
- **Online Status**: Real-time presence tracking for students and teachers

### Assessment & Exams

- **Polymorphic Question Engine**: Support for multiple question types
  - Multiple choice questions with flexible options
  - Open-ended questions
  - Custom question structures using PostgreSQL JSONB
- Flexible exam scheduling and time limits
- Automatic grading and result tracking
- Grade history and analytics

### File Management

- Secure file uploads for assignments and resources
- Cloud-based storage (AWS S3 / MinIO)
- Presigned URLs for direct browser uploads
- Bandwidth optimization

## 🏗️ Tech Stack

### Backend

- **Language**: TypeScript
- **Framework**: NestJS (opinionated, scalable architecture)
- **Runtime**: Node.js

### Database & Storage

- **Primary DB**: PostgreSQL (relational data with complex relationships)
- **ORM**: Prisma (type-safe database queries)
- **Caching & Sessions**: Redis
- **File Storage**: AWS S3 or MinIO

### Real-Time Communication

- **Signaling & Chat**: Socket.io
- **Video/Screen Share**: WebRTC (PeerJS / Simple-Peer)

### Frontend

- **Framework**: Next.js (Server-Side Rendering)
- **UI Library**: React
- **Styling**: Tailwind CSS
- **State Management**: Zustand / TanStack Query

### DevOps & Infrastructure

- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx
- **Hosting**: VPS (DigitalOcean / AWS EC2)

## 📊 Data Model Overview

### Core Entities

- **Users**: Dual profiles with separate XP tracking
  - Student Profile (Student XP, Student Level)
  - Teacher Profile (Teacher XP, Teacher Level)
- **Classes**: Classroom instances managed by teachers
- **Enrollments**: Student-Class relationships
- **Exams**: Assessments with polymorphic questions
- **Questions**: Flexible structure supporting multiple types via JSONB
- **Submissions**: Student exam submissions and grades

### Experience System

- **Teacher XP Triggers**:
  - Create classroom (+X XP)
  - Post assignment (+X XP)
  - Grade submissions (+X XP)
- **Student XP Triggers**:
  - Complete assignment (+X XP)
  - Pass exam (+X XP)
  - Participate in live session (+X XP)

## 🛣️ Development Roadmap

### Phase 1: Foundation (The Skeleton)

- [ ] Set up NestJS project with TypeScript
- [ ] Configure PostgreSQL + Prisma
- [ ] Implement Docker & Docker Compose
- [ ] Build authentication system (Google OAuth)
- [ ] Create user and dual-identity models

### Phase 2: Core Features (The Data)

- [ ] Implement Class and Enrollment system
- [ ] Teacher/Student role management
- [ ] Build class management endpoints
- [ ] Student enrollment flow

### Phase 3: Real-Time Communication (The Chat)

- [ ] Implement Socket.io for text chat
- [ ] Build chat room management
- [ ] Add online status tracking
- [ ] Create chat history storage

### Phase 4: Media Streaming (The Video)

- [ ] Implement WebRTC signaling via Socket.io
- [ ] Build peer connection management
- [ ] Add screen sharing functionality
- [ ] Optimize bandwidth and connection quality

### Phase 5: Assessment Engine (The Exams)

- [ ] Design polymorphic question system
- [ ] Implement exam creation and management
- [ ] Build submission and grading system
- [ ] Create exam analytics and reporting

### Phase 6: DevOps & Deployment (The Infrastructure)

- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Configure Kubernetes manifests
- [ ] Implement Nginx reverse proxy
- [ ] Deploy to VPS with automated pipeline

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mimi
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

3. **Start services with Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. **Run database migrations**

   ```bash
   cd backend
   npx prisma migrate dev
   ```

6. **Start development servers**

   ```bash
   # Backend (from backend/ directory)
   npm run start:dev

   # Frontend (from frontend/ directory)
   npm run dev
   ```

## 📁 Project Structure

```
mimi/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication (Google OAuth, JWT)
│   │   ├── chat/           # WebSocket chat functionality
│   │   ├── class/          # Classroom management
│   │   ├── exam/           # Exam and question engine
│   │   ├── video/          # WebRTC signaling and management
│   │   └── ...
│   ├── prisma/             # Database schema and migrations
│   ├── test/               # Unit and integration tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages and routes
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities and helpers
│   │   └── store/          # Zustand state management
│   ├── public/             # Static assets
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Local development services
└── README.md
```

## 🔑 Key Technical Highlights

### Type-Safe Backend

- Full TypeScript implementation prevents runtime errors
- NestJS dependency injection and modularity
- Prisma type generation from schema

### Scalable Architecture

- Modular NestJS structure (Controllers → Providers → Modules)
- Database connection pooling with Redis caching
- Horizontal scaling ready with Kubernetes

### Real-Time Capabilities

- Socket.io for instant messaging and presence tracking
- WebRTC peer-to-peer connections for low-latency video
- Efficient data synchronization

### Flexible Exam System

- Polymorphic questions stored as JSONB for flexibility
- Support for multiple question types without schema changes
- Extensible question engine for future question formats

### Production-Ready DevOps

- Docker containerization for consistency
- Kubernetes orchestration for scalability
- GitHub Actions CI/CD for automated testing and deployment
- Linux VPS deployment for full infrastructure control

## 🌐 Deployment

### Docker Compose (Development)

```bash
docker-compose up -d
```

### Kubernetes (Production)

```bash
kubectl apply -f k8s/
```

### GitHub Actions (Automated)

- Runs on every push to main branch
- Tests, builds, and deploys automatically
- Supports multiple environments (staging, production)

## 📝 License

[Add your license here]

## 👤 Author

[Your name/contact]

---

**"Learn. Teach. Grow. Level Up."** 🚀
