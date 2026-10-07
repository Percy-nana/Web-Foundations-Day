# QuickNotes

QuickNotes is a small note-taking web app built with plain HTML, CSS and JavaScript. You type a short note, pick a category (Personal, Work or Study), and it appears as a colour-coded card. You can search your notes, delete them one by one or all at once, and everything is saved in your browser so your notes are still there after a refresh.

## Features

- Add notes with a category: Personal, Work or Study
- Each note card shows the text, a category label, the date and time, and a Delete button
- Validation: empty notes and notes over 200 characters show an error message
- Delete any single note
- Live search that ignores upper and lower case
- A friendly "No notes match your search." message when nothing is found
- Note counter that reads correctly for zero, one and many notes
- Notes are saved with `localStorage` and survive a page refresh
- Colour-coded category cards (teal, dark red, blue)
- Responsive layout that stacks the form on screens 600px wide or narrower
- Bonus: "Clear all" button that asks for confirmation before deleting everything

## How to run locally

1. Download or clone the repository:
   ```
   git clone https://github.com/Percy-nana/quicknotes-app.git
   ```
2. Open the `quicknotes-app` folder.
3. Double-click `index.html` to open it in your browser. No build step or server is needed.

## What I learned

- How to build a page with semantic HTML (`header`, `main`, `section`, `footer`) and link a `label` to its `input` with `for` and `id`.
- How to lay out a form with Flexbox and use a `@media (max-width: 600px)` rule to change the layout on small screens.
- How to keep data as an array of objects, rebuild the screen from it with a `render()` function, and use `createElement` and `textContent` instead of `innerHTML` so user text can never run as code.
- How to save and load data with `localStorage`, using `JSON.stringify` and `JSON.parse`.
- How to make small, meaningful Git commits, one for each step of the project.
