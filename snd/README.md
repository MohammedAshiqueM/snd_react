# 🎨 SND (Send) — React Frontend

Welcome to the frontend of `SND` ("Send"), a peer-to-peer developer collaboration platform for real-time knowledge sharing, mentorship, and community building.

This repository contains the **React + Vite + Tailwind CSS** based frontend that communicates with the `SND` Django backend through **REST APIs** and **WebSockets**.

📌 For the detailed story behind this project, its inspiration, tech breakdown, and backend architecture — kindly refer to the [SND Django Backend README](https://github.com/MohammedAshiqueM/snd_django/blob/main/README.md).

# 📂 Project Structure

```
snd_react/
│
├── snd/                         # React app source folder  
│   ├── public/                  # Public static files  
│   ├── src/
│   │   ├── asset/images/        # App images  
│   │   ├── components/          # Reusable UI components  
│   │   ├── constents/           # Constants (backend url etc.)  
│   │   ├── context/             # React contexts (Auth, Socket, etc.)  
│   │   ├── pages/               # Application pages (Home, Profile, Blogs, etc.)  
│   │   ├── api.js               # API service for REST endpoints  
│   │   ├── api2.js              # API service for WebSocket or other APIs  
│   │   ├── store/               # Zustand state stores  
│   │
│   ├── .env                     # Environment variables  
│   ├── .gitignore               # Git ignored files  
│   ├── package.json             # Project dependencies  
│   ├── tailwind.config.js       # Tailwind CSS configuration  
│   ├── vite.config.js           # Vite configuration  
│
└── README.md                    # This file
```


# 🌐 Tech Stack

React + Vite — for a fast, modern frontend build

Tailwind CSS — for styling

React Router — for client-side routing

Axios — for REST API calls

WebRTC — for real-time communication

Cloudinary — for image uploads

JWT via HttpOnly Cookies — for secure authentication

Zustand — for lightweight, scalable React state management

📌 .env Setup
Inside the snd/ folder, create a .env file:

```
VITE_CLOUD_NAME=your-cloudinary-name

```

Used for managing image uploads via Cloudinary.



# 📎 Related Repositories


🐍 Backend (Django REST + Channels):

[SND Django](https://github.com/MohammedAshiqueM/snd_django)


📖 Features (Quick Overview)


Clean, developer-friendly React interface

REST and WebSocket integration

Real-time chat, code editor, video sessions, and notifications

Time-banking UI for tracking mentorship time

Tech blogs, Q&A, social interactions

Lightweight global state management using Zustand

Fully Dockerized backend compatibility


# 📦 Getting Started (Development)


📌 1️⃣ Move into the App Directory

cd snd

📌 2️⃣ Install Dependencies

npm install

📌 3️⃣ Start the Development Server

npm run dev

Open http://localhost:3000 in your browser.


# 🙌 Credits & Thanks


Built by Mohammed Ashique

Tested and reviewed by industrial experts and Brocamp peers.
