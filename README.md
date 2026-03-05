# LMS & Real-Time Communication Platform

A full-featured Learning Management System (LMS) combined with real-time communication capabilities, designed for educators and students to collaborate, teach, and learn seamlessly. Built with a **microservices architecture** for scalability, resilience, and independent deployment. Every user has dual identities as both a **Student** and **Teacher** with XP-based progression systems.

## 🌟 Overview

This application is a comprehensive educational platform built on a **true microservices architecture**, enabling:

- **Dual User Identities**: Every user can be a student and teacher simultaneously, with independent XP and level progression
- **Classroom Management**: Create, manage, and enroll in multiple classes
- **Real-Time Communication**: Live text chat and peer-to-peer video/screen sharing
- **Assessment System**: Advanced exam engine supporting multiple question types (multiple choice, open-ended, etc.)
- **Experience & Leveling**: Gamified progression system rewarding educational activities
- **Event-Driven Architecture**: Asynchronous, resilient services that communicate via message queues
- **Independent Scalability**: Each service scales independently based on demand

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
- Cloud-based storage (MinIO or local filesystem)
- Presigned URLs for direct browser uploads (MinIO compatible)
- Bandwidth optimization via CDN

## �️ Microservices Architecture

The application is split into **5 independent microservices** based on data responsibility and domain boundaries:

### Service A: Identity & Profile Service

- **Responsibility**: Manages dual "Teacher/Student" personas
- **Tech Stack**: Node.js/TypeScript with NestJS
- **Database**: PostgreSQL
- **Redis Usage**: Session storage, user profile caching
- **Features**:
  - User authentication (Google OAuth, JWT)
  - Dual profile management
  - User session management
  - Profile CRUD operations
- **CV Highlight**: "Managed complex polymorphic user identities (Teacher/Student) using a centralized Identity Service"

### Service B: Gamification (XP) Service

- **Responsibility**: The "Brain" for levels and XP progression
- **Tech Stack**: Node.js/TypeScript
- **Database**: PostgreSQL
- **Communication**: **Event-Driven** - Listens to RabbitMQ/Redis Streams for XP-worthy events
- **Features**:
  - XP calculation and level progression
  - Achievement tracking
  - Event listener for actions (quiz completed, class created, etc.)
  - Leaderboard generation
- **Key Advantage**: Decoupled from core business logic - if this service is down, users can still complete quizzes; XP updates when service recovers
- **Redis Usage**: Leaderboard storage (Sorted Sets), XP cache
- **CV Highlight**: "Implemented an asynchronous Gamification engine that decoupled XP logic from core business features"

### Service C: Classroom & Quiz Service

- **Responsibility**: Core business logic - Creating classes, managing quiz content, and grading
- **Tech Stack**: Node.js/TypeScript with NestJS
- **Database**: PostgreSQL
- **Redis Usage**: Class data caching, enrollment caching, rate limiting
- **Features**:
  - Classroom creation and management
  - Student enrollment
  - Exam creation with polymorphic question engine
  - Submission handling and grading
  - Event publishing to XP service
- **Event Publishing**: Sends events like `{ "userId": 123, "action": "quiz_completed", "score": 95 }` to RabbitMQ

### Service D: Video Streaming Service (Past Lectures)

- **Responsibility**: Handles video upload, storage, and streaming for recorded lectures
- **Tech Stack**: Node.js/TypeScript or Python
- **Storage**: MinIO (S3-compatible, runs in Docker)
- **CDN**: Nginx/Caddy (local) or external CDN (Cloudflare/etc)
- **Redis Usage**: Video metadata caching, presigned URL caching
- **Features**:
  - Video upload with presigned URLs (MinIO compatible)
  - Video transcoding (optional: FFmpeg)
  - Streaming endpoint generation
  - Video metadata management
- **Key Advantage**: Independent scaling during high-demand lecture periods
- **CV Highlight**: "Built scalable video-on-demand pipeline with object storage and CDN integration"

### Service E: Real-Time Video Service (Live Chat & WebRTC)

