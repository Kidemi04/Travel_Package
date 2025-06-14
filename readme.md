# Travelease

A full‑stack travel‑package storefront.\
Runs **locally** with XAMPP + MySQL *or* **in the cloud** on Railway + Aiven.

---

## 🖥  Local Development

| Requirement | Version | Notes                    |
| ----------- | ------- | ------------------------ |
| Node.js     | ≥ 18    | `npm --version` to check |
| XAMPP       | ≥ 8.0   | Provides Apache + MySQL  |

```bash
# 1  clone repo
 git clone https://github.com/<your>/travel-website.git
 cd travel-website

# 2  install deps
 cd backend && npm i
```

1. **XAMPP Control Panel →** *Start* **Apache** & **MySQL**
2. Browse [**http://localhost/phpmyadmin**](http://localhost/phpmyadmin)\
      • *Import → Upload* `backend/da_v2.sql` (12 KB)
3. Copy `.env.example` → `.env` and leave `DATABASE_URL` **blank** (local falls back to `localhost`).
4. Run the API/dev server:

```bash
npm run dev       # hot‑reloads on save, listens on http://localhost:3000
```

5. Front‑end (Vite) lives in `frontend/` — in another terminal run `npm run dev` there (optional).

> **Reset DB locally**
>
> ```sql
> DROP DATABASE IF EXISTS travelease;
> CREATE DATABASE travelease;
> USE travelease;
> SOURCE C:/absolute/path/da_v2.sql;
> ```

---

## 🗂  Repository Structure

```
backend/        Node + Express API
frontend/       Vue 3 (Vite)
da_v2.sql   ⟵ seed script (12KB)
```

---

## ✍  Contact / Issues

Open an issue in GitHub or email me (102782287@students.swinburne.edu.my).

