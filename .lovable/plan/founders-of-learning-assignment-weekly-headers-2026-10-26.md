# Founders of Learning assignment + weekly headers

## 1. New assignment: Founders of Learning
- Title: "Founders of Learning: Build, Teach, Improve" — dates "Monday, October 26 – Friday, October 30, 2026".
- Full page built from the 8-page PDF, same style as the other assignments (DM Sans, 42/24/19/17 heading scale, Title Case):
  - Partner names, class/block, presentation date; week schedule (Mon plan, Tue build/test, Thu revise, Fri final).
  - Challenge, topic choice checkboxes, "Every Lesson Must Include" checklist.
  - Parts 1–6 as typed answer boxes and checkboxes (topic, entrepreneurship word checklist, roles, goal/outcome, Question of the Day, closing check, 3 vocabulary words, 10-minute lesson map table with "what we'll do" and "leader" boxes, materials, Canva slide plan, activity design and test, Glow/Grow/revision).
  - Monday and Tuesday checkpoints, Final Lesson Checklist, What to Submit by Friday (with a box for the Canva link), Final Partner Check.
- Same tools as others: orange "View / Download PDF" box with your PDF, Download my work + Print / Save as PDF buttons, autosave, Back to Assignments.
- Own page at /learning/assignments/founders-of-learning, also added to the Learning menu.

## 2. Assignments page grouped by week
- Clear header bands, newest week on top:
  - "This Week · October 26 – 30, 2026" — Founders of Learning
  - "Last Week · October 19 – 23, 2026" — Assumption Buster, Rebus Studio, Customer Interview Lab, Friday Learning Loop
- Headers are labeled by dates as well, so they stay accurate; a small "Current" badge on this week's group.

## Technical
- `src/content/founders-of-learning.html`, PDF uploaded as asset, new DOCS entry in AssignmentPage, new route file, menu/tab id `assignmentFounders`.
- AssignmentsPage: add `week` field and render grouped sections sorted newest first.