- **Responsibility**: WebRTC signaling for live video/screen sharing and real-time chat
- **Tech Stack**: Node.js with Socket.io
- **Redis Usage**: Pub/Sub for chat, presence tracking, WebRTC signaling state
- **Optional**: Coturn server for STUN/TURN (WebRTC relay support)
- **Features**:
  - WebRTC signaling server
  - Peer connection management
  - Real-time text chat via Socket.io
  - Online presence tracking
- **Key Advantage**: Isolated real-time concerns don't affect other services

### Inter-Service Communication

- **Synchronous**: API Gateway routes HTTP requests to appropriate services
- **Asynchronous**: RabbitMQ or Redis Streams for event-driven communication
- **Pattern**: Services publish events; interested services subscribe
- **Example Flow**:
  1. Student completes quiz in Service C
  2. Service C publishes `quiz_completed` event to RabbitMQ/Redis
  3. Service B (XP Service) consumes event and updates XP
  4. If Service B is down, events queue up and process when service recovers

## 🆚️ Microservices vs Monolith: Why This Approach?

| Feature               | Monolith Approach                                                     | Microservices Approach (This Project)                                    |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Video Processing**  | Uploading a video slows down the entire application                   | Service D handles it independently; rest of the site stays fast          |
| **Updating XP Logic** | Changing XP calculation requires redeploying the entire app           | Only redeploy Service B (Gamification); other services unaffected        |
| **Scaling**           | Must scale entire application even if only video needs more resources | Scale only Video Service during high-traffic lecture periods; save costs |
| **Resilience**        | If one module crashes, entire app goes down                           | If XP Service is down, users still complete quizzes; XP updates later    |
| **Database**          | Single shared database; schema changes affect everything              | Each service owns its database; independent schema evolution             |
| **Deployment**        | One deploy = risk to entire system                                    | Deploy services independently; rollback only failed service              |
| **Technology**        | Locked into one tech stack                                            | Use Python for Video Service, Node.js for others (polyglot)              |
| **Team Autonomy**     | Teams must coordinate on shared codebase                              | Teams work on separate services with clear boundaries                    |
| **Downtime**          | Deployment causes full system downtime                                | Rolling deployments; zero-downtime updates                               |

### Key Advantages of This Architecture

1. **Independent Scalability**: During exam period, scale Classroom Service. During lecture uploads, scale Video Service.
2. **Fault Isolation**: XP Service outage doesn't prevent quiz submissions.
3. **Faster Development**: Teams can develop and deploy services independently.
4. **Technology Flexibility**: Use best tool for each job (Python for ML, Node.js for real-time).
5. **Cost Optimization**: Pay only for resources each service needs; don't over-provision.
6. **Easier Testing**: Test services in isolation; mock dependencies.
7. **Clear Ownership**: Each service has a clear domain boundary and team ownership.

## �🏗️ Tech Stack

### Backend Services (Microservices)

- **Language**: TypeScript (Node.js) / Python (where applicable)
- **Framework**: NestJS (opinionated, scalable architecture)
- **Runtime**: Node.js 18+
- **Architecture Pattern**: Microservices with Event-Driven Communication

### Database & Storage (Per Service)

- **Identity Service**: PostgreSQL
- **Gamification Service**: PostgreSQL
- **Classroom Service**: PostgreSQL
- **Video Service**: MinIO + Nginx/external CDN
- **Real-Time Service**: Redis for session management
- **ORM**: Prisma (type-safe database queries)

### Redis Architecture (Caching & Real-Time Data)

**Redis Use Cases Across Services:**

#### 1. **Caching Layer (All Services)**

- **Purpose**: Reduce database load and improve response times
- **Pattern**: Cache-Aside (Lazy Loading)
- **Use Cases**:
  - User profile data (Identity Service)
  - Class details and enrollments (Classroom Service)
  - XP/Level data for leaderboards (Gamification Service)
  - Video metadata (Video Service)
- **TTL Strategy**: 5-60 minutes depending on data volatility
- **Implementation**:

  ```typescript
  // Example: Cache user profile
  const cachedProfile = await redis.get(`user:${userId}`);
  if (cachedProfile) return JSON.parse(cachedProfile);

  const profile = await db.user.findUnique({ where: { id: userId } });
  await redis.setex(`user:${userId}`, 300, JSON.stringify(profile)); // 5 min TTL
  return profile;
  ```

