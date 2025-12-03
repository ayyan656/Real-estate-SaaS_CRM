# Real Estate SaaS CRM

A full-featured SaaS CRM platform for real estate businesses, built with Node.js, Express, MongoDB, React, and Vite.

## Features
- User authentication (JWT, Passport)
- Property management (CRUD, image upload via Cloudinary)
- Lead management
- Dashboard, profile, settings, and plans pages
- Modern UI with Tailwind CSS
- Image carousel for property images
- Context-based state management
- Vitest and React Testing Library for frontend tests

## Project Structure
```
backend/
  controllers/
  middleware/
  models/
  routes/
  config/
  server.js
  db.js
frontend/
  components/
  context/
  pages/
  services/
  App.jsx
  index.jsx
  vite.config.js
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB

### Backend Setup
```sh
cd backend
npm install
npm start
```

### Frontend Setup
```sh
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in `backend/` with:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing
Frontend tests:
```sh
cd frontend
npx vitest run
```

## Deployment
- Deploy backend to services like Heroku, Vercel, or Render
- Deploy frontend to Vercel, Netlify, or similar

## Contributing
Pull requests are welcome! Please open issues for suggestions or bugs.

## License
MIT