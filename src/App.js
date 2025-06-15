import { useEffect, useState } from "react";
import { SUITS, RANKS, RANK_VALUES } from "./assets/card-data";

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }
}

function App() {
  let [start, setStart] = useState(false);
  let [war, setWar] = useState(false);
  let [cards, setCards] = useState([]);
  let [playerOne, setPlayerOne] = useState({
    deck: [],
    reserve: [],
    warPile: [],
  });
  let [playerTwo, setPlayerTwo] = useState({
    deck: [],
    reserve: [],
    warPile: [],
  });
  let [selected1, setSelected1] = useState({ suit: "draw", rank: "card" });
  let [selected2, setSelected2] = useState({ suit: "draw", rank: "card" });
  let [playerOneScore, setPlayerOneScore] = useState(0);
  let [playerTwoScore, setPlayerTwoScore] = useState(0);
  let [message, setMessage] = useState("...waiting for card draw");

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

  function startGame() {
    let deck = buildDeck();
    deck = shuffleDeck(deck);
    setCards(deck);
    const { p1, p2 } = splitDeck(deck);
    setPlayerOne((prev) => ({
      ...prev,
      deck: p1,
    }));
    setPlayerTwo((prev) => ({
      ...prev,
      deck: p2,
    }));
    setStart(true);
  }

  function drawCard() {
    if (playerOne.deck.length && playerTwo.deck.length) {
      const deckCopy1 = [...playerOne.deck];
      const deckCopy2 = [...playerTwo.deck];

      const drawnCard1 = deckCopy1.pop();
      const drawnCard2 = deckCopy2.pop();

      setPlayerOne((prev) => ({
        ...prev,
        deck: deckCopy1,
      }));
      setPlayerTwo((prev) => ({
        ...prev,
        deck: deckCopy2,
      }));

      setSelected1(drawnCard1);
      setSelected2(drawnCard2);
    } else {
      setSelected1({ suit: "shuffle", rank: "again" });
      setSelected2({ suit: "shuffle", rank: "again" });
    }
  }

  function getWinner(card1, card2) {
    const value1 = RANK_VALUES[card1.rank];
    const value2 = RANK_VALUES[card2.rank];
    if (value1 > value2) {
      return "playerOne";
    }
    if (value1 < value2) {
      return "playerTwo";
    }
    return "WAR!";
  }

  function awardToPlayerOne(card1, card2) {
    setPlayerOneScore((prev) => prev + 1);
    setPlayerOne((prev) => ({
      ...prev,
      reserve: [...prev.reserve, card1, card2],
    }));
    setMessage("Player 1 Wins");
  }

  function awardToPlayerTwo(card1, card2) {
    setPlayerTwoScore((prev) => prev + 1);
    setPlayerTwo((prev) => ({
      ...prev,
      reserve: [...prev.reserve, card1, card2],
    }));
    setMessage("Player 2 Wins");
  }

  function fillWarPiles() {
    let deckPlayer1 = [...playerOne.deck];
    let deckPlayer2 = [...playerTwo.deck];
    let warPile1 = deckPlayer1.splice(-3);
    let warPile2 = deckPlayer2.splice(-3);
    setPlayerOne((prev) => ({
      ...prev,
      deck: deckPlayer1,
      warPile: warPile1,
    }));
    setPlayerTwo((prev) => ({
      ...prev,
      deck: deckPlayer2,
      warPile: warPile2,
    }));

    setMessage("War piles filed! Draw Again to resolve war.");
    setWar(false);
  }

  function handleCardComparison() {
    if (
      selected1.rank === "card" &&
      selected1.suit === "draw" &&
      selected2.rank === "card" &&
      selected2.suit === "draw"
    ) {
      return;
    }

    if (!selected1 || !selected2) {
      return;
    }

    let result = getWinner(selected1, selected2);
    if (result === "playerOne") {
      awardToPlayerOne(selected1, selected2);
    } else if (result === "playerTwo") {
      awardToPlayerTwo(selected1, selected2);
    } else {
      setWar(true);
      setMessage("War!!!");
    }
  }

  useEffect(() => {
    handleCardComparison();
  }, [selected1, selected2]);

  return (
    <div>
      <h1 style={{ display: "flex", justifyContent: "center" }}>
        Attrition: The Super War Card Game!
      </h1>
      <h2 style={{ display: "flex", justifyContent: "center" }}>{message}</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
          padding: "10px",
        }}
      >
        <div>
          <h3 style={{ margin: "10px" }}>Player One Score: {playerOneScore}</h3>
          <h3 style={{ margin: "10px" }}>
            Player One Deck Count: {playerOne.deck.length}
          </h3>
          <h3 style={{ margin: "10px" }}>
            Player One Deck Reserve: {playerOne.reserve.length}
          </h3>
          <h3 style={{ margin: "10px" }}>
            Player One Deck War Pile: {playerOne.warPile.length}
          </h3>
        </div>
        <div>
          <h3 style={{ margin: "10px" }}>Player Two Score: {playerTwoScore}</h3>
          <h3 style={{ margin: "10px" }}>
            Player Two Deck Count: {playerTwo.deck.length}
          </h3>
          <h3 style={{ margin: "10px" }}>
            Player Two Deck Reserve: {playerTwo.reserve.length}
          </h3>
          <h3 style={{ margin: "10px" }}>
            Player Two Deck War Pile: {playerTwo.warPile.length}
          </h3>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "salmon",
            padding: "15px",
            margin: "10px",
            width: "100px",
            height: "140px",
            borderRadius: "8px",
          }}
        >
          <h3>Player 1</h3>
          <div>{selected1.suit}</div>
          <div>{selected1.rank}</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "salmon",
            padding: "15px",
            margin: "10px",
            width: "100px",
            height: "140px",
            borderRadius: "8px",
          }}
        >
          <h3>Player 2</h3>
          <div>{selected2.suit}</div>
          <div>{selected2.rank}</div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {!start && <button onClick={startGame}>Start Game</button>}
        {war && <button onClick={fillWarPiles}>Fill War Piles</button>}
        <button onClick={drawCard}>Draw</button>
      </div>
    </div>
  );
}

export default App;