#### 2. **Session Management (Identity Service)**

- **Purpose**: Store user sessions for authentication
- **Data Stored**: JWT token metadata, user ID, login timestamp
- **TTL**: 24 hours (refresh on activity)
- **Key Pattern**: `session:{sessionId}`
- **Benefits**: Fast session validation, easy invalidation for logout

#### 3. **Pub/Sub for Real-Time Events (Real-Time Service)**

- **Purpose**: Real-time chat, presence tracking, notifications
- **Channels**:
  - `chat:room:{roomId}` - Chat messages
  - `presence:class:{classId}` - Online/offline events
  - `notifications:user:{userId}` - User notifications
- **Pattern**: Publish events to channels, Socket.io clients subscribe
- **Example**:

  ```typescript
  // Publish chat message
  await redis.publish(`chat:room:${roomId}`, JSON.stringify(message));

  // Subscribe to room messages
  redis.subscribe(`chat:room:${roomId}`);
  redis.on("message", (channel, message) => {
    io.to(roomId).emit("chat-message", JSON.parse(message));
  });
  ```

#### 4. **Rate Limiting (API Gateway / All Services)**

- **Purpose**: Prevent abuse, protect APIs
- **Implementation**: Token bucket or sliding window
- **Key Pattern**: `rate_limit:{userId}:{endpoint}`
- **Example**: 100 requests per minute per user
  ```typescript
  const key = `rate_limit:${userId}:${endpoint}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60); // 1 minute window
  if (count > 100) throw new Error("Rate limit exceeded");
  ```

#### 5. **Leaderboards (Gamification Service)**

- **Purpose**: Fast XP rankings and leaderboards
- **Data Structure**: Sorted Sets (ZADD, ZRANGE)
- **Key Patterns**:
  - `leaderboard:teacher` - Teacher XP rankings
  - `leaderboard:student` - Student XP rankings
  - `leaderboard:class:{classId}` - Class-specific rankings
- **Example**:

  ```typescript
  // Update user XP in leaderboard
  await redis.zadd("leaderboard:student", userXP, userId);

  // Get top 10 students
  const topStudents = await redis.zrevrange(
    "leaderboard:student",
    0,
    9,
    "WITHSCORES",
  );
  ```

#### 6. **Temporary Data Storage**

- **Purpose**: Short-lived data that doesn't need persistence
- **Use Cases**:
  - OTP codes for email verification (TTL: 5 minutes)
  - Password reset tokens (TTL: 30 minutes)
  - Exam in-progress state (TTL: exam duration)
  - WebRTC signaling data (TTL: 5 minutes)
- **Example**:
  ```typescript
  // Store OTP
  await redis.setex(`otp:${email}`, 300, otpCode); // Expires in 5 minutes
  ```

#### 7. **Distributed Locking**

- **Purpose**: Prevent race conditions in distributed systems
- **Use Cases**:
  - Ensure only one grading process per submission
  - Prevent duplicate XP awards
- **Implementation**: Redlock algorithm
  ```typescript
  const lock = await redis.set(
    `lock:grade:${submissionId}`,
    "locked",
    "NX",
    "EX",
    10,
  );
  if (!lock) throw new Error("Already being processed");
  // Process grading...
  await redis.del(`lock:grade:${submissionId}`);
  ```

#### Redis Deployment

- **Setup**: Redis Docker container (docker-compose)
- **Persistence**: RDB snapshots + AOF journaling
- **Monitoring**: System resource usage, connection count

### Event-Driven Architecture

- **Message Queue**: RabbitMQ (Pub/Sub for asynchronous communication)
- **Pattern**: Microservices publish events; consumers process independently
- **Benefit**: Resilience - services can be down temporarily without data loss

### API & Communication

- **REST APIs**: Service-to-service communication
- **Real-Time**: Socket.io for chat and presence
- **Video/Screen Share**: WebRTC with optional Coturn STUN/TURN
- **Event Queue**: RabbitMQ for asynchronous events

### Frontend

- **Framework**: Next.js (Server-Side Rendering)
- **UI Library**: React
- **Styling**: Tailwind CSS
- **State Management**: Zustand / TanStack Query

### DevOps & Infrastructure

- **Containerization**: Docker (per service)
- **Local Development**: Docker Compose (all services + dependencies)
- **Database**: PostgreSQL (Docker containers)
- **Message Queue**: RabbitMQ (Docker container)
- **Object Storage**: MinIO (Docker container)
- **Caching**: Redis (Docker container)

## 🐳 Local Development with Docker Compose

### Local Development: Docker Compose

**What is it?**

- Docker Compose orchestrates all 9 containers locally
- Includes PostgreSQL, Redis, and all microservices
- Exactly mimics this full-stack architecture on your machine
- Perfect for development, testing, and interviews

**Why use this?**

- ✅ **$0 cost**: Completely free
- ✅ **Fast feedback**: Changes reflected instantly
- ✅ **No cloud account needed**: Works offline
- ✅ **Portfolio-friendly**: Shows your ability to structure distributed systems
- ✅ **Interview-ready**: Impress with `docker-compose up` demos

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

### Phase 1: Foundation & Infrastructure Setup

- [ ] **Project Initialization**
  - [ ] Create monorepo structure for 5 microservices
  - [ ] Set up shared TypeScript configuration
  - [ ] Initialize Docker setup per service
- [ ] **Local Development Environment**
  - [ ] Create docker-compose.yml for all services
  - [ ] Set up PostgreSQL containers for each service
  - [ ] Set up Redis for caching and pub/sub
  - [ ] Set up RabbitMQ or Redis Streams for events
  - [ ] Set up MinIO for object storage (S3-compatible)

### Phase 2: Service A - Identity & Profile Service

- [ ] Initialize NestJS project for Identity Service
- [ ] Configure PostgreSQL + Prisma schema for users
- [ ] Implement Google OAuth authentication
- [ ] Build dual-identity (Teacher/Student) data model
- [ ] Create JWT token generation and validation
- [ ] Build user profile CRUD endpoints

### Phase 3: Service C - Classroom & Quiz Service

- [ ] Initialize NestJS project for Classroom Service
- [ ] Design Prisma schema (Classes, Enrollments, Exams, Questions, Submissions)
- [ ] Implement classroom CRUD operations
- [ ] Build enrollment system
- [ ] Create polymorphic question engine (JSONB)
- [ ] Implement exam creation and management
- [ ] Build submission and grading system
- [ ] **Event Publishing**: Publish `quiz_completed` events to RabbitMQ/Redis Streams

### Phase 4: Service B - Gamification (XP) Service

- [ ] Initialize NestJS/Node.js project for XP Service
- [ ] Design XP and Level data model (Prisma)
- [ ] **Event Consumer**: Listen to RabbitMQ/Redis Streams for XP-worthy events
- [ ] Implement XP calculation logic
- [ ] Build level progression algorithm
- [ ] Create achievement tracking
- [ ] Build XP history and leaderboard endpoints
- [ ] Test asynchronous event flow with Classroom Service

### Phase 5: Service D - Video Streaming Service

- [ ] Initialize Node.js/Python project for Video Service
- [ ] Integrate MinIO SDK for video uploads (S3-compatible storage)
- [ ] Generate presigned URLs for direct browser uploads
- [ ] Store video metadata in database
- [ ] Handle video storage and retrieval with MinIO
- [ ] Build streaming URL generation
- [ ] (Optional) Integrate FFmpeg for video transcoding

### Phase 6: Service E - Real-Time Video & Chat Service

- [ ] Initialize Node.js project with Socket.io
- [ ] Implement real-time text chat
- [ ] Build chat room management
- [ ] Add online presence tracking
- [ ] Implement WebRTC signaling server
- [ ] Build peer connection management
- [ ] Add screen sharing functionality
- [ ] (Optional) Integrate Coturn for STUN/TURN

### Phase 7: Service Testing & Integration

- [ ] Test service-to-service communication (REST APIs)
- [ ] Implement JWT authentication validation
- [ ] Set up CORS policies for frontend
- [ ] Configure rate limiting per service
- [ ] Test end-to-end flows with all services running

### Phase 8: Frontend Development

- [ ] Initialize Next.js project
- [ ] Set up Tailwind CSS styling
- [ ] Implement authentication flow (Google OAuth)
- [ ] Build classroom pages (list, detail, create)
- [ ] Create exam-taking interface
- [ ] Build real-time chat UI (Socket.io client)
- [ ] Implement WebRTC video interface
- [ ] Create XP/Level dashboard
- [ ] Build video player for past lectures

### Phase 9: Optimization & Advanced Features

- [ ] Implement caching strategies (Redis)
- [ ] Optimize database queries (Prisma)
- [ ] Add dead letter queues (DLQ) for failed events
- [ ] Implement service-to-service authentication
- [ ] Add GraphQL layer (optional)
- [ ] Build admin dashboard for system monitoring
- [ ] Implement analytics and reporting

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18+ (for running services locally without Docker)
- **Docker**: For containerization and running services in containers
- **Docker Compose**: For orchestrating all services locally
- **Git**: Version control

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd mimi
```

