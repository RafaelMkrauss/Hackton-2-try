# Semestral Evaluation Feature

## Overview

The Semestral Evaluation feature allows users to provide comprehensive assessments of public services in their area twice a year. This helps local authorities understand citizen satisfaction and prioritize improvements.

## Key Features

### 📍 **User Location Tracking**

- Users provide their address and neighborhood during registration
- Optional location coordinates for precise area analysis
- Enables localized service evaluation and statistics

### ⭐ **Category-Based Rating System**

- 10 main categories based on common urban issues:

  - Iluminação Pública (Public Lighting)
  - Buracos na Via (Road Potholes)
  - Limpeza Urbana (Urban Cleaning)
  - Transporte Público (Public Transportation)
  - Segurança (Security)
  - Infraestrutura (Infrastructure)
  - Meio Ambiente (Environment)
  - Ruído (Noise)
  - Acessibilidade (Accessibility)
  - Sinalização (Signage)

- 1-5 star rating scale for each category
- Optional comments for each category
- General comment section for overall feedback

### 📅 **Semester-Based Evaluations**

- Automatic semester detection (1st: Jan-Jun, 2nd: Jul-Dec)
- One evaluation per user per semester
- Ability to edit existing evaluations
- Historical evaluation tracking

### 📊 **Area Statistics**

- Aggregated ratings by geographic area
- Participation rate tracking
- Average scores by category for neighborhoods
- Data for local government decision-making

## Backend API Endpoints

### Evaluations

- `POST /api/evaluations` - Create new evaluation
- `GET /api/evaluations/current` - Get current semester evaluation
- `GET /api/evaluations/my-evaluations` - User's evaluation history
- `GET /api/evaluations/current-semester` - Current semester info
- `GET /api/evaluations/area-statistics` - Area-based statistics
- `PATCH /api/evaluations/:id` - Update evaluation
- `DELETE /api/evaluations/:id` - Delete evaluation

### Enhanced Registration

- Now includes location fields: address, neighborhood, latitude, longitude

## Frontend Pages

### Registration (`/register`)

- Enhanced with location fields
- Geolocation API integration
- Optional but recommended location data

### Evaluation Page (`/evaluation`)

- Star-based rating interface
- Category descriptions
- Comment fields
- Automatic semester detection
- Edit existing evaluations

### Dashboard Integration

- Quick access button for evaluations
- Links from home page and dashboard

## Database Schema

### New Tables

```sql
-- Semestral evaluations
CREATE TABLE semestral_evaluations (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  semester INTEGER NOT NULL (1 or 2),
  year INTEGER NOT NULL,
  generalComment TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, semester, year)
);

-- Individual category ratings
CREATE TABLE category_ratings (
  id TEXT PRIMARY KEY,
  evaluationId TEXT NOT NULL,
  category TEXT NOT NULL,
  rating INTEGER NOT NULL (1-5),
  comment TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Enhanced Users Table

```sql
-- Added location fields to users
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN latitude REAL;
ALTER TABLE users ADD COLUMN longitude REAL;
ALTER TABLE users ADD COLUMN neighborhood TEXT;
```

## Usage Flow

1. **Registration**: User provides location information during account creation
2. **Access**: User clicks "Avaliação Semestral" from home page or dashboard
3. **Evaluation**: User rates each category and provides comments
4. **Submission**: Data is saved for the current semester
5. **Analytics**: Government can view aggregated statistics by area

## Benefits

### For Citizens

- Voice in local government decisions
- Track service improvements over time
- Community engagement and awareness

### For Government

- Data-driven decision making
- Priority identification by area
- Citizen satisfaction tracking
- Resource allocation optimization

## Technical Implementation

### Frontend

- React components with TypeScript
- Star rating system with Lucide icons
- Responsive design for mobile/desktop
- Real-time validation and feedback

### Backend

- NestJS with Prisma ORM
- SQLite database with proper relations
- Input validation with class-validator
- JWT authentication for security

### Security

- User authentication required
- Data ownership validation
- Input sanitization and validation
- Protected API endpoints

## Future Enhancements

- Email notifications for evaluation periods
- Comparative statistics dashboard
- Government response tracking
- Mobile app version
- Multi-language support
- Integration with city planning systems
