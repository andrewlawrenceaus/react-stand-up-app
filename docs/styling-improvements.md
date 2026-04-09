# Styling Improvements

Suggested UI/CSS improvements across all pages of the Stand-Up Duck app. Each item includes the file, selector, and specific change to make.

Theme reference — the app uses a "Japanese Stationery" palette:
- Background: `#F5F0E8` (washi cream)
- Card background: `#FDFBF7`
- Border: `#D8CCBF`
- Text: `#1C1917` (sumi black)
- Muted text: `#9A918A`
- Accent: `#C4637A` (sakura pink)
- Fonts: `'Shippori Mincho'` (headings), `'Noto Sans JP'` (body)

---

## Global / Header

All changes in `src/components/header/header.css`.

### 1. Increase nav link font size

The nav links at 0.78rem are hard to read on larger screens.

```css
/* selector: .site-header__link */
/* change font-size from 0.78rem to 0.85rem */
font-size: 0.85rem;
```

### 2. Increase header height

58px feels cramped with the small text. Increase to 62px for more breathing room.

```css
/* selector: .site-header__inner */
/* change height from 58px to 62px */
height: 62px;
```

Also update `main` min-height in `src/global.css`:

```css
/* selector: main */
/* change min-height from calc(100vh - 58px) to calc(100vh - 62px) */
min-height: calc(100vh - 62px);
```

And `src/components/participants/participants.css`:

```css
/* selector: .crew-page */
/* change min-height from calc(100vh - 58px) to calc(100vh - 62px) */
min-height: calc(100vh - 62px);
```

### 3. Make "Log Out" button more visible

The ghost button blends into the background. Add a faint background tint.

```css
/* selector: .site-header__auth-btn */
/* add background color */
background: #F5F0E8;
```

### 4. Add background pill to active nav link

The thin bottom border alone is easy to miss. Add a subtle background highlight.

```css
/* selector: .site-header__link--active */
/* add background and border-radius */
background: rgba(196, 99, 122, 0.07);
border-radius: 3px;
```

---

## Manage Teams

All changes in `src/components/manage-teams/manage-teams.css`.

### 5. Uniform team card height

Team cards with different member counts have different heights. Set a minimum.

```css
/* selector: .team-card */
/* add min-height */
min-height: 220px;
```

### 6. Replace dashed border on "New team" card

The dashed border looks like a skeleton/placeholder rather than an intentional element. Use a solid border with subtle differentiation.

```css
/* selector: .add-team-card */
/* change border from "1px dashed #C5BAA5" to solid with slightly different shade */
border: 1px solid #D8CCBF;
/* add a left accent border to distinguish it */
border-left: 2px solid #C4637A;
```

### 7. Increase edit button click target

The pencil edit button is too small. Add padding and a hover background.

```css
/* selector: .team-card__edit-btn */
/* increase padding and add hover background */
padding: 0.3rem 0.625rem;
min-width: 28px;
text-align: center;
```

```css
/* selector: .team-card__edit-btn:hover */
/* add subtle background */
background: rgba(196, 99, 122, 0.06);
```

### 8. Increase team member avatar size

The member row avatars are 34px which is small. Increase to 38px.

```css
/* selector: .team-member-avatar */
/* change width and height from 34px to 38px */
width: 38px;
height: 38px;
font-size: 0.75rem;
```

```css
/* selector: .team-member-photo */
/* change width and height from 34px to 38px */
width: 38px;
height: 38px;
```

---

## Participants

All changes in `src/components/participants/participants.css`.

### 9. Fix participant grid empty tan area

The grid uses `background: #D8CCBF` for the 1px gap lines, but `auto-fill` leaves unfilled grid tracks that show this background as large tan blocks. Fix by removing the background trick and using proper borders on the cards instead.

```css
/* selector: .crew-grid */
/* remove background color and change gap strategy */
display: grid;
grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
gap: 0;
background: transparent;         /* was #D8CCBF */
border: 1px solid #D8CCBF;
margin-top: 2.5rem;
```

```css
/* selector: .crew-card */
/* add individual borders to replace the gap-based grid lines */
border-right: 1px solid #D8CCBF;
border-bottom: 1px solid #D8CCBF;
```

This way, empty grid cells won't show a tan background — only cells with actual cards will have visible borders.

### 10. Improve "+ Photo" button affordance

The upload button looks like plain text. Add a dashed border to signal interactivity.

```css
/* selector: .add-form-upload-btn */
/* change border style to dashed */
border: 1px dashed #D8CCBF;
/* add a subtle icon-like padding */
padding: 0.35rem 0.85rem;
```

### 11. Increase disabled button visibility

The "Add Participant" button at `opacity: 0.3` is nearly invisible. Increase to 0.45.

```css
/* selector: .add-form-submit:disabled */
/* change opacity from 0.3 to 0.45 */
opacity: 0.45;
```

Also apply the same to `.add-team-submit:disabled` in `manage-teams.css`:

```css
/* selector: .add-team-submit:disabled */
/* change opacity from 0.3 to 0.45 */
opacity: 0.45;
```

### 12. Show delete buttons only on hover (already implemented)

The delete buttons on participant cards already use `opacity: 0` and show on hover via `.crew-card:hover .crew-card__delete`. No change needed — this is already well-implemented.

---

## Run Stand-Up

All changes in `src/components/run-stand-up/run-standup.css`.

### 13. Constrain duck start image size