#### 2. Set Up Environment Variables

Create `.env` files for each service:

```bash
# Identity Service
cp services/identity-service/.env.example services/identity-service/.env

# Gamification Service
cp services/gamification-service/.env.example services/gamification-service/.env

# Classroom Service
cp services/classroom-service/.env.example services/classroom-service/.env

# Video Service
cp services/video-streaming-service/.env.example services/video-streaming-service/.env

# Real-Time Service
cp services/realtime-service/.env.example services/realtime-service/.env

# Frontend
cp frontend/.env.example frontend/.env
```

#### 3. Start All Services with Docker Compose

```bash
# From the infrastructure directory
cd infrastructure
docker-compose up
```

This will start:

- **PostgreSQL** (separate database for each service)
- **Redis** (caching, sessions, pub/sub, leaderboards)
- **RabbitMQ** (message queue for event-driven communication)
- **MinIO** (S3-compatible object storage for videos)
- **All 5 microservices** (Identity, Gamification, Classroom, Video, Real-Time)
- **Frontend** (Next.js application)

**Services will be available at:**

- Frontend: http://localhost:3000
- Identity Service: http://localhost:3001
- Gamification Service: http://localhost:3002
- Classroom Service: http://localhost:3003
- Video Service: http://localhost:3004
- Real-Time Service: http://localhost:3005
- RabbitMQ Management: http://localhost:15672 (guest/guest)
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

