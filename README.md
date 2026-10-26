# Cloud-Based AI Software Testing Platform

A cloud-native application designed to automatically ingest Java Maven projects, generate test cases using Bedrock AI, execute them in secure isolated containers (Docker / ECS Fargate), and analyze test failures via AI.

## Project Structure

```text
cloud-ai-testing-platform/
├── frontend/             # React (Vite) Frontend
├── backend/              # Spring Boot Backend
├── test-runner/          # Docker / Host Test execution scripts
├── docker/               # Dockerfiles for backend and test runners
├── infrastructure/       # IaC and deployment scripts (local / AWS)
└── docs/                 # Platform architecture and documentation
```

## Local Development Setup

### Prerequisites
- Java 21+
- Node.js 20+
- (Optional) Docker (for PostgreSQL & isolated test runner)

### Running Phase 1 (Local MVP)
1. **Prepare Environment**:
   Initialize local tools and directories.
2. **Start Backend**:
   Navigate to `backend` and run `./mvnw spring-boot:run` (or use system-wide maven / portable maven).
3. **Start Frontend**:
   Navigate to `frontend`, install packages with `npm install`, and run `npm run dev`.
4. **Mock Project ZIP**:
   Prepare a standard Maven ZIP project with some Java source code and upload it through the web dashboard.
