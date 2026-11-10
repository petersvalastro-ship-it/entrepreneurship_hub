# Student Portal Progress Map

## What will change
- Add a TypingClub-inspired learning map near the top of the signed-in student dashboard, before the study plan and goals.
- Group the existing LaunchPad sections into six chapter pathways with compact, connected lesson tiles.
- Show four clear states on every tile: Attempted, Completed, Locked, and Recommended, using both color and icons for accessibility.
- Use saved textbook progress to determine each state: completed sections stay complete, started work remains attempted, the next available section is recommended, and later sections remain locked until their prerequisite is complete.
- Add a “Pick Up Where You Left Off” panel that opens the LaunchPad textbook at the recommended or most recently attempted section.
- Add an overall completion summary and a legend so students can understand their pathway at a glance.
- Preserve high-contrast mode and make the map usable on phones, tablets, keyboards, and screen readers.

## Technical details
- Keep this as a presentation-layer enhancement using the existing chapter definitions and saved `launchpad_progress` records; no database migration is needed.
- Pass the complete section progress map into the student profile rather than only completed section IDs.
- Extend textbook navigation so selecting a map tile opens the matching chapter and section.
- Treat a saved note or opened/incomplete progress record as Attempted; completion remains based on the existing saved completion flag.

## Verification
- Check all four visual states with representative progress data.
- Confirm map tiles and the continue action open the correct textbook section.
- Verify desktop and mobile layouts, keyboard focus, high contrast, and current preview errors.
