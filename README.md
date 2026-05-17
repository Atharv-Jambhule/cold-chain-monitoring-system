# 🧊 Cold Chain Monitoring System

A full-stack Cold Chain Monitoring application built using **Node.js, Express, MongoDB, HTML, CSS, and JavaScript** to track shipment temperatures in real time and detect violations during transportation.

---

# 📌 Project Overview

The Cold Chain Monitoring System helps logistics and healthcare industries monitor shipment temperatures continuously to ensure product safety during transport.

The application allows users to:

* Log shipment temperature data
* Detect temperature violations automatically
* Monitor shipment conditions in real time
* View logs in a live dashboard
* Store and retrieve shipment data using MongoDB

---

# 🚀 Features

✅ Shipment temperature logging
✅ Real-time monitoring dashboard
✅ Automatic status detection:

* Normal
* Warning
* Critical

✅ MongoDB database integration
✅ REST API support
✅ Responsive UI design
✅ Auto-refresh dashboard
✅ Temperature analytics and statistics

---

# 🛠 Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Tools

* Nodemon
* Postman
* MongoDB Compass

---

# 📂 Project Structure

```bash
cold-chain-monitoring/
│
├── public/
│   ├── index.html
│   └── dashboard.html
│
├── index.js
├── package.json
├── .env
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/cold-chain-monitoring.git
cd cold-chain-monitoring
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cold-chain-monitoring
PORT=3000
```

---

## 4️⃣ Start MongoDB

```bash
net start MongoDB
```

---

## 5️⃣ Run Project

### Production

```bash
npm start
```

### Development

```bash
npm run dev
```

---

# 🌐 Application URLs

## Log Entry Page

```bash
http://localhost:3000/
```

## Dashboard

```bash
http://localhost:3000/dashboard
```

---

# 📡 API Endpoints

## POST `/log`

Save shipment temperature log.

### Request Body

```json
{
  "shipment_id": "SHIP001",
  "location": "Pune",
  "temperature": 5
}
```

---

## GET `/logs`

Retrieve all shipment logs.

---

## GET `/logs/:shipment_id`

Retrieve logs for a specific shipment.

---

## GET `/health`

Check backend server health.

---

# 🧠 Status Detection Logic

| Temperature Range      | Status   |
| ---------------------- | -------- |
| 4°C - 6°C              | Normal   |
| 2°C - 4°C or 6°C - 8°C | Warning  |
| Below 2°C or Above 8°C | Critical |

---

# 📊 Dashboard Features

* Real-time shipment monitoring
* Auto-refresh every 10 seconds
* Shipment statistics
* Color-coded status indicators
* Temperature tracking table

---

# 🗃 Database Schema

```js
{
  shipment_id: String,
  location: String,
  temperature: Number,
  status: String,
  timestamp: Date
}
```

---

# 🧪 Testing

You can test APIs using:

* Postman
* Browser
* MongoDB Compass

---

# 📸 Screenshots

## Log Entry Page

(Add screenshot here)

## Dashboard

(Add screenshot here)

---

# 👨‍💻 Team Members

| Name            | Role                         |
| --------------- | ---------------------------- |
| Arya Pradeep    | Product Owner / DB Developer |
| Ayush Joshi     | Scrum Master / DB Developer  |
| Rushabh Kamdi   | DB Architect / DB Developer  |
| Atharv Jambhule | App Developer / DB Developer |

---

# 🎯 Future Enhancements

* IoT sensor integration
* GPS tracking
* Email/SMS alerts
* Cloud deployment
* Data analytics
* AI-based prediction system

---

# 📜 License

This project is developed for academic and educational purposes.

---

# ⭐ Acknowledgements

* MongoDB
* Express.js
* Node.js
* Open Source Community
