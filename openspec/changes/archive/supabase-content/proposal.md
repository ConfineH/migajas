# Proposal: Supabase Content Layer

## Intent
Serve foods, lessons and exams from Supabase with JSON fallback for local/dev resilience.

## Success Criteria
- [x] Tables seeded from existing JSON
- [x] App hydrates content on server startup
- [x] Client components unaffected (content-cache split)
