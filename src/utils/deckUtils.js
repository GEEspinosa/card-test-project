import Card from "./Card";
import { SUITS, RANKS } from "../constants/cardData";

function buildDeck() {
  let deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push(new Card(suit, rank));
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  let newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

function splitDeck(deckToSplit) {
  const deckCopy = [...deckToSplit];
  const p1 = [];
  const p2 = [];

  while (deckCopy.length) {
    const card1 = deckCopy.pop();
    const card2 = deckCopy.pop();
    if (card1) {
      p1.push(card1);
    }
    if (card2) {
      p2.push(card2);
    }
  }
  return { p1, p2 };
}

function hasNoCards(player) {
  return [player.deck, player.reserve, player.warPile].every(
    (arr) => arr.length === 0
  );
}

export { buildDeck, shuffleDeck, splitDeck, hasNoCards };
