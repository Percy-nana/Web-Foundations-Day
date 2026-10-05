// Select DOM Elements
const noteText = document.getElementById('note-text');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');

// Helper to count non-empty words
function getWordCount(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// Function to update character and word counters, class warnings, and save draft
function updateCounts() {
  const text = noteText.value;
  const length = text.length;
  const words = getWordCount(text);

  // Update text display
  charCount.textContent = `${length} / 200 characters`;
  wordCount.textContent = `${words} word${words === 1 ? '' : 's'}`;

  // Reset classes on the character count element
  charCount.classList.remove('warning', 'over');

  // Handle line warnings (> 200 priority takes precedence over > 180)
  if (length > 200) {
    charCount.classList.add('over');
  } else if (length > 180) {
    charCount.classList.add('warning');
  }

  // Save current draft to localStorage
  localStorage.setItem('draft', text);
}

// Function to clear textarea, state, and localStorage draft
function clearAll() {
  noteText.value = '';
  localStorage.removeItem('draft');
  updateCounts();
}

// Input event listener for textarea
noteText.addEventListener('input', () => {
  updateCounts();
});

// Escape key press clear listener inside textarea
noteText.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearAll();
  }
});

// Clear button click listener
clearBtn.addEventListener('click', clearAll);

// Theme Toggle functionality
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Initial load setup (runs when page loads)
window.addEventListener('DOMContentLoaded', () => {
  // Restore draft
  const savedDraft = localStorage.getItem('draft');
  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }
  updateCounts();

  // Restore saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = 'Light mode';
  } else {
    document.body.classList.remove('dark');
    themeToggle.textContent = 'Dark mode';
  }
});