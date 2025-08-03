                                        💼 Mini LinkedIn-like Community Platform

🌐 Live: 🔗 https://mini-linkedin-like-community-platform-1.onrender.com

A full-stack social web application inspired by LinkedIn, allowing users to register, log in, create public posts, and view content from the community in real-time. This platform was built as a showcase of modern web development techniques, including React, Node.js, Express, MongoDB, and JWT-based authentication.

🌟 Overview

This platform simulates a simplified version of LinkedIn's core functionalities, designed with performance and user experience in mind. It enables users to:

- Authenticate securely.
- Share text-based updates.
- Browse updates from others in the community.
- Navigate to user profiles and view user-specific content.

The UI is designed to be clean, minimal, and responsive using Tailwind CSS and custom components. This makes it both mobile-friendly and aesthetically pleasant.

🔧 Core Features (In Depth)

✅ 1. Authentication & User Management
- Registration & login handled securely using JWT.
- Tokens are stored in localStorage and validated on every refresh to keep sessions active.
- If the token is invalid or missing, the user is redirected to login, ensuring route protection.

📝 2. Post Creation & Feed Display
- Authenticated users can post text updates (just like LinkedIn statuses).
- Posts include metadata like author name and timestamp.
- The feed updates automatically (every 5 seconds) to fetch the latest posts from MongoDB.

👤 3. Author & Profile View
- Each post shows the author's name and a link to their profile page.
- Users can click “View Posts” to see all posts by that specific user.
- Profile pages are dynamically routed using React Router.

💡 4. UX & Visual Design
- The UI uses Tailwind CSS for modern responsiveness.
- Includes dark mode-ready styles.
- Smooth transitions, hover animations, soft shadows, and rounded elements provide a professional feel.

🧱 Technology Stack

Frontend: React, React Router, Axios, Tailwind CSS

Backend: Node.js, Express

Database: MongoDB with Mongoose ODM

Authentication: JSON Web Token (JWT)

Styling: Tailwind CSS, custom components


| METHOD | ENDPOINT         | DESCRIPTION            |
| ------ | ---------------- | ---------------------- |
| POST   | `/register`      | Register a new user    |
| POST   | `/login`         | Log in existing user   |
| POST   | `/validateToken` | Check if JWT is valid  |
| GET    | `/posts`         | Fetch all public posts |
| POST   | `/posts`         | Create a new post      |
| GET    | `/profile/:id`   | Get posts by a user ID |


📌 Key Design Decisions

- Auto-refreshing feed: Eliminates the need for WebSockets while maintaining near real-time updates.
- Scoped component architecture: Reusable components for Auth, Post, Feed, Profile, etc.
- Dark mode-ready: The entire platform is visually consistent in both light and dark themes.


