# PRD: Team Retrospective Feature

**Product:** Stand-Up Duck
**Author:** Andrew
**Date:** 2026-03-30
**Status:** Draft

---

## 1. Overview

Add a real-time collaborative retrospective board to Stand-Up Duck. Team members sharing a single login can each identify themselves in their own browser, contribute items to customizable categories, indicate agreement with each other's items, and track action items across retros. All state syncs in real-time via Firebase Realtime Database. Each team has its own independent retro — multiple teams can run retros concurrently under the same account.

---

## 2. Goals

- Enable teams to run structured retrospectives directly in Stand-Up Duck
- Support the shared-login model where multiple participants use the same account from different browsers
- Persist retro history per team so action items and insights are not lost between sessions
- Provide a familiar, intuitive board layout (column-based, similar to Trello/Miro)

## 3. Non-Goals

- Multi-user authentication (individual logins per participant)
- Voting/prioritisation beyond simple agreement
- Export to external tools (Jira, Slack, etc.)
- Anonymous mode

---

## 4. User Stories

### 4.1 Start a Retro
> As a team lead, I want to start a retro for my team so that we can reflect on our recent work.

**Acceptance Criteria:**
- User selects a team from the dropdown on the retro page
- User configures initial categories (defaults: "What went well", "What didn't go well", "What should we do differently", "Action Items")
- "Action Items" category is always present and cannot be removed
- User can optionally set a timer duration
- Clicking "Start Retro" creates the active retro for that team, visible to all browsers logged into the same account
- Starting a retro for one team does not affect other teams' retros

### 4.2 Join a Retro
> As a team member, I want to join an in-progress retro and identify myself so that my contributions are attributed to me.

**Acceptance Criteria:**
- When navigating to the retro page while a retro is active for the selected team, the user is prompted to select which participant they are from the team's participant list
- The selection is shown as a "You are: [Name]" indicator with the participant's avatar
- The selection persists for the browser tab's session, scoped to the team (survives page refreshes within the tab)
- Switching to a different team's retro re-prompts for participant selection
- The user can change their selection via a "Change" link
- Multiple browser tabs can each select a different participant

### 4.3 Add a Retro Item
> As a participant, I want to add items to any category so that I can share my thoughts with the team.

**Acceptance Criteria:**
- Each category column has a text input at the bottom for adding new items
- Submitting the input creates an item attributed to the current participant (name + profile picture)
- The item appears in real-time across all connected browsers
- Items display the author's avatar (photo or initials) and name

### 4.4 Agree with an Item
> As a participant, I want to indicate that I agree with another participant's item so the team can see which items have broad support.

**Acceptance Criteria:**
- Each item displays an "Agree" button
- Clicking "Agree" adds the current participant's name to the item
- Agreed participants are displayed differently from the original author (e.g. smaller avatars below the item vs. the author shown prominently at the top)
- A participant can remove their agreement by clicking again (toggle)
- The author cannot agree with their own item (they are already the author)

### 4.5 Manage Categories During a Retro
> As a facilitator, I want to add, rename, or remove categories during a retro to adapt to the discussion.

**Acceptance Criteria:**
- Category names are editable inline (click to edit)
- A "+" button at the end of the column row adds a new category
- Non-protected categories have a delete button (with confirmation dialog)
- The "Action Items" category cannot be deleted (lock icon shown) but can be renamed
- Each category has a "Clear Items" button that removes all items in that category
- All category changes sync in real-time

### 4.6 Use a Timer
> As a facilitator, I want to set a timer for the retro so that we stay on track.

**Acceptance Criteria:**
- Timer duration is optionally configured during retro setup (before starting)
- Timer displays a countdown visible to all browsers
- Controls: Start, Pause, Reset, +5 minutes
- When the timer reaches 0:00, a visual alert appears ("Time's up!" with a pulse animation)
- The retro does **not** auto-complete; the team finishes manually
- Timer state is shared across all browsers (each computes countdown from stored timestamps)

### 4.7 Complete a Retro
> As a facilitator, I want to complete the retro so that the data is saved for future reference.

**Acceptance Criteria:**
- A "Complete Retro" button saves the active retro to history for that team (keyed by date)
- The retro board clears and returns to the setup screen
- Completed retro data includes all categories, items, authors, and agreements
- A completion timestamp is recorded
- Completing one team's retro does not affect other teams

### 4.8 Review Previous Retro Items
> As a team member, I want to see items from the previous retro when starting a new one so we can review what was discussed last time.

**Acceptance Criteria:**
- When starting a new retro, the most recent completed retro for the selected team is loaded
- Previous items are displayed on the board (visually distinguished or noted as carried over)
- A "Clear All Previous Items" button removes all carried-over items **except** those in the Action Items category
- Each category also has its own "Clear Items" button
- Clearing previous items does not modify the stored history

---

## 5. Data Model

### 5.1 Firebase Realtime Database Structure

Retros are scoped by team name so each team has independent active retro and history.

```
users/{uid}/retros/
  {teamName}/
    active/
      startedAt: 1711800000000
      timerDuration: null | 900
      timerStartedAt: null | 1711800060000
      categories/
        {categoryId}/
          id: "cat-uuid-1"
          name: "What went well"
          order: 0
          isProtected: false
      items/
        {itemId}/
          id: "item-uuid-1"
          categoryId: "cat-uuid-1"
          text: "We shipped the feature on time"
          authorId: "participant-uuid"
          createdAt: 1711800120000
          agreedBy/
            "participant-uuid-2": true
    history/
      {date-string}/
        startedAt: ...
        completedAt: ...
        categories/ ...
        items/ ...
```

