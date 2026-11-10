<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Assignment list, dates and page addresses live only in src/lib/assignment-docs.ts; week grouping is computed from each entry's date text (src/lib/assignment-weeks.ts) — one place to add an assignment, no hand-maintained week labels.
- Teacher-uploaded lessons live in the lesson_upload table (PDF in the private lesson-pdfs bucket, read via signed URLs); useAssignments() merges them with assignment-docs.ts, so every assignment list must read from that hook.
- Glossary terms live only in src/lib/glossary.ts (built-in, de-duplicated by glossaryKey) plus the glossary_term table for teacher-added terms; useGlossary() merges and sorts them A–Z, so every glossary count or list must read from that hook.
- Shared Hub navigation lives in HubHeader with one menu definition for desktop and mobile; account and accessibility actions use the same keyboard-accessible dropdown to avoid duplicated controls.
- Homepage and directory surfaces use scoped hub-surface semantic tokens and hubOutline/hubLink Button variants; scoping keeps assignment detail renderers and their forms unchanged.
- Homepage card elevation is scoped under hub-homepage and uses global semantic shadow/badge tokens so directory and assignment styles remain unchanged.
