import { useEffect, useState } from "react";
import { SUITS, VALUES } from "./assets/card-data";

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }
  static random() {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = VALUES[Math.floor(Math.random() * VALUES.length)];
    return new Card(suit, value);
  }
}

function App() {
  let [cards, setCards] = useState([]);

  function buildDeck() {
    let deck = [];
    for (let suit of SUITS) {
      for (let value of VALUES) {
        deck.push(new Card(suit, value));
      }
    }
    setCards(deck);
  }

  useEffect(() => {
    buildDeck();
  }, []);

  return (
    <div>
      <h1>Hello World!</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {cards.map((card) => (
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
            }}
          >
            <div>{card.suit}</div>
            <div>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
