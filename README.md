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
- WhatsApp integration for direct lead contact
- Real-time dashboard updates using Socket.IO (new leads, closed deals, and activity)
- Vitest and React Testing Library for frontend tests
## Real-Time Dashboard & WhatsApp Integration

- **Real-Time Updates:**
  - The dashboard updates instantly for new leads, closed deals, and recent activity using Socket.IO.
  - No need to refresh the page to see the latest stats or activity.

- **WhatsApp Integration:**
  - Each lead profile includes a WhatsApp button for direct chat with the lead.
  - Phone numbers are formatted for WhatsApp international links.

No extra setup is required for these features beyond running both backend and frontend as described below.

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