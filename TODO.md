# Fix Auth Redirect Issue

## Completed Steps

- [x] 1. Create wrangler.toml with mcserverstatus config + ASSETS binding
- [x] 2. git add/commit/push wrangler.toml + TODO.md

## Pending Steps

- [ ] 3. Deploy & verify (wrangler deploy or CI)
- [ ] 4. Test: clear cookies on https://mcserverstatus.[subdomain].workers.dev → auto redirect /login/login.html → enter password → dashboard access
- [ ] 5. wrangler tail --name mcserverstatus for logs if needed

## Expected Flow (Confirmed No Errors)

- No auth_token cookie → Worker 302 to /login/login.html (ASSETS serves it)
- Login form POST /login → if password == env.SITE_PASSWORD, set HttpOnly cookie → redirect /
- Valid cookie → serve index.html + script.js dashboard (MC status)
- All files syntax-clean; GitHub CI should deploy on push.
