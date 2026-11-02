# Figma to Documentation

Connects to Figma and generates design documentation automatically.

## Features

- Figma connection and file analysis
- Project collaborators
- Export and analytics API

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI)
- Supabase
- jsPDF

## Getting Started

```bash
git clone https://github.com/ghostland-dev/figma-to-documentation.git
cd figma-to-documentation
npm install
npm run dev
```

Other scripts:

- `npm run build`: next build
- `npm run lint`: next lint

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fghostland-dev%2Ffigma-to-documentation&env=NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY)

Click the button to deploy your own copy on Vercel in one step. It needs a [Supabase](https://supabase.com) project; Vercel asks for these values during setup (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY`

## Author

**Ismail.M**, Software Engineer & DevOps

- GitHub: [@ghostland-dev](https://github.com/ghostland-dev)
- Website: [ismail-mouyahada.com](https://www.ismail-mouyahada.com)
