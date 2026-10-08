# Supabase authentication URL setup

In the production Supabase project, open **Authentication → URL Configuration**
and set:

- **Site URL:** `https://www.rayyithunn.com/admin/set-password`
- **Redirect URL:** `https://www.rayyithunn.com/admin/set-password`

For local development, this redirect may also be added:

- `http://localhost:5173/admin/set-password`

The Site URL is the fallback destination used by invitations sent from the
Supabase Dashboard. After changing it, resend invitations that were created
while the Site URL pointed to localhost; existing email links retain their old
destination.
