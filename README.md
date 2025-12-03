# Attrition: The Super War Card Game!

Welcome to **Attrition**, a React-based implementation of a classic war-style card game with added mechanics for war resolution, scoring, and strategic deck management. This game challenges two players to outwit each other by drawing cards, filling war piles, and managing reserves — all wrapped in a slick UI with theme and mode toggles. 

**This is a work in progress**

---

## Table of Contents

- [About](#about)  
- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Getting Started](#getting-started)  
- [How to Play](#how-to-play)  
- [Deployment](#deployment)  
- [Project Structure](#project-structure)  
- [Contributing](#contributing)  

---

## About

Attrition is a turn-based two-player card game inspired by the classic "War" card game. Players draw cards from their decks and compete by rank, initiating "wars" when ties occur. The app tracks scores, deck states, war phases, and provides visual feedback with modals and logs.

Designed as a React single-page application, it demonstrates complex state management, custom hooks, keyboard controls, and modal interactions — all while maintaining a clean and responsive UI.

---

## Features

- Classic "War" gameplay enhanced with multi-phase war resolution states
- Deck shuffling, splitting, and automatic reserve management
- Visual card display with ranks and suits
- War pile management with interactive modals showing war outcomes
- Scoring system with persistent victory tracking per player
- Keyboard controls:  
  - Space: Draw/continue  
  - 1: Refresh Player One's deck  
  - 2: Refresh Player Two's deck  
- Theme selector and light/dark mode toggle
- Event log displaying last 10 game actions
- Instructional modal for quick reference to controls
- Responsive design suitable for desktop and mobile

---

## Technologies Used

- React (Functional Components, Hooks)  
- JavaScript (ES6+)  
- CSS Modules / Custom CSS  
- Heroicons & React Icons  
- Utility functions for deck and game logic  

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)  
- npm or yarn package manager  

### Installation

1. Clone the repo  
```bash
git clone https://github.com/your-username/attrition-war-card-game.git
   cd attrition-war-card-game
```
2. Install dependencies
```bash
npm install
# or
yarn install
```
3. Run the app locally
```bash
npm start
# or
yarn start
```
4. Open http://localhost:3000 to play the game.

## How to Play
- Click Start Game or press the Spacebar to begin.
- Players take turns drawing cards simultaneously.
- If cards tie, a "war" is triggered requiring players to fill war piles before resolving.
- Use keys 1 or 2 to refresh Player One or Player Two’s decks when empty reserves exist.
- The main action button changes based on game state (Draw, Fill War Piles, Resolve War, Continue, New Game).
- Monitor your score and victories on the scoreboard.
- Click the question mark icon or press the help button for instructions.

## Deployment
To build the app for production:
```bash
npm run build
# or
yarn build
```
This will create an optimized build in the build folder, ready for deployment on platforms like Netlify, Vercel, or GitHub Pages.

## Project Structure
```bash
src/
├── components/
│   ├── CardDisplay.js
│   ├── WarModal.js
│   ├── WarPileDisplay.js
│   └── InstructionsModal.js
├── constants/
│   ├── cardData.js
│   ├── warStates.js
│   └── themes.js
├── utils/
│   ├── Card.js
│   ├── deckUtils.js
│   └── gameUtils.js
├── App.js
├── App.css
└── index.js
```

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to:
- Fork the repo
- Create a new branch (git checkout -b feature-name)
- Commit your changes (git commit -m 'Add some feature')
- Push to the branch (git push origin feature-name)
- Open a Pull Request
Please ensure code quality and consistency with existing style.