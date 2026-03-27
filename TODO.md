# Fix Blank Screen - Clebynho Cortes Site
Status: 🔄 In Progress

## Approved Plan Breakdown

### 1. Setup Dev Environment ✅ [AI Step]
- [x] Create detailed TODO.md with steps
- [ ] User: Run `npm install` (if errors, delete node_modules/ + retry)
- [ ] User: Run `npm run dev` → Visit http://localhost:5173

### 2. Quick Runtime Fixes [AI Next]
- [ ] Edit src/hooks/usePayment.ts: Add try/catch MP/Supabase, prevent crashes
- [ ] Create .env: Mock keys for MP/EmailJS
- [ ] Test: Form loads? Select services → Calendar → PIX modal?

### 3. Test Full Flow
- [ ] Fill form → Confirm → PIX QR shows (mock)
- [ ] Click 'Eu paguei' → 8s auto-success toast
- [ ] WhatsApp button

### 4. Deploy
- [ ] `npm run build`
- [ ] Vercel: `vercel --prod`

**Next AI Action (after your `npm run dev`)**: If still blank, paste F12 console errors. Otherwise mark as ✅.

**Commands to run NOW**:
```
npm install
npm run dev
```
Open http://localhost:5173 and report console (F12 → Console tab).

