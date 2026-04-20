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

Deep-link scheme for app redirects is configured as:
- `standardstore://`

Universal/app links are configured for:
- `https://standardecom.com`
- `https://www.standardecom.com`

## 3) What is wired now

- Product list from `/api/storefront/products`
- Bottom-tab app shell (`Shop`, `Cart`, `Account`)
- Device-persisted cart (`AsyncStorage`)
- Supabase auth with secure session persistence (`expo-secure-store`)
- Account tab with login/signup + signout + order history
- Cart checkout action wired to `/api/orders/create`
- Mobile Money flow via `/api/payment/moolre` with deep-link return and verification retries
- Payment result screen + order tracking screen with timeline and order items
- Mobile analytics events to `/api/mobile/analytics`
- Push permission/token registration (best-effort) to `/api/mobile/push/register`

## 4) Next build steps

- Production push delivery (provider + backend persistence + order status triggers)
- Final deep-link verification with Apple/Android association files on live domain
- EAS build + store submission pipeline

## 5) EAS production setup

1. In `app.json`, replace:
   - `expo.extra.eas.projectId` with your real EAS project ID
2. Login and link project:

```bash
npx eas login
npx eas init
```

3. Build artifacts:

```bash
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

4. Submit to stores:

```bash
npx eas submit --platform android --profile production
npx eas submit --platform ios --profile production
```
