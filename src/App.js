import { useEffect, useState } from "react";
import { SUITS, RANKS } from "./assets/card-data";

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  //dev note: not sure I need this given the shuffleDeck() function
  // static random() {
  //   const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  //   const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  //   return new Card(suit, rank);
  // }
}

function App() {
  let [cards, setCards] = useState([]);
  let [selected, setSelected] = useState({suit: null, rank: null})

  function buildDeck() {
    let deck = [];
    for (let suit of SUITS) {
      for (let rank of RANKS) {
        deck.push(new Card(suit, rank));
      }
    }
    setCards(deck);
    setSelected(deck[0])
  }

  function shuffleDeck() {
    let deck = [...cards]
    
    for (let i = cards.length - 1 ; i > 0 ; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    setCards(deck)
  }

  function drawCard() {
    let deck = cards;
    console.log(deck)
    if (deck.length){
      setSelected(deck.pop())
    } else {
      setSelected({suit: 'shuffle', rank: 'again'})
    }
    
  }

  useEffect(() => {
    buildDeck();
  }, []);

  return (
    <div>
      <h1 style={{display: "flex", justifyContent: "center"}}>Hello World!</h1>
      
      
      
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >

        {/* dev note: this displays entire card deck */}
{/*         
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
              width: "80px",
              height: "120px",
              borderRadius: "8px",
            }}
          >
            <div>{selected.suit}</div>
            <div>{selected.rank}</div>
        </div>
       
      </div>
      <button onClick = {shuffleDeck}>
        Shuffle
      </button>
      <button onClick = {drawCard}>
        Draw
      </button>
    </div>
  );
}

export default App;
