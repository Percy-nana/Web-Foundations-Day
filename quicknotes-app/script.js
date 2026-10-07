const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const notesList = document.querySelector("#notes-list");
const errorMessage = document.querySelector("#error-message");
const noteCount = document.querySelector("#note-count");
const searchInput = document.querySelector("#search-input");
const clearAllButton = document.querySelector("#clear-all");

const MAX_LENGTH = 200;
const STORAGE_KEY = "quicknotes-notes";

let notes = loadNotes();

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    errorMessage.textContent = "Could not save your notes in this browser.";
  }
}

function formatDate(date) {
  return date.toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = "You have " + notes.length + " notes.";
  }
}

function getVisibleNotes() {
  const term = searchInput.value.trim().toLowerCase();
  if (term === "") {
    return notes;
  }
  return notes.filter(function (note) {
    return note.text.toLowerCase().includes(term);
  });
}

function render() {
  notesList.textContent = "";
  const visible = getVisibleNotes();

  if (notes.length > 0 && visible.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty-message");
    empty.textContent = "No notes match your search.";
    notesList.appendChild(empty);
  }

  visible.forEach(function (note) {
    const li = document.createElement("li");
    li.classList.add("note-card", "category-" + note.category.toLowerCase());

    const text = document.createElement("p");
    text.classList.add("note-text");
    text.textContent = note.text;

    const meta = document.createElement("div");
    meta.classList.add("note-meta");

    const label = document.createElement("span");
    label.classList.add("note-category");
    label.textContent = note.category;

    const date = document.createElement("span");
    date.textContent = note.createdAt;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      deleteNote(note.id);
    });

    meta.append(label, date, deleteBtn);
    li.append(text, meta);
    notesList.appendChild(li);
  });

  updateCount();
}

function validate(text) {
  if (text === "") {
    return "Please type a note first.";
  }
  if (text.length > MAX_LENGTH) {
    return "Notes must be " + MAX_LENGTH + " characters or fewer.";
  }
  return "";
}

function addNote(text, category) {
  const note = {
    id: Date.now(),
    text: text,
    category: category,
    createdAt: formatDate(new Date())
  };
  notes.push(note);
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter(function (note) {
    return note.id !== id;
  });
  saveNotes();
  render();
}

noteForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = noteInput.value.trim();
  const problem = validate(text);

  if (problem) {
    errorMessage.textContent = problem;
    return;
  }

  errorMessage.textContent = "";
  addNote(text, noteCategory.value);
  noteInput.value = "";
  noteInput.focus();
});

searchInput.addEventListener("input", render);

clearAllButton.addEventListener("click", function () {
  if (notes.length === 0) {
    return;
  }
  if (confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    render();
  }
});

render();