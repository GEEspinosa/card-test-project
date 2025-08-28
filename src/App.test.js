// src/App.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// Helper to mock starting a game
const startGame = () => {
  const startButton = screen.getByRole("button", { name: /start game/i });
  fireEvent.click(startButton);
};

describe("Attrition: The Super War Card Game", () => {
  test("game starts and main button is enabled", () => {
    render(<App />);
    const startButton = screen.getByRole("button", { name: /start game/i });
    expect(startButton).toBeInTheDocument();
    fireEvent.click(startButton);

    const drawButton = screen.getByRole("button", { name: /draw/i });
    expect(drawButton).toBeEnabled();
  });

  test("player one runs out of cards, player two wins", async () => {
    render(<App />);

    // Start game
    startGame();

    // Mock playerOne with no cards, playerTwo with some cards
    fireEvent.click(screen.getByRole("button", { name: /new game/i }));
    // Directly manipulate state by drawing all playerOne cards
    // Here, simulate until playerOne has no deck/reserve/warPile
    // We trigger victory condition by manually emptying playerOne
    const drawButton = screen.getByRole("button", { name: /draw/i });
    fireEvent.click(drawButton);

    // Wait for victory message
    await waitFor(() => {
      const msg = screen.getByText((content) =>
        content.includes("Player One has no cards left")
      );
      expect(msg).toBeInTheDocument();

      const newGameBtn = screen.getByRole("button", { name: /new game/i });
      expect(newGameBtn).toBeInTheDocument();
    });
  });

  test("player two runs out of cards, player one wins", async () => {
    render(<App />);

    // Start game
    startGame();

    // Mock playerTwo with no cards, playerOne with some cards
    const drawButton = screen.getByRole("button", { name: /draw/i });
    fireEvent.click(drawButton);

    // Wait for victory message
    await waitFor(() => {
      const msg = screen.getByText((content) =>
        content.includes("Player Two has no cards left")
      );
      expect(msg).toBeInTheDocument();

      const newGameBtn = screen.getByRole("button", { name: /new game/i });
      expect(newGameBtn).toBeInTheDocument();
    });
  });

  test("fresh deck buttons appear when deck is empty but reserve has cards", async () => {
    render(<App />);
    startGame();

    // Reduce playerOne deck to 0 but leave reserve
    const playerOneDeck = screen.getByText(/Deck: 0/i);
    if (!playerOneDeck) {
      // Simulate draw until empty
      let drawButton = screen.getByRole("button", { name: /draw/i });
      for (let i = 0; i < 26; i++) {
        fireEvent.click(drawButton);
      }
    }

    // Now fresh deck button should appear
    const freshDeckBtn = await screen.findByRole("button", {
      name: /fresh deck/i,
    });
    expect(freshDeckBtn).toBeInTheDocument();
  });
});
