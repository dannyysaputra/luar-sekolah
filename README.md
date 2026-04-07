# Meeting Room Booking System

A fullstack meeting room booking application built with Django REST Framework (backend) and React + TypeScript + Tailwind CSS (frontend).

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Python 3.10+, Django 5, DRF, MySQL 8+  |
| Frontend | React 18, TypeScript, Tailwind CSS v4  |
| Database | MySQL 8+ (PyMySQL driver)               |

---

## Project Structure

```
root/
  backend/          Django REST API
  frontend/         React + TypeScript SPA
  docs/             Design and implementation specs
  README.md
  .gitignore
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8+

---

## Backend Setup

### 1. Create the MySQL database

```sql
CREATE DATABASE meeting_room_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
```

### 3. Create virtual environment and install dependencies

```bash
cd backend
python -m venv .venv

# Windows
.venv\bin\pip.exe install -r requirements/base.txt

# macOS/Linux
source .venv/bin/activate
pip install -r requirements/base.txt
```

### 4. Run migrations

```bash
# Windows
.venv\bin\python.exe manage.py migrate

# macOS/Linux
python manage.py migrate
```

### 5. Seed initial data (rooms + demo users)

```bash
# Windows
.venv\bin\python.exe manage.py seed_data

# macOS/Linux
python manage.py seed_data
```

This creates 5 demo rooms and 3 users (`alice`, `bob`, `charlie`) with password `password123`. User IDs start at 1 (alice).

### 6. Start development server

```bash
# Windows
.venv\bin\python.exe manage.py runserver

# macOS/Linux
python manage.py runserver
```

Backend runs at `http://localhost:8000`.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:8000`.

---

## API Endpoints

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| GET    | `/api/rooms/`                         | List all rooms                     |
| POST   | `/api/rooms/`                         | Create a room                      |
| GET    | `/api/rooms/{id}/availability/`       | Check room availability            |
| GET    | `/api/bookings/`                      | List bookings (filter: user, date) |
| POST   | `/api/bookings/`                      | Create a booking                   |
| DELETE | `/api/bookings/{id}/`                 | Cancel a booking                   |

See `backend/postman/meeting-room-booking.postman_collection.json` for a ready-to-import Postman collection.

---

## Running Tests

```bash
cd backend

# Windows
.venv\bin\python.exe manage.py test apps.bookings.tests

# macOS/Linux
python manage.py test apps.bookings.tests
```

Tests cover:
- Booking creation (success, conflict, past date, invalid room)
- Boundary conditions (adjacent bookings are not conflicts)
- Cancelled bookings do not block new bookings for the same slot
- Cancel booking (success, already cancelled, not found)

---

## Design Decisions

### Overlap Detection
The conflict formula is: `new_start < existing_end AND new_end > existing_start`. Bookings that touch at the boundary (e.g., 09:00–10:00 and 10:00–11:00) are **not** considered a conflict.

### Soft Delete (Status-based Cancellation)
Bookings are never physically deleted. Cancellation sets `status = 'cancelled'` and records `cancelled_at`. This preserves booking history and ensures cancelled bookings are excluded from conflict checks.

### Concurrency
The service uses `select_for_update()` on the Room row inside a `transaction.atomic()` block to reduce race condition risk. This is a pragmatic approach for a take-home test — a production system would use stricter locking or a reservation queue.

### Authentication
The demo uses a fixed `user_id` (defaults to user 1 / `alice`). The API accepts `user_id` in the request body to support multi-user demos without requiring session auth. In production, `user_id` would be derived from the authenticated session.

### Database Driver
Uses **PyMySQL** (pure Python) instead of `mysqlclient` to avoid C compiler requirements. Behaviour is identical at the application level.

---

## Known Limitations

- No authentication/JWT — `user_id` is sent explicitly in booking requests
- No production-ready HTTPS, secret rotation, or rate limiting
- `select_for_update()` locking is per-row on Room; concurrent bookings of *different* rooms still have a tiny race window (acceptable for this test scope)
- Frontend user switcher not implemented — edit `DEMO_USER_ID` in `src/App.tsx` to test with different users
