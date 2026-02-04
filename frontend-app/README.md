# Frontend Application

Modern frontend built with React, TypeScript, Next.js, Tailwind CSS, Framer Motion, and Zustand.

## Tech Stack

- **React 18** - UI library with Hooks and Context
- **TypeScript** - Type-safe development
- **Next.js 14** - React framework with SSR/SSG
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Scoped styling
- **Framer Motion** - Animation library
- **Zustand** - Lightweight state management
- **Axios** - HTTP client

## Features

✨ **Modern UI** with smooth animations  
⚡ **Fast** with Next.js optimizations  
🎨 **Responsive** design with Tailwind CSS  
🔄 **Real-time** state management with Zustand  
📱 **Mobile-friendly** interface  
🌙 **Dark mode** support  
♿ **Accessible** components  

## Project Structure

```
frontend-app/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── users/
│   │   └── page.tsx         # Users page
│   └── products/
│       └── page.tsx         # Products page
├── components/
│   ├── Navigation.tsx       # Nav bar
│   ├── UserCard.tsx         # User card component
│   ├── ProductCard.tsx      # Product card component
│   ├── AddUserModal.tsx     # Add user modal
│   ├── AddProductModal.tsx  # Add product modal
│   └── Card.module.css      # CSS modules
├── store/
│   └── useStore.ts          # Zustand store
├── lib/
│   └── api.ts               # API client
├── .env.local               # Environment variables
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript config
└── next.config.js           # Next.js config
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on port 3000

### Installation

1. **Install dependencies**
   ```bash
   cd frontend-app
   npm install
   ```

2. **Configure environment**
   ```bash
   # .env.local is already created
   # Make sure backend is running on http://localhost:3000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3001
   ```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Key Technologies Explained

### React Hooks
- `useState` - State management
- `useEffect` - Side effects
- `useContext` - Context API (can be added if needed)
- Custom hooks for reusable logic

### TypeScript
- Type-safe props and state
- Interface definitions for API data
- Type inference and checking

### Next.js Features
- **App Router** - File-based routing
- **Server Components** - RSC support
- **Client Components** - Interactive UI
- **SSR/SSG** - Pre-rendering options

### Tailwind CSS
- Utility-first styling
- Responsive design utilities
- Dark mode support
- Custom theme configuration

### Framer Motion
- Page transitions
- Component animations
- Hover and tap effects
- Layout animations

### Zustand
- Lightweight state management
- No boilerplate
- TypeScript support
- Devtools integration

## Component Examples

### Using Framer Motion
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Using Zustand Store
```tsx
const { users, setUsers } = useStore();
```

### TypeScript Interface
```tsx
interface User {
  id: number;
  name: string;
  email: string;
}
```

## Styling Approaches

### Tailwind Classes
```tsx
<div className="bg-blue-600 text-white rounded-lg px-4 py-2">
  Button
</div>
```

### CSS Modules
```tsx
import styles from './Card.module.css';
<div className={styles.card}>Content</div>
```

## API Integration

The app connects to the backend API using Axios:

```typescript
// lib/api.ts
const API_URL = 'http://localhost:3000/api';

export const userAPI = {
  getAll: () => axios.get(`${API_URL}/users`),
  create: (data) => axios.post(`${API_URL}/users`, data),
  // ...
};
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Deployment

### Build for production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with Next.js
- Image optimization
- Lazy loading components
- Optimized animations

## License

ISC
