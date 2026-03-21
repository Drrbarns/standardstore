# Mobile App (Expo)

This is the React Native mobile application for the ecommerce storefront.

## 1) Setup

1. Copy the environment file:

```bash
cp .env.example .env.local
```

2. Set `EXPO_PUBLIC_API_BASE_URL`:
   - Local web API: `http://localhost:4000`
   - Device testing (same Wi-Fi): `http://YOUR_LOCAL_IP:4000`
   - Production: `https://your-domain.com`

3. Set Supabase env vars:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2) Run

```bash
npm install
npm run start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- or scan the QR code with Expo Go

## 3) What is wired now

- Product list from `/api/storefront/products`
- Bottom-tab app shell (`Shop`, `Cart`, `Account`)
- Device-persisted cart (`AsyncStorage`)
- Supabase auth with secure session persistence (`expo-secure-store`)
- Account tab with login/signup + signout + order history
- Cart checkout action wired to `/api/orders/create`

## 4) Next build steps

- Auth (Supabase session + secure storage)
- Cart and checkout API integration
- Orders and account screens
- Push notifications
- EAS build + store submission pipeline
