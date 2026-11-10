# Fix the Blank Class Whiteboard Embed

## Why it went blank
- Nothing changed in the site's code — the embed iframe on the Whiteboard page is exactly the same as when it worked.
- The Figma board itself no longer allows public access. The board link now returns "access denied" (403) and Figma's embed service redirects to an empty placeholder page, which renders as the blank dotted canvas seen in the screenshot.
- This happens on Figma's side when a board's sharing is changed from "Anyone with the link" to restricted, the board is moved to a private team/project, or it is duplicated or deleted.

## What needs to happen
1. In Figma, open the MS ENTREPRENEURSHIP board and check **Share** settings:
   - Set link access to **"Anyone with the link" → can view** (or can edit, if students should collaborate).
   - If the board was moved or replaced, copy the new board URL.
2. In Figma use **Share → Copy embed code** (or the board link) and provide the fresh link.
3. Update the iframe `src` on the Class Whiteboard page with the fresh embed URL, keeping:
   - The 600px responsive frame and high-contrast styling.
   - The "Open in Figma" button pointed at the same board URL.

## Verification
- Confirm the embed URL returns a live board (no redirect to Figma's placeholder page).
- Open the Whiteboard page in the preview and confirm the board contents render.