The `duck-card__photo` has `aspect-ratio: 3 / 4` with `width: 100%` which makes it very large, pushing the CTA below the fold.

```css
/* selector: .duck-card__photo */
/* add max-height to constrain the image on the start screen */
max-height: 280px;
object-position: center;
```

### 14. Improve "Ready when you are" subtitle contrast

The `.duck-card__subtitle` color `#9A918A` against `#FDFBF7` background has low contrast. Darken it.

```css
/* selector: .duck-card__subtitle */
/* change color from #9A918A to #7A7468 for better readability */
color: #7A7468;
```

### 15. Add progress indicator during stand-up

The active stand-up card shows only an avatar and name. The progress dots exist (`.duck-card__progress`) but are tiny (5px). Increase their size and add a counter label.

```css
/* selector: .duck-card__progress-dot */
/* increase from 5px to 7px */
width: 7px;
height: 7px;
```

This is a CSS-only change. For a "2 of 3" text counter, a small JSX addition would be needed in the component that renders `duck-card__content` — add a `<span className="duck-card__subtitle">` showing `{currentIndex + 1} of {total}` below the name.

### 16. Group "Pass the Duck" and "Not Ready" buttons

The two buttons sit in `.duck-card__actions` but feel disconnected. Make them equal width.

```css
/* selector: .duck-btn--secondary (within .duck-card__actions) */
/* add flex: 1 to match the primary button */
flex: 1;
text-align: center;
```

The `.duck-btn--primary` already has `flex: 1`. Adding it to `--secondary` as well will make them equal width. If you don't want ALL secondary buttons to be flex:1, scope it:

```css
.duck-card__actions .duck-btn--secondary {
  flex: 1;
  text-align: center;
}
```

---

## Retro

All changes in `src/components/retro/retro.css`.

### 17. Increase column header padding

The `.retro-category-editor` is cramped at `padding: 0.75rem`.

```css
/* selector: .retro-category-editor */
/* increase padding */
padding: 0.875rem 1rem;
gap: 0.625rem;
```

### 18. Set minimum height on retro columns

The columns stop abruptly when there are few items.

```css
/* selector: .retro-column */
/* add min-height */
min-height: 400px;
```

```css
/* selector: .retro-column__items */
/* increase min-height from 60px to 200px */
min-height: 200px;
```

### 19. Add toolbar background to actions bar

The "Clear All", "I'm Finished", "Complete Retro" buttons float without grouping.

```css
/* selector: .retro-actions */
/* add background and padding to create a toolbar feel */
background: #FDFBF7;
border: 1px solid #D8CCBF;
padding: 0.625rem 1rem;
border-radius: 1px;
```

### 20. Increase voting badge size and contrast

The "Agree" button and count are too small at `font-size: 0.65rem`.

```css
/* selector: .retro-item__agree-btn */
/* increase font-size from 0.65rem to 0.72rem and adjust padding */
font-size: 0.72rem;
padding: 0.2rem 0.6rem;
```

### 21. Add visual separation to participants sidebar

The sidebar at `.retro-sidebar` has the same border as columns, making it blend in.

```css
/* selector: .retro-sidebar */
/* add a left accent border and slightly different background */
border-left: 2px solid #C4637A;
background: #FAF6EF;
```

---

## Pick Rep

All changes in `src/components/pick-representative/pick-representative.css`.

### 22. Add a name legend below the wheel

This requires a small JSX change in the Pick Representative component. After the `<canvas>` element, add a flex row of name badges:

```jsx
<div className="pick-rep__legend">
  {participants.map(p => (
    <span key={p.id} className="pick-rep__legend-item">
      {p.name}
    </span>
  ))}
</div>
```

Add CSS:

```css
.pick-rep__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.pick-rep__legend-item {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 0.75rem;
  color: #7A7468;
  background: #FDFBF7;
  border: 1px solid #D8CCBF;
  padding: 0.2rem 0.625rem;
  border-radius: 1px;
}
```

### 23. Vertically center the wheel in the viewport

The wheel and button sit at the top with lots of empty space below.

```css
/* selector: .pick-rep__page */
/* add flexbox centering */
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
min-height: calc(100vh - 62px);  /* subtract header height */
padding: 2rem;
```

Remove `margin-top: 1rem` from `.pick-rep__wheel-area` since centering handles the spacing.

### 24. Increase the wheel pointer size

The pointer triangle above the wheel is drawn on the canvas in the component JS (likely in a `drawWheel` or similar function). Find the canvas drawing code and increase the pointer triangle dimensions. Look for something like:

```js
// The pointer is drawn as a triangle above the wheel center
// Increase the triangle size — typical values to change:
// height from ~12px to ~18px
// base width from ~14px to ~20px
```

Search for the drawing logic with: `grep -r "pointer\|triangle\|moveTo.*lineTo" src/components/pick-representative/`

---

## Priority Order

Highest-impact changes to implement first:

1. **#9** — Fix participant grid empty tan area (visual bug)
2. **#18** — Retro column minimum height (layout completeness)
3. **#13** — Constrain duck image size (first impression)
4. **#11** — Disabled button visibility (accessibility)
5. **#23** — Center Pick Rep wheel (layout polish)
6. **#14** — Subtitle contrast (accessibility)
7. **#19** — Retro actions toolbar (visual grouping)
8. **#1–4** — Header tweaks (global polish)
9. Remaining items in any order
