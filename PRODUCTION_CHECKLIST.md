# Production Readiness Checklist

## ✅ Frontend - COMPLETE

### Pages Created
- [x] **Landing Page** (`app/page.tsx`)
  - Hero section with gradient background
  - Navigation (Brain logo, Login, Pricing links)
  - 3 feature cards (Semantic Search, Smart Summaries, Contextual Retrieval)
  - CTA button to pricing

- [x] **Pricing Page** (`app/pricing/page.tsx`)
  - Hobby plan (Free) - Feature list display
  - Pro plan ($19/month) - Checkout initiation
  - Email capture for checkout flow
  - Uses `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` env var

- [x] **Login Page** (`app/login/page.tsx`)
  - API key input field
  - Validates via `GET /api/user/me`
  - Saves to AuthContext + localStorage + cookie
  - Error handling for invalid keys

- [x] **Checkout Success** (`app/checkout/success/page.tsx`)
  - Confirmation message
  - "Check your email" instruction
  - Links to login and dashboard

- [x] **Checkout Canceled** (`app/checkout/canceled/page.tsx`)
  - Cancellation message
  - Retry link back to pricing
  - Link to dashboard

### Core Features
- [x] **Route Protection** (`middleware.ts`)
  - Checks `memvault_api_key` cookie
  - Public routes: `/`, `/pricing`, `/login`, `/checkout/*`
  - Protected routes: `/dashboard/*`
  - Redirects to `/login` if unauthorized

- [x] **Authentication** (`lib/auth-context.tsx`)
  - Updated `setUserWithStorage` to set cookie
  - 30-day cookie expiry for persistent sessions
  - Cookie options: `path=/; max-age=2592000; SameSite=Lax`

- [x] **API Keys Management** (`app/dashboard/api-keys/page.tsx`)
  - List all user API keys
  - Copy to clipboard functionality
  - Show/hide key masking (`sk_live_****`)
  - Delete key with confirmation
  - Create new key button
  - Uses `GET /api/user/api-keys` and `DELETE /api/user/api-keys/:id`

- [x] **Toast Notifications** (`hooks/use-toast.ts`)
  - Simple alert-based implementation
  - Supports title, description, variant
  - Can be upgraded to sonner/react-hot-toast later

- [x] **Upgrade Flow** (`components/UpgradeButton.tsx`)
  - Stripe checkout for dashboard upgrades
  - Hides button for PRO users
  - Uses authenticated `createCheckoutSession`

### Cleanup
- [x] **Removed DemoUserSetup**
  - Removed from `app/dashboard/page.tsx`
  - Removed from `app/dashboard/billing/page.tsx`
  - Component file kept for testing purposes

---

## ⚠️ Environment Variables - REQUIRED

Add to `.env.local`:

```env
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://moderate-krystal-memvault-af80fe26.koyeb.app

# Stripe
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_XXXXXXXXXXXX
```

**Where to get Stripe Price ID:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Products → Your Pro Plan
3. Copy the Price ID (starts with `price_`)
4. Paste into `.env.local`

---

## ❌ Backend - PENDING IMPLEMENTATION

### Required Endpoints

#### 1. User Authentication
```typescript
GET /api/user/me
Headers: { Authorization: "Bearer sk_live_..." }
Response: {
  id: string;
  email: string;
  plan: "FREE" | "PRO";
  // ... other user fields
}
```

#### 2. API Keys Management
```typescript
GET /api/user/api-keys
Headers: { Authorization: "Bearer sk_live_..." }
Response: {
  apiKeys: Array<{
    id: string;
    key: string;
    name: string;
    createdAt: string;
    lastUsedAt?: string;
  }>
}

DELETE /api/user/api-keys/:id
Headers: { Authorization: "Bearer sk_live_..." }
Response: { success: true }
```

#### 3. Public Stripe Checkout
```typescript
POST /api/public/stripe/checkout
Body: {
  email: string;
  priceId: string;
}
Response: {
  sessionId: string;
  url: string;
}
```
- Creates Stripe Checkout Session
- No authentication required (public endpoint)
- Used by pricing page for new signups

#### 4. Authenticated Stripe Checkout
```typescript
POST /api/stripe/create-checkout-session
Headers: { Authorization: "Bearer sk_live_..." }
Body: {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}
Response: {
  sessionId: string;
  url: string;
}
```
- For existing users upgrading from dashboard
- Uses authenticated user's email
- **Prompt created:** See `BACKEND_CHECKOUT_PROMPT.md`

