import { RANK_VALUES } from "../constants/cardData";
import { shuffleDeck } from "./deckUtils";

function findScoreSum(card1, card2, warPile1, warPile2) {
  let playedCards = RANK_VALUES[card1.rank] + RANK_VALUES[card2.rank];
  let warPileOneSum = 0;
  let warPileTwoSum = 0;
  for (let i = 0; i < warPile1.length; i++) {
    warPileOneSum += RANK_VALUES[warPile1[i].rank];
  }

  for (let i = 0; i < warPile2.length; i++) {
    warPileTwoSum += RANK_VALUES[warPile2[i].rank];
  }
  return playedCards + warPileOneSum + warPileTwoSum;
}

function prepareDeckForWar(deck, reserve) {
  if (deck.length >= 3) {
    return { deck: [...deck], reserve: [...reserve] };
  }

  return {
    deck: [...shuffleDeck(reserve), ...deck],
    reserve: [],
  };
}

export { findScoreSum, prepareDeckForWar };
