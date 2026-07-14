# Spec: Content Admin

## Requirements

### AUTH-1
Only users whose email is listed in `ADMIN_EMAILS` may access `/admin` routes.

### AUTH-2
Content writes use the Supabase service role server-side after admin verification.

### FOOD-1
Admins can update food name, category, portion, grams, carbs, difficulty, type and notes.

### LESSON-1
Admins can update lesson title and summary.

### EXAM-1
Admins can update exam title, description and exercise IDs per level.

### LESSON-2
Admins can update lesson step title and body content.
