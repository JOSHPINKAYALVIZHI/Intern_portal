Intern Portal – IPS Tech Community

A full-stack web application designed to manage interns, track progress, and streamline internship workflows for IPS Tech Community.


Overview

The Intern Portal provides a centralized platform where interns can:

- Register and login securely 
- Complete their profile 
- Follow a structured learning roadmap 
- Upload daily progress 
- Submit blogs and final projects 
- Track performance through points & leaderboard 

Admins can:

- Monitor intern activity
- Manage users
- Review progress

---

🛠 Tech Stack

Frontend

- React.js 
- Tailwind CSS 
- Axios

Backend

- Flask (Python) 
- Flask-JWT (Authentication)
- Flask-SQLAlchemy

Database

- PostgreSQL 

---

Features

Authentication

- Secure login system (JWT-based)
- Password hashing using Werkzeug (scrypt)

Profile Management

- Intern profile setup
- Department & domain tracking

Dashboard

- Daily progress tracking (21 days)
- Activity grid visualization
- Blog tracking

File Uploads

- Daily documentation upload
- LeetCode progress upload

Leaderboard

- Top interns ranked by points

Admin Panel

- Admin-only dashboard
- Intern monitoring

---

📁 Project Structure

intern_portal/
│
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   └── extensions.py
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── public/
│
└── README.md

---

⚙️ Installation & Setup

1️⃣ Clone Repository

git clone https://github.com/your-repo/intern-portal.git
cd intern-portal

2️⃣ Backend Setup

cd backend
pip install -r requirements.txt
python app.py

3️⃣ Frontend Setup

cd client
npm install
npm run dev

---

🔐 Environment Variables

Create ".env" in backend:

JWT_SECRET_KEY=your_secret_key
DATABASE_URL=your_postgres_url

---

🌐 API Endpoints (Sample)

Endpoint| Method| Description
/login| POST| User login
/register| POST| Create user
/dashboard| GET| Intern dashboard
/intern/setup-profile| POST| Profile setup

---

---

 Conclusion

This project demonstrates a complete full-stack system with authentication, database management, role-based access, and real-world internship tracking features.

---

