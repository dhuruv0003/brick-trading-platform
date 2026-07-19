# BrickPro — Brick Trading & Distribution Platform

Full-stack MERN + Next.js application: public marketing/catalog site, lead/quote capture,
and an MUI-based admin console for content and CRM management.

## Project Structure

```
server/   Express + MongoDB API (JWT auth, RBAC, repositories, controllers)
client/   Next.js (App Router) + MUI frontend — public site + /admin console
```

## 1. Backend Setup

```bash
cd server
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed               # creates sample data + the FIRST admin account
npm run dev                 # starts API on http://localhost:5000
```

`npm run seed` wipes and repopulates the database (categories, products, FAQs,
testimonials, a sample blog post, sample projects) **and creates the first
admin user**:

```
Email:    admin@brickpro.com
Password: Admin@123456
```

Change this password after your first login (Admin → Users, or via your own
profile settings once added). Run `npm run seed` only once per environment —
re-running it wipes existing data.

## 2. Frontend Setup

```bash
cd client
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, defaults to http://localhost:5000/api/v1
npm install
npm run dev                   # starts the site on http://localhost:3000
```

## 3. Logging Into the Admin Console

Go to **http://localhost:3000/admin/login** (also linked as "Admin Portal" in
the site footer) and sign in with the seeded credentials above.

### Why is there no public "Sign Up"?

This is a B2B lead-generation site, not a customer-accounts platform. Site
visitors (homeowners, builders, contractors, dealers, etc.) don't need
accounts — they submit **Inquiries** and **Quote Requests** through public
forms, which show up in the admin CRM (Leads / Quotes).

**Admin/staff accounts are provisioned, not self-service.** This is what
enables RBAC (role-based access control):

- The first admin is created by `npm run seed` (or manually via a one-off
  script/DB insert in production).
- That admin then creates further accounts from **Admin → Users**, assigning
  one of four roles: `super_admin`, `admin`, `manager`, `staff`. Each role
  sees a different subset of the admin nav (see `AdminShell.tsx` `NAV` array
  and each route's `restrictTo(...)` middleware on the backend).
- There is intentionally no public registration endpoint — allowing anyone to
  self-register an admin account would defeat the purpose of RBAC.

If you do want customer self-service accounts later (order history, saved
addresses, etc.), that's a separate `Customer` model/auth flow and can be
added without touching the admin RBAC system.

## 4. Common Issues

- **CORS / login fails silently**: make sure `CLIENT_URL` in `server/.env`
  matches the URL you're loading the site from (`http://localhost:3000` for
  local Next.js dev — the old Vite default of `5173` is no longer used).
- **"Network Error" on every request**: the API isn't running, or
  `NEXT_PUBLIC_API_URL` in `client/.env.local` points to the wrong port.
- **Login succeeds then immediately logs out**: check the browser console —
  usually a CORS or clock-skew issue with the JWT.





SMTp = xsmtpsib-c4ea16a471b9a41a15ea65beeb8a584ddc370450c955121755c8c0e48ecb8ca3-pKJBN9tMDSmz2BmX