#### 4. Install Dependencies (Optional - For Local Development Without Docker)

```bash
# Identity Service
cd services/identity-service
npm install

# Gamification Service
cd ../gamification-service
npm install

# Classroom Service
cd ../classroom-service
npm install

# Video Service
cd ../video-streaming-service
npm install

# Real-Time Service
cd ../realtime-service
npm install

# Frontend
cd ../../frontend
npm install
```

#### 5. Run Database Migrations

```bash
# Identity Service
cd services/identity-service
npx prisma migrate dev

# Gamification Service (if using PostgreSQL)
cd ../gamification-service
npx prisma migrate dev

# Classroom Service
cd ../classroom-service
npx prisma migrate dev
```

## 📁 Project Structure (Microservices)

```
mimi/
├── services/
│   ├── identity-service/              # Service A: Identity & Profile
│   │   ├── src/
│   │   │   ├── auth/                  # Google OAuth, JWT
│   │   │   ├── profile/               # Dual Teacher/Student profiles
│   │   │   └── user/                  # User management
│   │   ├── prisma/                    # Database schema
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── gamification-service/          # Service B: XP & Levels
│   │   ├── src/
│   │   │   ├── xp/                    # XP calculation engine
│   │   │   ├── levels/                # Level progression logic
│   │   │   ├── achievements/          # Achievement tracking
│   │   │   └── events/                # Event consumers (RabbitMQ)
│   │   ├── prisma/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── classroom-service/             # Service C: Classroom & Quiz
│   │   ├── src/
│   │   │   ├── classroom/             # Classroom CRUD
│   │   │   ├── enrollment/            # Student enrollment
│   │   │   ├── exam/                  # Exam engine
│   │   │   ├── question/              # Polymorphic questions
│   │   │   ├── submission/            # Grading
   │   │   └── events/                # Event publishers (RabbitMQ)
│   │   ├── prisma/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── video-streaming-service/       # Service D: Past Lectures
│   │   ├── src/
   │   │   ├── upload/                # MinIO presigned URLs
   │   │   ├── streaming/             # CDN integration
│   │   │   └── metadata/              # Video info management
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── realtime-service/              # Service E: Live Video & Chat
│       ├── src/
│       │   ├── chat/                  # Socket.io chat
│       │   ├── webrtc/                # WebRTC signaling
│       │   └── presence/              # Online status tracking
│       ├── Dockerfile
│       └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                       # Next.js pages and routes
│   │   ├── components/                # React components
│   │   ├── lib/                       # API client + utilities
│   │   └── store/                     # Zustand state management
│   ├── public/                        # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── infrastructure/
│   └── docker-compose.yml             # Local development setup
│
│
└── README.md
```

