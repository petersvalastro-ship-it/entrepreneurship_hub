# Submit to Teacher + Assignment Inbox

## What students see
- A third button in the "Turn in your work" bars (top and bottom of every assignment): **Submit to Pietro**. It uses the same style as the other two.
- Students must be signed in to their student account (or Google) to submit, so you know who sent it. If a student isn't signed in, clicking it shows "Sign in to submit" and opens the existing Student Account window. Their typed answers stay safe because autosave is already on.
- After submitting, the student sees "Submitted Monday 10:42 AM \u2713". They can fix something and click Submit again. That replaces their copy and marks it "Resubmitted", and you can still see how many times they sent it.
- The Print / Save as PDF and Download buttons stay, as a backup.

## What you see (Teacher Dashboard only)
- A new **Assignment Inbox** tab in the Teacher Dashboard:
  - Grouped by week (This Week / Last Week, same as the Assignments page), then by assignment.
  - Each assignment shows submitted vs. not yet submitted, comparing against your student roster.
  - Each row shows the student name, grade, submitted time, and a "New" or "Reviewed" tag.
- Clicking a submission opens the actual assignment page, read-only, with the student's answers filled in exactly where they typed them. It also has a "Print / Save as PDF" button if you want a copy.
- Mark as Reviewed, plus an optional private note to yourself.
- A count badge on the Teacher Dashboard showing new submissions.

## Privacy
- Only your teacher account can see every submission. Students can only see their own submission status. The same protection your gradebook uses applies here.
- Works for every current and future assignment automatically.

## Technical
- New table `assignment_submission` (student_id, assignment_key, assignment_title, week, answers jsonb, submit_count, submitted_at, reviewed_at, teacher_note), unique on (student_id, assignment_key), with grants and row-level security:
  - Students can insert, update and read their own rows.
  - The teacher can read all rows and update the review fields, using `has_role`.
  - Students cannot change review fields (enforced with a trigger).
- `assignment-autosave.ts`: add a third button. It posts `{type:'neia-submit', answers}` to the parent window. The parent `AssignmentPage` saves it with the signed-in client and replies with the status. Add a read-only mode that fills in saved answers, then disables every field and hides the action bars.
- `TeacherDashboard`: add the Inbox tab, using the existing teacher check, the roster from `student_profile`, and the viewer, which reuses `AssignmentPage` content in read-only mode.
- Add the week and key info to a shared assignments list so the Inbox and the Assignments page use the same grouping.
