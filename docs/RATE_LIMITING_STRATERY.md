```
┌─────────────────────────────────────────────────────────────────┐
│ Layer          │ Target              │ Limit                     │
├─────────────────────────────────────────────────────────────────┤
│ Global         │ IP address          │ 100 req/min toàn API      │
│ Auth endpoint  │ IP address          │ 20 req/min /auth/*        │
│ Login attempt  │ Email + IP          │ 5 fails / 15 min         │
│ OTP request    │ Email               │ 3 requests / 15 min      │
│ OTP verify     │ Email + OTP session │ 5 attempts / session     │
│ Account lock   │ User account        │ 10 fails → lock 30 min   │
│ Tenant-wide    │ tenant_id           │ 1000 auth req/min (burst) │
└─────────────────────────────────────────────────────────────────┘

```