## 🔑 Key Technical Highlights

### Type-Safe Backend

- Full TypeScript implementation prevents runtime errors
- NestJS dependency injection and modularity
- Prisma type generation from schema

### Scalable Microservices Architecture

- **Independent Deployment**: Each service deploys without affecting others
- **Independent Scaling**: Scale Video Service during lecture hours; scale Classroom Service during exam periods
- **Data Ownership**: Each service owns its database (no shared DB)
- **Fault Isolation**: If XP Service is down, users can still take quizzes
- **Technology Flexibility**: Use Python for Video Service, Node.js for others

### Event-Driven Resilience

- **Asynchronous Communication**: Services communicate via RabbitMQ message queues
- **Eventual Consistency**: XP updates happen eventually, not blocking quiz completion
- **Retry Logic**: Failed messages automatically retry
- **Dead Letter Queues**: Failed events go to DLQ for investigation

### Real-Time Capabilities

- Socket.io for instant messaging and presence tracking
- WebRTC peer-to-peer connections for low-latency video
- Isolated Real-Time Service doesn't impact other services

### Redis-Powered Performance

- **Multi-Layer Caching**: Reduce database load by 70-90%
- **Sub-millisecond Response Times**: Cache frequently accessed data (profiles, classes, XP)
- **Real-Time Features**: Pub/Sub for chat, presence tracking
- **Leaderboards**: Sorted Sets for instant XP rankings
- **Rate Limiting**: Protect APIs from abuse
- **Session Management**: Fast authentication with distributed sessions

### Flexible Exam System

- Polymorphic questions stored as JSONB for flexibility
- Support for multiple question types without schema changes
- Extensible question engine for future question formats

## 🌐 Deployment

### Docker Compose (Local Development Only)

```bash
# Spins up all 5 services + databases locally
docker-compose up -d
```

## 🌐 Troubleshooting & Development Tips

### Docker Compose Commands

```bash
# View all running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f classroom-service

# Stop all services
docker-compose down

# Remove all volumes (reset databases)
docker-compose down -v

# Rebuild images (after code changes)
docker-compose build

# Rebuild and restart a specific service
docker-compose up --build classroom-service
```

### Local Database Access

```bash
# Access PostgreSQL for Identity Service
psql postgresql://mimi:dev_password@localhost:5432/identity

# Access RabbitMQ Management Console
# Go to: http://localhost:15672 (guest/guest)

# Access MinIO Storage Console
# Go to: http://localhost:9001 (minioadmin/minioadmin)

# Access Redis CLI
redis-cli -p 6379
```

### Common Issues

**Problem**: Services won't start

- Solution: `docker-compose down -v` then `docker-compose up`

**Problem**: Database connection errors

- Solution: Check `docker-compose logs identity-db` to see if database is healthy

**Problem**: Port already in use

- Solution: Change ports in `docker-compose.yml` or kill existing process

## 📝 License

...

## 👤 Author

Selin Uygun

---

**"Learn. Teach. Grow. Level Up."** 🚀