#### 5. Stripe Portal Session (Already Exists)
```typescript
POST /api/stripe/create-portal-session
Headers: { Authorization: "Bearer sk_live_..." }
Response: {
  url: string;
}
```
- Manage subscription, payment methods, invoices

### Webhook Handler
The Stripe webhook (`POST /api/stripe/webhook`) should:
1. Handle `checkout.session.completed` event
2. Extract email from session metadata
3. Create new user account if doesn't exist
4. Generate API key for user
5. **Send email with API key** (critical!)
6. Provision PRO plan access

---

## ❌ Email Service - PENDING SETUP

### Required Integration
- **Service:** Resend, SendGrid, or similar
- **Trigger:** Stripe webhook after successful checkout
- **Template:** Welcome email with API key

### Email Content Template
```
Subject: Welcome to MemVault - Your API Key

Hi there!

Thank you for subscribing to MemVault Pro! 🎉

Your API Key:
sk_live_XXXXXXXXXXXX

To get started:
1. Go to https://memvault-demo.vercel.app/login
2. Enter your API key above
3. Start building with semantic memory!

Questions? Reply to this email.

Best,
The MemVault Team
```

---

## 🔄 User Flow (Complete)

### New User Journey
1. Land on `/` → See hero and features
2. Click "Get Started" → Go to `/pricing`
3. Enter email + click "Get Started" on Pro plan
4. Redirect to Stripe Checkout
5. Complete payment
6. Stripe webhook triggers:
   - Create user account
   - Generate API key
   - Send email with key
7. Redirect to `/checkout/success`
8. Check email for API key
9. Go to `/login` → Enter API key
10. Redirect to `/dashboard` → Authenticated session

### Returning User Journey
1. Go to `/login`
2. Enter API key
3. Verify via `GET /api/user/me`
4. Cookie + localStorage set
5. Redirect to `/dashboard`
6. All `/dashboard/*` routes accessible

### Upgrade Journey (Existing Free User)
1. Already logged in on `/dashboard`
2. Click "Upgrade" button
3. Authenticate via `POST /api/stripe/create-checkout-session`
4. Redirect to Stripe Checkout
5. Complete payment
6. Stripe webhook updates plan to PRO
7. Redirect back to `/dashboard`
8. PRO features unlocked

---

## 📚 Documentation Created

- [x] `BACKEND_CHECKOUT_PROMPT.md` - Instructions for implementing authenticated checkout endpoint
- [x] `STRIPE_SETUP_GUIDE.md` - Complete Stripe integration documentation
- [x] `PRODUCTION_CHECKLIST.md` - This file

---

## 🚀 Deployment Steps

### 1. Frontend (Vercel)
- All code is production-ready
- Add environment variables in Vercel dashboard
- Deploy from `main` branch

### 2. Backend (Koyeb)
- Implement missing endpoints listed above
- Add email service integration
- Configure Stripe webhook URL
- Redeploy backend

### 3. Stripe Configuration
1. Create Pro plan product
2. Copy Price ID to `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
3. Add webhook endpoint: `https://your-backend.koyeb.app/api/stripe/webhook`
4. Copy webhook secret to backend env
5. Test checkout flow in Stripe test mode

### 4. Testing
- [ ] Complete checkout flow (test mode)
- [ ] Verify email delivery with API key
- [ ] Test login with received API key
- [ ] Verify middleware protection
- [ ] Test API keys management (create, delete, copy)
- [ ] Test upgrade flow for existing users
- [ ] Verify Stripe portal access

---

## ⚡ Quick Start (Development)

1. Clone repo
2. `npm install`
3. Copy `.env.local` with required vars
4. `npm run dev`
5. Visit `http://localhost:3000`

---

## 📝 Notes

- **DemoUserSetup removed:** Dashboard now shows real user data only
- **Cookie auth:** More secure than localStorage-only approach
- **Public routes:** Landing and pricing pages accessible without auth
- **Toast system:** Basic implementation, can upgrade to better library later
- **Backend priority:** Focus on `/api/user/me`, `/api/public/stripe/checkout`, and email service first

---

## Status Summary

✅ **Frontend:** 100% Complete  
⚠️ **Environment:** Needs `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`  
❌ **Backend:** 5 endpoints + email service pending  
❌ **Email:** Service integration required  

**Next Priority:** Implement backend endpoints, starting with `GET /api/user/me` for login validation.
