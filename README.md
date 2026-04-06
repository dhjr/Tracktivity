# Tracktivity 🚀

**Tracktivity** is a comprehensive Activity Point Management System designed specifically for students and faculty under the **KTU (Kerala Technological University) 2024 Regulations**. It streamlines the process of submitting, verifying, and managing activity points required for graduation.

---

## ✨ Features

### 🎓 For Students
- **Activity Submission**: Easily submit details and certificates for various activities (NSS, Sports, Technical Events, etc.).
- **Progress Tracking**: Real-time dashboard showing accumulated points vs. requirement milestones.
- **Rulebook Guidance**: Interactive rulebook that validates submissions against the official KTU 2024 handbook.
- **Profile Management**: Maintain academic details and track status of submitted points.

### 👨‍🏫 For Faculty & Admins
- **Verification Dashboard**: Review and approve/reject student activity submissions with a single click.
- **Batch Management**: Organize and oversee student progress by academic batch.
- **Automated Calculations**: Points are automatically calculated based on regulations, reducing manual error.
- **Report Generation**: Export comprehensive PDF reports for official departmental records.

### 🛠️ Core Capabilities
- **Role-Based Access**: Secure login and signup for both Students and Faculty roles.
- **Supabase Integration**: Robust backend powered by Supabase for authentication, database management, and file storage.
- **PDF Exporting**: High-quality PDF report generation using `reportlab`.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/Auth**: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: [Python 3.12+](https://www.python.org/)
- **ORM**: [SQLModel](https://sqlmodel.tiangolo.com/) (Pydantic + SQLAlchemy)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase)
- **PDF Engine**: [ReportLab](https://www.reportlab.com/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for frontend)
- [Python 3.12+](https://www.python.org/) (for backend)
- [uv](https://github.com/astral-sh/uv) (recommended Python package manager)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd tracktivity
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   uv sync
   # Ensure you have a .env file with your Supabase credentials
   uv run fastapi dev app/main.py
   ```

3. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   # Ensure you have a .env.local file with your Supabase credentials
   npm run dev
   ```

---

## 📄 License
This project is developed for academic purposes under the KTU 2024 Regulations.

---
*Created with ❤️ for students by the Tracktivity Team.*
