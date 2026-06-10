# PodWave — Podcast Directory & Player Web Application

A university final project building a podcast directory and player platform with three separate subsystems.

## Project Overview

PodWave is a multi-system podcast platform consisting of three independent applications that communicate exclusively through REST APIs.

## Architecture

### Three Subsystems

| System | Frontend | Backend | Database | Purpose |
|--------|----------|---------|----------|---------|
| **Admin System** | React + Vite | Express.js | MySQL | RSS feed management, ingestion jobs, raw podcast data, failed jobs, retry queue, admin dashboard |
| **Editor System** | Next.js | Next.js API Routes | Supabase PostgreSQL | Review queue, podcast enrichment, approve/reject podcasts, collections, episode publish/hide, AI highlight clips |
| **Public User System** | Vue 3 + Vite | Express.js | MongoDB Atlas | Discover page, browse/search, podcast detail, episode audio player, persistent mini-player, saved podcasts, ratings/history |

### Communication Method

- All systems communicate through backend-to-backend REST APIs only
- No direct database connections between systems
- Service token authentication for inter-system API calls

## Design Reference

The `/design-reference` folder contains the visual blueprint HTML files:

- `admin_desktop.html` — Admin dashboard desktop layout
- `admin_mobile.html` — Admin dashboard mobile layout
- `editor_desktop.html` — Editor dashboard desktop layout
- `editor_mobile.html` — Editor dashboard mobile layout
- `public_desktop.html` — Public user desktop layout
- `public_mobile.html` — Public user mobile layout

## Project Structure

```
podwave_project/
├── admin-system/       # Admin System (React + Vite + Express + MySQL)
├── editor-system/      # Editor System (Next.js + Supabase)
├── public-system/      # Public User System (Vue 3 + Vite + Express + MongoDB)
├── docs/               # Project documentation
└── design-reference/   # HTML design blueprints
```

## Getting Started

Documentation for setup and installation will be added in each subsystem's folder.

## Security

- All secrets stored in `.env` files (never committed to version control)
- `.env.example` files provided with placeholder values
- Input validation, SQL injection protection, and XSS prevention implemented
- Rate limiting on sensitive endpoints
- CORS restrictions and security headers configured

## Author

University Final Project — PodWave

## License

MIT
