
// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" }
];

// 1. searchNotes(word) - returns array of notes containing word (case-insensitive)
function searchNotes(word) {
  if (!word) return [];
  const lowerword = word.toLowerCase();
  return notes.filter(note => note.text.toLowerCase().includes(lowerWord));
}

// 2. longestNote() - returns note object with most characters, or null if empty
function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) => 
    current.text.length > longest.text.length ? current : longest
  );
}

// 3. countByCategory() - returns object counting notes per category
function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };
  notes.forEach(note => {
    if (counts.hasOwnProperty(note.category)) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  });
  return counts;
}

// 4. getSummary() - returns formatted summary string
function getSummary() {
  const counts = countByCategory();
  const totalNotes = notes.length;
  const noteWord = totalNotes === 1 ? "note" : "notes";
  return `${totalNotes} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

// 5. isDuplicate(text) - checks if note text already exists (ignoring case & extra spaces)
function isDuplicate(text) {
  const cleanInput = text.trim().toLowerCase();
  return notes.some(note => note.text.trim().toLowerCase() === cleanInput);
}

// 6. addNote(text, category) - adds note if valid and not duplicate
function addNote(text, category) {
  const allowedCategories = ["personal", "work", "study"];
  
  if (!text || text.trim().length < 1 || text.trim().length > 200) {
    console.log(`Failed to add note: Text length must be between 1 and 200 characters.`);
    return false;
  }

  if (!allowedCategories.includes(category)) {
    console.log(`Failed to add note: Invalid category "${category}". Must be personal, work, or study.`);
    return false;
  }

  if (isDuplicate(text)) {
    console.log(`Failed to add note: Duplicate note text "${text.trim()}".`);
    return false;
  }

  const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  const newNote = { id: newId, text: text.trim(), category };
  notes.push(newNote);
  console.log(`Successfully added note: "${newNote.text}"`);
  return true;
}

// ==========================================
// TEST CONSOLE LOGS
// ==========================================

console.log("--- Testing searchNotes ---");
console.log("Normal case ('report'):", searchNotes("report"));
console.log("Edge case ('xyz' - no results):", searchNotes("xyz"));

console.log("\n--- Testing longestNote ---");
console.log("Longest note:", longestNote());

console.log("\n--- Testing countByCategory ---");
console.log("Counts per category:", countByCategory());

console.log("\n--- Testing getSummary ---");
console.log("Summary:", getSummary());

console.log("\n--- Testing isDuplicate ---");
console.log("Normal case ('Call mum'):", isDuplicate("Call mum"));
console.log("Edge case ('  call MUM  ' with spaces & case):", isDuplicate("  call MUM  "));
console.log("Non-duplicate case ('New Unique Note'):", isDuplicate("New Unique Note"));

console.log("\n--- Testing addNote ---");
console.log("Valid addition:");
addNote("Review PR reviews", "work");

console.log("\nEdge Cases for addNote:");
addNote("Call mum", "personal"); // Duplicate text
addNote("Valid text", "invalidCategory"); // Invalid category
addNote("", "study"); // Empty string

