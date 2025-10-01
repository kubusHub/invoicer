# TODO: Implement Access Code Login with Session Management

## Steps:

1. Update Login.vue: Change to access code input, validate hardcoded code, set sessionStorage on success, style with icons.
2. Remove Register.vue and related route in router/index.js.
3. Update router/index.js: Change guard to check sessionStorage for valid session (not expired).
4. Update Dashboard.vue logout: Clear sessionStorage instead of signOut.
5. Test: Login with code, access dashboard, logout, try direct access without login.

## Completed:

- [x] Step 1
- [x] Step 2
- [x] Step 3
- [x] Step 4
- [ ] Step 5
