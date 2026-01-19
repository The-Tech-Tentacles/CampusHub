<div align="center">
  <img src="https://raw.githubusercontent.com/The-Tech-Tentacles/CampusHub/main/Docs/assets/logo.png" alt="CampusHub Logo" width="150"/>
</div>

<div align="center">

[![License: Custom](https://img.shields.io/badge/License-Custom-blue.svg)](LICENSE)
[![Status: Development](https://img.shields.io/badge/Status-Development-yellow.svg)]()
[![Platform: Web](https://img.shields.io/badge/Platform-Web-green.svg)]()

</div>

## 🚀 Features

- **Dashboard**: Comprehensive overview with real-time information
- **Schedule Management**: Interactive timetables and class schedules
- **User Management**: Role-based access for students, faculty, and administrators
- **Forms & Applications**: Digital form submission and management
- **Notifications**: Real-time notification system
- **Dark Mode**: Beautiful dark/light theme support
- **Responsive Design**: Mobile-first, works on all devices

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **Zustand** for state management

### Backend

- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Express Session** for authentication
- **RESTful API** architecture

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd CampusHub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/campushub"
SESSION_SECRET="your-session-secret-here"
NODE_ENV="development"
PORT="5000"
```

### 4. Set up the database

```bash
# Push the database schema
npm run db:push
```

### 5. Start development servers

#### Option 1: Frontend only (React + Vite)

```bash
npm run dev
```

Visit http://localhost:5173

#### Option 2: Backend only (Express server)

```bash
npm run dev:server
```

Server runs on http://localhost:5000

#### Option 3: Full-stack development

```bash
npm run dev:full
```

Server runs on http://localhost:5000 with frontend served

## 📝 Available Scripts

- `npm run dev` - Start Vite dev server (frontend)
- `npm run dev:server` - Start Express server (backend)
- `npm run dev:full` - Start full-stack application
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema

## 🏗️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand state stores
│   │   └── lib/           # Utility functions
│   ├── index.html
│   └── ...
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database configuration
│   └── ...
├── shared/               # Shared types and schemas
├── package.json
├── vite.config.ts
└── README.md
```

## 🎨 Key Features

### Dashboard

- Real-time current lecture information
- Dynamic time display
- Colorful stats cards
- Responsive design with dark mode

### Schedule Management

- Interactive timetable view
- Class schedule with locations and timings
- Subject-specific color coding
- Mobile-friendly layout

### User Management

- Role-based authentication (Student, Faculty, Admin)
- Profile management
- Permission-based UI rendering

## 🌙 Dark Mode Support

The application includes comprehensive dark mode support with:

- Automatic system preference detection
- Manual theme toggle
- Consistent theming across all components
- Proper contrast ratios for accessibility

## 📱 Responsive Design

Built mobile-first with Tailwind CSS:

- Breakpoint-specific layouts
- Touch-friendly interfaces
- Optimized for all screen sizes
- Progressive enhancement

## 🔧 Configuration

### Database Configuration

The application uses Drizzle ORM with PostgreSQL. Configure your database connection in the `.env` file.

### Vite Configuration

Customize the Vite configuration in `vite.config.ts` for your development needs.

## 🤝 Contributing

We welcome contributions! However, please note our custom license terms before contributing.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under a Custom License - see the [LICENSE](LICENSE) file for details.

**Key Terms**:

- ✅ Clone and modify for personal/educational use
- ✅ Study and learn from the codebase
- ❌ Commercial distribution or sale
- ❌ Redistribution of modified versions

## 📞 Contact

**The Tech Tentacles**

- GitHub: [@The-Tech-Tentacles](https://github.com/The-Tech-Tentacles)
- Project Link: [https://github.com/The-Tech-Tentacles/CampusHub](https://github.com/The-Tech-Tentacles/CampusHub)

## 🙏 Acknowledgments

- Thanks to all contributors who believe in revolutionizing education technology
- Inspired by the need for better university management systems
- Built with ❤️ for the education community

---

<div align="center">
  <strong>Built with 🚀 by
  <br />
  Team: [Rakesh_Yadav & Team](https://github.com/Rakeshyadav-19)
  <br />
  The Tech Tentacles</strong>
</div>
