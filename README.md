# DHMIS Platform Home

The public platform storefront built with Next.js.

## Installation

Requirements: Node.js 20+ and a running DHMIS Backend when API-backed features are used.

```bash
cd platform-home
npm install
cp .env.example .env.local
npm run dev
```

Configure `API_BASE_URL` for server-side requests and `NEXT_PUBLIC_API_BASE_URL` for browser requests. Build with `npm run build`; run the production server with `npm run start`.

