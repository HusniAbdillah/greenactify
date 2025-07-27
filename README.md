# GreenActify

GreenActify mengajak pengguna beraksi untuk lingkungan yang lebih hijau melalui aktivitas dan tantangan harian.

## Requirements

- Node.js (>= 14.x)
- npm
- Supabase account
- Clerk account

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS
- **Backend & Database:** Supabase
- **Authentication:** Clerk

## Installation

```bash
# Clone repository
git clone https://github.com/HusniAbdillah/green-actify.git
cd green-actify

# Install dependencies
npm install

# Copy environment sample and set your config
cp .env.example .env.local
# Atur variabel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, JWT_SECRET

# Run development server
npm run dev
```

## Access

Buka browser di [http://localhost:3000](http://localhost:3000)


## Contributing

1. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. Make your changes and commit
   ```bash
   git add .
   git commit -m 'Add some amazing feature'
   ```
3. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```

4. Create a Pull Request
