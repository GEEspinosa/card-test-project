import { useEffect, useState } from "react";
import { SUITS, RANKS, RANK_VALUES } from "./assets/card-data";

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }
}

function App() {
  let [cards, setCards] = useState([]);
  let [playerOneDeck, setPlayerOneDeck] = useState([]);
  let [playerTwoDeck, setPlayerTwoDeck] = useState([]);
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
    setCards(deck);
  }

  function shuffleDeck() {
    if (!cards.length) {
      buildDeck();
    } else {
      let deck = [...cards];
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      setCards(deck);
    }
  }

  function splitDeck() {
    const deckCopy = [...cards];
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
    setPlayerOneDeck(p1);
    setPlayerTwoDeck(p2);
    console.log(playerOneDeck, playerTwoDeck);
  }

  function drawCard() {
    if (playerOneDeck.length && playerTwoDeck.length) {
      const deckCopy1 = [...playerOneDeck];
      const deckCopy2 = [...playerTwoDeck];

      const drawnCard1 = deckCopy1.pop();
      const drawnCard2 = deckCopy2.pop();

      setPlayerOneDeck(deckCopy1);
      setPlayerTwoDeck(deckCopy2);

      setSelected1(drawnCard1);
      setSelected2(drawnCard2);
    } else {
      setSelected1({ suit: "shuffle", rank: "again" });
      setSelected2({ suit: "shuffle", rank: "again" });
    }
  }

  useEffect(() => {
    buildDeck();
  }, []);

  useEffect(() => {
    const value1 = RANK_VALUES[selected1.rank];
    const value2 = RANK_VALUES[selected2.rank];

    if (value1 > value2) {
      setPlayerOneScore((prev) => prev + 1);
      setMessage("Player 1 Wins");
    } else if (value1 < value2) {
      setPlayerTwoScore((prev) => prev + 1);
      setMessage("Player 2 Wins");
    } else if (selected1.suit === "draw" && selected2.suit === "draw") {
      setMessage("...waiting for card draw");
    } else {
      setMessage("War!!!");
    }
  }, [selected1, selected2]);

  return (
    <div>
      <h1 style={{ display: "flex", justifyContent: "center" }}>
        Hello World!
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
        <h3 style={{ margin: "10px" }}>Player One Score: {playerOneScore}</h3>
        <h3 style={{ margin: "10px" }}>Player Two Score: {playerTwoScore}</h3>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {/* dev note: this displays entire card deck */}

        {/* {cards.map((card) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              backgroundColor: "salmon",
              padding: "15px",
              margin: "10px",
              width: "80px",
              height: "120px",
              borderRadius: "8px",
            }}
          >
            <div>{card.suit}</div>
            <div>{card.rank}</div>
          </div>
        ))} */}

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
        <button onClick={shuffleDeck}>Shuffle</button>
        <button onClick={drawCard}>Draw</button>
        <button onClick={splitDeck}>split deck</button>
      </div>
    </div>
  );
}

export default App;