### 5.2 Active Retro Fields

Path: `users/{uid}/retros/{teamName}/active`

| Field | Type | Description |
|-------|------|-------------|
| `startedAt` | number | Unix timestamp (ms) when the retro was created |
| `timerDuration` | number \| null | Total timer duration in seconds, or null if no timer |
| `timerStartedAt` | number \| null | Unix timestamp (ms) when the timer was started, null if paused/not started |

### 5.3 Categories

Path: `users/{uid}/retros/{teamName}/active/categories/{categoryId}`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `name` | string | Display name |
| `order` | number | Sort order (0-indexed) |
| `isProtected` | boolean | `true` for Action Items only; prevents category deletion |

### 5.4 Items

Path: `users/{uid}/retros/{teamName}/active/items/{itemId}`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `categoryId` | string | References a category ID |
| `text` | string | The retro item content |
| `authorId` | string | References a participant ID |
| `createdAt` | number | Unix timestamp (ms) |

### 5.5 Agreements

Path: `users/{uid}/retros/{teamName}/active/items/{itemId}/agreedBy/{participantId}`

Value: `true`

Using a map (not an array) so concurrent writes from different browsers to different keys don't conflict.

### 5.6 Retro History

Path: `users/{uid}/retros/{teamName}/history/{date-string}` (e.g. `2026-03-30`)

Same structure as active retro, plus:

| Field | Type | Description |
|-------|------|-------------|
| `completedAt` | number | Unix timestamp (ms) when the retro was completed |

One retro per team per day. If multiple retros occur on the same day for the same team, the most recent overwrites the previous.

### 5.7 Browser-Local State

| Storage | Key | Value | Scope |
|---------|-----|-------|-------|
| `sessionStorage` | `retro-participant-{teamName}` | Participant UUID | Per-tab, per-team; cleared when tab closes |

---

## 6. UI/UX Specifications

### 6.1 Page Layout

The retro page (`/retro`) follows the existing app layout with the shared header/navigation. A "Retro" link is added to the navigation bar.

**Board layout:** Horizontal columns (one per category), scrollable horizontally on desktop. On mobile (<768px), columns stack vertically with collapsible headers.

### 6.2 Page States

| State | Condition | What Renders |
|-------|-----------|--------------|
| **Team Selection** | No team selected | Team dropdown (reuses existing `SelectTeam` component) |
| **Setup** | Team selected, no active retro | Category configuration, timer setup, previous retro preview, "Start Retro" button |
| **Participant Select** | Active retro exists, no participant in `sessionStorage` for this team | Full-screen overlay with participant grid (avatar + name) |
| **Active Board** | Active retro exists, participant selected | Column-based board with timer, items, and action bar |

### 6.3 Participant Selection

- Full-screen overlay showing team participants as clickable cards
- Each card displays the participant's avatar (photo or coloured initials via `InitialsAvatar`) and name
- Clicking a card stores the participant ID in `sessionStorage` under `retro-participant-{teamName}` and dismisses the overlay
- Board header shows "You are: [Name] [Avatar]" chip with a "Change" link to re-open the picker

### 6.4 Retro Item Display

Each item card shows:
- **Author:** Avatar (photo or coloured initials via `InitialsAvatar`) + name, displayed prominently
- **Text:** The retro item content
- **Agree button:** Adds the current participant; toggles to "un-agree" if already agreed
- **Agreed participants:** Shown as a row of smaller avatars below the item, distinct from the author display

### 6.5 Timer Display

- Positioned in the board header/action bar
- Shows `MM:SS` countdown
- When expired: red flash/pulse animation, "Time's up!" text
- Controls: Start, Pause, Reset, +5 min

### 6.6 Category Management

- Category header: name (click-to-edit), edit icon, clear-items button, delete button (non-protected only)
- "Action Items" category: lock icon, no delete button, rename allowed
- "+" button at the end of the column row to add a new category
- Delete confirmation dialog before removing a category

### 6.7 Styling

Follows the existing Japanese stationery aesthetic:
- Washi paper card backgrounds (`#FDFBF7`)
- Sumi ink text (`#1C1917`)
- Sakura accents (`#C4637A`)
- Border colour `#D8CCBF`
- Shippori Mincho for headings, Noto Sans JP for body
- Card fade-in animations consistent with existing patterns

---

## 7. Technical Notes

### 7.1 Real-Time Sync

All retro state lives in Firebase Realtime Database under team-scoped paths. The main board component subscribes via a single `onValue` listener on `retros/{teamName}/active` (re-subscribes when team changes). Child components receive data as props. Writes go directly to Firebase; the SDK fires local events optimistically before the server round-trip, so the writing browser sees changes instantly.

### 7.2 Concurrency

- **`agreedBy` map:** Each participant writes to their own key (`agreedBy/{participantId}: true`), avoiding read-modify-write races
- **Item/category creation:** Each uses a unique UUID as key, so simultaneous additions don't conflict
- **Timer:** Stored as `timerDuration` + `timerStartedAt` timestamps; each browser independently computes the countdown display

### 7.3 Existing Components Reused

- `SelectTeam` — team dropdown
- `InitialsAvatar` — participant avatars with photo or coloured initials fallback

---

## 8. Open Questions

1. **Should retro history be viewable as a standalone page?** The current plan only surfaces the previous retro during setup. A "Retro History" page could be a future enhancement.
2. **Should there be a way to move items between categories?** Drag-and-drop adds complexity; could be deferred.
