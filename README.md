<div align="center">
  <br />
  <h1 align="center">Hola-Talk 💬</h1>
  <p align="center">
    A modern, real-time chat application built with Next.js, Prisma, and Socket.IO.
    <br />
    <a href="https://hola-talk.vercel.app/"><strong>Explore the Live Demo »</strong></a>
    <br />
    <br />
    <a href="https://github.com/nagarjun-nayak/hola-talk/issues">Report Bug</a>
    ·
    <a href="https://github.com/nagarjun-nayak/hola-talk/issues">Request Feature</a>
  </p>
</div>

---

## 📑 Table of Contents
- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 About The Project
Hola-Talk is a feature-rich, real-time chat application designed for seamless communication.  
It leverages a modern tech stack including **Next.js** for the frontend/backend, **Prisma** as the ORM, and **Socket.IO** for real-time messaging.

---

## ✨ Key Features
- ⚡ **Real-Time Messaging**: Instant message delivery powered by WebSockets.  
- 🔒 **Secure Authentication**: Sign-up/login with NextAuth.js and multiple providers.  
- 👥 **One-on-One & Group Chats**: Private and group conversations.  
- 🎨 **Modern UI**: Responsive, clean design with Tailwind CSS.  
- ⚙️ **Scalable Backend**: Prisma ORM + Next.js API routes.  
- 🚀 **Optimized for Performance**: SSR, SSG, and blazing fast loads with Next.js.  

---

## 🛠️ Built With
- [Next.js](https://nextjs.org/)  
- [React](https://react.dev/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [Prisma](https://www.prisma.io/)  
- [Socket.IO](https://socket.io/)  
- [NextAuth.js](https://next-auth.js.org/)  
- [Vercel](https://vercel.com/)  

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or later recommended)  
- npm / yarn / pnpm  
- A database (PostgreSQL, MySQL, SQLite, etc.)  

### Installation
```bash
# Clone the repo
git clone https://github.com/nagarjun-nayak/hola-talk.git
cd hola-talk

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Push database schema
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Run the development server
npm run dev
```
App will run locally at: **http://localhost:3000**

---

## 🔑 Environment Variables
Required variables inside `.env`:

```bash
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000" # or your production URL
```

Add provider credentials (Google, GitHub, etc.) if needed.

---

## 📂 Project Structure
```
/
├── prisma/          # Prisma schema & migrations
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable React components
│   ├── context/     # React context providers
│   ├── hooks/       # Custom hooks
│   ├── lib/         # Utility functions, Prisma client
│   ├── pages/       # Next.js pages & API routes
│   └── styles/      # Global styles
├── .env.example     # Example env vars
├── next.config.js   # Next.js config
└── tailwind.config.ts
```

---

## ☁️ Deployment
Optimized for **Vercel**:  

1. Fork the repo  
2. Import into Vercel Dashboard  
3. Add environment variables  
4. Deploy → Automatic redeploy on pushes  

---

## 👥 Contributors

<table>
  <tr>
    <td align="center" style="padding: 20px;">
      <a href="https://github.com/nagarjun-nayak">
        <img src="https://github.com/nagarjun-nayak.png?size=120" width="120px;" style="border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" alt="Aprameya P"/>
        <br /><br />
        <sub><b>Nagarjun Nayak</b></sub>
      </a>
      <br />
      <a href="https://github.com/nagarjun-nayak">
        <img src="https://img.shields.io/badge/GitHub-Follow-black?logo=github&style=flat-square"/>
      </a>
    </td>
    <td align="center" style="padding: 20px;">
      <a href="https://github.com/Kaushal-C">
        <img src="https://github.com/Kaushal-C.png?size=120" width="120px;" style="border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" alt="Member 3"/>
        <br /><br />
        <sub><b>Kaushal-C</b></sub>
      </a>
      <br />
      <a href="https://github.com/Kaushal-C">
        <img src="https://img.shields.io/badge/GitHub-Follow-black?logo=github&style=flat-square"/>
      </a>
    </td>
    <td align="center" style="padding: 20px;">
      <a href="https://github.com/7-karthikR">
        <img src="https://github.com/7-karthikR.png?size=120" width="120px;" style="border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" alt="Member 4"/>
        <br /><br />
        <sub><b>7-karthikR</b></sub>
      </a>
      <br />
      <a href="https://github.com/7-karthikR">
        <img src="https://img.shields.io/badge/GitHub-Follow-black?logo=github&style=flat-square"/>
      </a>
    </td>
    <td align="center" style="padding: 20px;">
      <a href="https://github.com/Aprxmeya">
        <img src="https://github.com/Aprxmeya.png?size=120" width="120px;" style="border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" alt="Gagan K"/>
        <br /><br />
        <sub><b>Aprameya P</b></sub>
      </a>
      <br />
      <a href="https://github.com/Aprxmeya">
        <img src="https://img.shields.io/badge/GitHub-Follow-black?logo=github&style=flat-square"/>
      </a>
    </td>
  </tr>
</table>

---

## 📜 License
Distributed under the **MIT License**.  
See `LICENSE` for more information.  
