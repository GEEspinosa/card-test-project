import { useState } from "react";
import { SUITS, RANKS, RANK_VALUES } from "./assets/card-data";

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }
}

const WAR_STATES = {
  NONE: "none",
  PENDING: "pending",
  FILLED: "filled",
  RESOLVED: "resolved",
  END: "end",
};

function App() {
  let [start, setStart] = useState(false);
  let [war, setWar] = useState(WAR_STATES.NONE);
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

  function canRefreshDeck(player) {
    const hasReserve = player.reserve.length > 0;
    const isInWar = war === WAR_STATES.PENDING;

    if (!start) {
      return false;
    }

    if (!isInWar) {
      return player.deck.length === 0 && hasReserve;
    }

    const totalCards = player.deck.length + player.reserve.length;
    return (
      player.deck.length < 3 &&
      totalCards >= 3 &&
      player.deck.length < totalCards &&
      war === WAR_STATES.PENDING
    );
  }

  const canDraw =
    playerOne.deck.length > 0 &&
    playerTwo.deck.length > 0 &&
    war !== WAR_STATES.PENDING;

  const canRefillWarPile =
    playerOne.deck.length >= 3 &&
    playerTwo.deck.length >= 3 &&
    !canRefreshDeck(playerOne) &&
    !canRefreshDeck(playerTwo);

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

  // function checkGameOver() {
  //   const p1Lost = playerOne.deck.length <= 0 && playerOne.reserve.length <= 0;
  //   const p2Lost = playerTwo.deck.length <= 0 && playerTwo.reserve.length <= 0;

  //   if (p1Lost || p2Lost) {
  //     setWar(WAR_STATES.END);
  //   }
  //   if (p1Lost) setMessage("player Two Wins the Game!");
  //   else if (p2Lost) setMessage("Player One Wins the Game!");
  // }

  function checkGameOver() {
    const p1Total =
      playerOne.deck.length +
      playerOne.reserve.length +
      playerOne.warPile.length;
    const p2Total =
      playerTwo.deck.length +
      playerTwo.reserve.length +
      playerTwo.warPile.length;

    const bothOut = p1Total === 0 && p2Total === 0;
    const p1Out = p1Total === 0 && p2Total > 0;
    const p2Out = p2Total === 0 && p1Total > 0;

    if (bothOut || p1Out || p2Out) {
      setWar(WAR_STATES.END);

      if (bothOut) {
        setMessage(`Tie! Final Score: ${playerOneScore} to ${playerTwoScore}`);
      } else if (p1Out) {
        setMessage(
          `Player Two Wins! Final Score: ${playerTwoScore} to ${playerOneScore}`
        );
      } else {
        setMessage(
          `Player One Wins! Final Score: ${playerOneScore} to ${playerTwoScore}`
        );
      }
    }
  }

  function resetGameState() {
    let deck = buildDeck();
    deck = shuffleDeck(deck);
    const { p1, p2 } = splitDeck(deck);

    setCards(deck);
    setPlayerOne({
      deck: p1,
      reserve: [],
      warPile: [],
    });
    setPlayerTwo({
      deck: p2,
      reserve: [],
      warPile: [],
    });

    setSelected1({ suit: "draw", rank: "card" });
    setSelected2({ suit: "draw", rank: "card" });
    setPlayerOneScore(0);
    setPlayerTwoScore(0);
    setMessage("...waiting for card draw");
    setWar(WAR_STATES.NONE);
  }

  function startGame() {
    resetGameState();
    setStart(true);
  }

  function drawCard() {
    if (war === WAR_STATES.END) {
      return;
    }
    if (war === WAR_STATES.PENDING) {
      return;
    }
    checkGameOver();
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

      handleCardComparison(drawnCard1, drawnCard2);
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

    const warPile1 = playerOne.warPile;
    const warPile2 = playerTwo.warPile;

    setPlayerOne((prev) => ({
      ...prev,
      reserve: [...prev.reserve, card1, card2, ...warPile1, ...warPile2],
      warPile: [],
    }));
    setPlayerTwo((prev) => ({
      ...prev,
      warPile: [],
    }));

    if (war === WAR_STATES.PENDING) {
      setSelected1({ suit: "draw", rank: "card" });
      setSelected2({ suit: "draw", rank: "card" });
    }
    if (war === WAR_STATES.FILLED) {
      setWar(WAR_STATES.RESOLVED);
    }
    setMessage("Player 1 Wins");
    checkGameOver();
  }

  function awardToPlayerTwo(card1, card2) {
    setPlayerTwoScore((prev) => prev + 1);

    const warPile1 = playerOne.warPile;
    const warPile2 = playerTwo.warPile;

    setPlayerTwo((prev) => ({
      ...prev,
      reserve: [...prev.reserve, card1, card2, ...warPile1, ...warPile2],
      warPile: [],
    }));
    setPlayerOne((prev) => ({
      ...prev,
      warPile: [],
    }));

    if (war === WAR_STATES.PENDING) {
      setSelected1({ suit: "draw", rank: "card" });
      setSelected2({ suit: "draw", rank: "card" });
    }
    if (war === WAR_STATES.FILLED) {
      setWar(WAR_STATES.RESOLVED);
    }
    setMessage("Player 2 Wins");
    checkGameOver();
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

  function fillWarPiles() {
    let p1Total = playerOne.deck.length + playerOne.reserve.length;
    let p2Total = playerTwo.deck.length + playerTwo.reserve.length;

    if (p1Total < 3 || p2Total < 3) {
      setMessage("War Piles Can't Be Filled! Game Over");
      setWar(WAR_STATES.END);
      return;
    }

    if (playerOne.deck.length < 3 || playerTwo.deck.length < 3) {
      setMessage("Need to refresh deck before filling war piles!!!");
      return;
    }

    const { deck: p1Deck, reserve: p1Reserve } = prepareDeckForWar(
      playerOne.deck,
      playerOne.reserve
    );
    const { deck: p2Deck, reserve: p2Reserve } = prepareDeckForWar(
      playerTwo.deck,
      playerTwo.reserve
    );

    let warPile1 = p1Deck.splice(-3);
    let warPile2 = p2Deck.splice(-3);

    setPlayerOne((prev) => ({
      ...prev,
      deck: p1Deck,
      reserve: p1Reserve,
      warPile: [...prev.warPile, ...warPile1],
    }));

    setPlayerTwo((prev) => ({
      ...prev,
      deck: p2Deck,
      reserve: p2Reserve,
      warPile: [...prev.warPile, ...warPile2],
    }));

    setWar(WAR_STATES.FILLED);
    setMessage("War piles filled! Draw Again to resolve war.");
  }

  function refreshDeck(playerKey) {
    const currentPlayer = playerKey === "playerOne" ? playerOne : playerTwo;
    let { deck, reserve } = currentPlayer;
    const shuffled = shuffleDeck(reserve);
    const newDeck = [...shuffled, ...deck];

    let setter = playerKey === "playerOne" ? setPlayerOne : setPlayerTwo;

    setter((prev) => ({
      ...prev,
      deck: newDeck,
      reserve: [],
    }));
    checkGameOver();
  }

  function handleCardComparison(card1, card2) {
    if (!card1 || !card2) {
      return;
    }
    let result = getWinner(card1, card2);

    if (result === "playerOne") {
      awardToPlayerOne(card1, card2);
    } else if (result === "playerTwo") {
      awardToPlayerTwo(card1, card2);
    } else {
      setPlayerOne((prev) => ({
        ...prev,
        warPile: [...prev.warPile, card1],
      }));
      setPlayerTwo((prev) => ({
        ...prev,
        warPile: [...prev.warPile, card2],
      }));

      if (war === WAR_STATES.FILLED) {
        setMessage("Another War!!! Fill more piles");
      } else {
        setMessage("War!!! Fill war piles");
      }

      setWar(WAR_STATES.PENDING);
    }
  }

  function handleContinue() {
    setWar(WAR_STATES.NONE);
    setSelected1({ suit: "draw", rank: "card" });
    setSelected2({ suit: "draw", rank: "card" });
    setMessage("...waiting for card draw");
  }

  const warStateMap = {
    [WAR_STATES.NONE]: { handler: drawCard, label: "Draw", disabled: !canDraw },
    [WAR_STATES.PENDING]: {
      handler: fillWarPiles,
      label: "Fill War Piles",
      disabled: !canRefillWarPile,
    },
    [WAR_STATES.FILLED]: {
      handler: drawCard,
      label: "Resolve War",
      disabled: !canDraw,
    },
    [WAR_STATES.RESOLVED]: {
      handler: handleContinue,
      label: "Continue",
      disabled: false,
    },
    [WAR_STATES.END]: {
      handler: startGame,
      label: "New Game",
      disabled: false,
    },
  };

  return (
    <div>
      <h1 style={{ display: "flex", justifyContent: "center" }}>
        Attrition: The Super War Card Game!
      </h1>
      <h2 style={{ display: "flex", justifyContent: "center" }}>{message}</h2>
      <div>
        <h3 style={{ margin: "10px" }}>
          Total Cards in Game:{" "}
          {playerOne.deck.length +
            playerOne.reserve.length +
            playerOne.warPile.length +
            playerTwo.deck.length +
            playerTwo.reserve.length +
            playerTwo.warPile.length}
        </h3>
      </div>
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
            border: "solid black",
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
          {start && war !== WAR_STATES.END && canRefreshDeck(playerOne) && (
            <button
              onClick={() => refreshDeck("playerOne")}
              style={{ margin: "10px" }}
            >
              Fresh Deck
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            border: "solid black",
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
            <h3>Player 2</h3>
            <div>{selected2.suit}</div>
            <div>{selected2.rank}</div>
          </div>
          {start && war !== WAR_STATES.END && canRefreshDeck(playerTwo) && (
            <button
              onClick={() => refreshDeck("playerTwo")}
              style={{ margin: "10px" }}
            >
              Fresh Deck
            </button>
          )}
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
        {start && war !== WAR_STATES.END && (
          <button
            onClick={warStateMap[war].handler}
            disabled={warStateMap[war].disabled}
          >
            {warStateMap[war].label}
          </button>
        )}

        {war === WAR_STATES.END && (
          <button onClick={startGame}>New Game</button>
        )}
      </div>
    </div>
  );
}

export default App;
