# Discord Clone

A full-stack, real-time chat and voice communication application built to replicate the core functionality of Discord. This project leverages modern web technologies to provide seamless messaging, server management, and voice channels.

## 🚀 Features

- **Real-time Messaging**: Instant text messaging powered by WebSockets.
- **Voice Communication**: Real-time voice chat capabilities using WebRTC.
- **Authentication**: Secure user registration and login with JWT (JSON Web Tokens).
- **Server & Channel Management**: Create and manage servers, text channels, and audio channels.
- **User Status**: Real-time status indicators (Online, Offline, Idle, Do Not Disturb).
- **Responsive Design**: A fully responsive UI built with Tailwind CSS and Shadcn UI components.
- **Modern Architecture**: Built on Next.js 15 for server-side rendering and optimal performance.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js (Custom Server)
- **Database**: MongoDB with Mongoose ORM
- **Real-time**: WebSockets (Socket.io), WebRTC
- **Authentication**: JWT (JSON Web Tokens)

## 📸 Screenshots

<div align="left">
  <img width="100%" alt="Login Page" src="https://github.com/user-attachments/assets/ccbd48a3-d7dd-4e31-959f-27ea5d2dab23" />
  <br/><br/>
  <img width="100%" alt="Home Page" src="https://github.com/user-attachments/assets/8ef1d504-c072-4151-9a8b-d52bdf3e9fd0" />
  <br/><br/>
  <img width="100%" alt="Setting Page" src="https://github.com/user-attachments/assets/274c5ea0-8a72-4590-9756-1816541efaf7" />
  <br/><br/>
  <img width="100%" alt="Profile Page" src="https://github.com/user-attachments/assets/c640b083-d2a8-4c55-9d66-585941f9697a" />
</div>

## ⚙️ How It Works

1.  **Client-Side**: The application uses **Next.js** to serve React components. It maintains a persistent connection to the backend via **WebSockets** for real-time updates (new messages, user status changes).
2.  **Server-Side**: A custom **Node.js/Express** server handles API requests and manages WebSocket connections.
3.  **Database**: **MongoDB** stores all persistent data, including user profiles, server details, and chat history.
4.  **Voice**: When users join a voice channel, **WebRTC** is used to establish a peer-to-peer connection for low-latency audio streaming.

## 💻 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or Atlas URI)

### Installation

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/Pushkaraj-Palli/Discord-Clone.git](https://github.com/Pushkaraj-Palli/Discord-Clone.git)
    cd Discord-Clone
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Configuration**
    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    # Database
    MONGODB_URI=your_mongodb_connection_string

    # Authentication
    JWT_SECRET=your_complex_secret_key

    # Public Site URL (for production)
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4.  **Run the Development Server**

    ```bash
    npm run dev
    ```

    The application should now be running at `http://localhost:3000`.

## 📂 Project Structure

- `app/`: Main application routes and pages (Next.js App Router).
- `components/`: Reusable UI components (modals, inputs, chat bubbles).
- `hooks/`: Custom React hooks (e.g., useModal, useOrigin).
- `lib/`: Utility functions and database configuration.
- `socket-server/`: Logic handling WebSocket events and connections.
- `types/`: TypeScript type definitions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
