const questions = [
  // ===== ROOM 0 - ENTRANCE HALL (Nursery / LKG / UKG) =====
  {
    id: 1,
    room: 0,
    question: "Which animal says \"Moo\"?",
    options: [
      { text: "Cow", emoji: "\u{1F404}", isCorrect: true },
      { text: "Dog", emoji: "\u{1F415}", isCorrect: false },
      { text: "Cat", emoji: "\u{1F408}", isCorrect: false },
    ],
  },
  {
    id: 2,
    room: 0,
    question: "Which one is a fruit?",
    options: [
      { text: "Apple", emoji: "\u{1F34E}", isCorrect: true },
      { text: "Dog", emoji: "\u{1F415}", isCorrect: false },
      { text: "Car", emoji: "\u{1F697}", isCorrect: false },
    ],
  },
  {
    id: 3,
    room: 0,
    question: "What color is the sky?",
    options: [
      { text: "Blue", emoji: "\u{1F30A}", isCorrect: true },
      { text: "Green", emoji: "\u{1F33F}", isCorrect: false },
      { text: "Red", emoji: "\u{1F534}", isCorrect: false },
    ],
  },
  {
    id: 4,
    room: 0,
    question: "Which shape is a circle?",
    options: [
      { text: "Circle", emoji: "\u{2B55}", isCorrect: true },
      { text: "Square", emoji: "\u{2B1C}", isCorrect: false },
      { text: "Triangle", emoji: "\u{1F537}", isCorrect: false },
    ],
  },
  {
    id: 5,
    room: 0,
    question: "How many legs does a dog have?",
    options: [
      { text: "4", emoji: "\u{1F43E}", isCorrect: true },
      { text: "2", emoji: "\u{1F9B6}", isCorrect: false },
      { text: "6", emoji: "\u{1F41B}", isCorrect: false },
    ],
  },
  {
    id: 6,
    room: 0,
    question: "Which one can fly?",
    options: [
      { text: "Bird", emoji: "\u{1F426}", isCorrect: true },
      { text: "Fish", emoji: "\u{1F41F}", isCorrect: false },
      { text: "Dog", emoji: "\u{1F415}", isCorrect: false },
    ],
  },
  {
    id: 7,
    room: 0,
    question: "Which one is a vegetable?",
    options: [
      { text: "Carrot", emoji: "\u{1F955}", isCorrect: true },
      { text: "Banana", emoji: "\u{1F34C}", isCorrect: false },
      { text: "Cake", emoji: "\u{1F370}", isCorrect: false },
    ],
  },

  // ===== ROOM 1 - DARK CORRIDOR (Class 1-2) =====
  {
    id: 8,
    room: 1,
    question: "What is 2 + 3?",
    options: [
      { text: "5", emoji: "\u{1F31F}", isCorrect: true },
      { text: "4", emoji: "\u{1F31E}", isCorrect: false },
      { text: "6", emoji: "\u{1F31D}", isCorrect: false },
    ],
  },
  {
    id: 9,
    room: 1,
    question: "Which planet do we live on?",
    options: [
      { text: "Earth", emoji: "\u{1F30D}", isCorrect: true },
      { text: "Mars", emoji: "\u{1F534}", isCorrect: false },
      { text: "Moon", emoji: "\u{1F319}", isCorrect: false },
    ],
  },
  {
    id: 10,
    room: 1,
    question: "What is 7 - 4?",
    options: [
      { text: "3", emoji: "\u{1F331}", isCorrect: true },
      { text: "2", emoji: "\u{1F330}", isCorrect: false },
      { text: "5", emoji: "\u{1F332}", isCorrect: false },
    ],
  },
  {
    id: 11,
    room: 1,
    question: "Which animal gives us milk?",
    options: [
      { text: "Cow", emoji: "\u{1F404}", isCorrect: true },
      { text: "Lion", emoji: "\u{1F981}", isCorrect: false },
      { text: "Tiger", emoji: "\u{1F405}", isCorrect: false },
    ],
  },
  {
    id: 12,
    room: 1,
    question: "How many days are in a week?",
    options: [
      { text: "7", emoji: "\u{1F4C5}", isCorrect: true },
      { text: "5", emoji: "\u{1F4C6}", isCorrect: false },
      { text: "10", emoji: "\u{1F4C7}", isCorrect: false },
    ],
  },
  {
    id: 13,
    room: 1,
    question: "Which one is a bird?",
    options: [
      { text: "Parrot", emoji: "\u{1F99C}", isCorrect: true },
      { text: "Frog", emoji: "\u{1F438}", isCorrect: false },
      { text: "Rabbit", emoji: "\u{1F407}", isCorrect: false },
    ],
  },
  {
    id: 14,
    room: 1,
    question: "What is 3 + 4?",
    options: [
      { text: "7", emoji: "\u{1F31F}", isCorrect: true },
      { text: "6", emoji: "\u{1F31E}", isCorrect: false },
      { text: "8", emoji: "\u{1F31D}", isCorrect: false },
    ],
  },

  // ===== ROOM 2 - FORGOTTEN CHAMBER (Class 3-5) =====
  {
    id: 15,
    room: 2,
    question: "What is 6 \u00D7 7?",
    options: [
      { text: "42", emoji: "\u{1F31F}", isCorrect: true },
      { text: "36", emoji: "\u{1F31E}", isCorrect: false },
      { text: "48", emoji: "\u{1F31D}", isCorrect: false },
    ],
  },
  {
    id: 16,
    room: 2,
    question: "Which organ pumps blood in our body?",
    options: [
      { text: "Heart", emoji: "\u{2764}\u{FE0F}", isCorrect: true },
      { text: "Brain", emoji: "\u{1F9E0}", isCorrect: false },
      { text: "Lungs", emoji: "\u{1FAC1}", isCorrect: false },
    ],
  },
  {
    id: 17,
    room: 2,
    question: "What is half of 10?",
    options: [
      { text: "5", emoji: "\u{1F31F}", isCorrect: true },
      { text: "4", emoji: "\u{1F31E}", isCorrect: false },
      { text: "6", emoji: "\u{1F31D}", isCorrect: false },
    ],
  },
  {
    id: 18,
    room: 2,
    question: "Which is the largest ocean on Earth?",
    options: [
      { text: "Pacific", emoji: "\u{1F30A}", isCorrect: true },
      { text: "Atlantic", emoji: "\u{1F30B}", isCorrect: false },
      { text: "Indian", emoji: "\u{1F30C}", isCorrect: false },
    ],
  },
  {
    id: 19,
    room: 2,
    question: "What gas do plants absorb from the air?",
    options: [
      { text: "Carbon Dioxide", emoji: "\u{1F33F}", isCorrect: true },
      { text: "Oxygen", emoji: "\u{2728}", isCorrect: false },
      { text: "Nitrogen", emoji: "\u{1F4A8}", isCorrect: false },
    ],
  },
  {
    id: 20,
    room: 2,
    question: "What is 144 \u00F7 12?",
    options: [
      { text: "12", emoji: "\u{1F31F}", isCorrect: true },
      { text: "11", emoji: "\u{1F31E}", isCorrect: false },
      { text: "14", emoji: "\u{1F31D}", isCorrect: false },
    ],
  },
  {
    id: 21,
    room: 2,
    question: "Which gas do we breathe in to live?",
    options: [
      { text: "Oxygen", emoji: "\u{2728}", isCorrect: true },
      { text: "Carbon Dioxide", emoji: "\u{1F4A8}", isCorrect: false },
      { text: "Hydrogen", emoji: "\u{1F4A7}", isCorrect: false },
    ],
  },
];

export default questions;
