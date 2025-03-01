# Food Ordering System with Token System

A comprehensive food ordering platform with a token-based system for order management.

## Features

### For Shop Owners (Admin)
1. Add products with details and images
2. View registered users and their contact information
3. Dashboard with order statistics (pending, preparing, ready, completed)
4. Financial reports and analytics
5. Order management system

### For Customers
1. Browse menu and add items to cart
2. User authentication system
3. Order tracking with unique tokens
4. Order history

## Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Setup Instructions

1. Clone the repository
```
git clone <repository-url>
cd food-ordering-system
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
```

4. Set up Supabase
- Create a new Supabase project
- Run the SQL migrations in the `supabase/migrations` folder

5. Start the development server
```
npm run dev:all
```

## Deployment

### Local Network Deployment

1. Build the frontend
```
npm run build
```

2. Start the server
```
npm run server
```

3. Access the application at `http://localhost:5000`

### Internet Hosting (Netlify)

1. Create a Netlify account

2. Install Netlify CLI
```
npm install -g netlify-cli
```

3. Login to Netlify
```
netlify login
```

4. Deploy to Netlify
```
netlify deploy
```

5. Follow the prompts to complete the deployment

## Admin Access

Default admin credentials:
- Email: admin@foodtoken.com
- Phone: 1234567890
- Password: admin123

## License

This project is licensed under the MIT License.