import { useState, useEffect, useRef } from "react";
import "./App.css";
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
  //let [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  let [war, setWar] = useState(WAR_STATES.NONE);
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
  let [playerOneVictories, setPlayerOneVictories] = useState(0);
  let [playerTwoVictories, setPlayerTwoVictories] = useState(0);
  let [message, setMessage] = useState("...waiting for card draw");
  let [log, setLog] = useState([]);
  let [logOpen, setLogOpen] = useState(true)

  const logEndRef = useRef(null);

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

  function needsRefresh(player) {
    return player.deck.length === 0 && player.reserve.length > 0;
  }

  const canDraw =
    war !== WAR_STATES.END &&
    !needsRefresh(playerOne) &&
    !needsRefresh(playerTwo);

  const canRefillWarPile =
    war !== WAR_STATES.END &&
    playerOne.deck.length + playerOne.reserve.length >= 3 &&
    playerTwo.deck.length + playerTwo.reserve.length >= 3 &&
    (playerOne.deck.length >= 3 || canRefreshDeck(playerOne)) &&
    (playerTwo.deck.length >= 3 || canRefreshDeck(playerTwo));

  function logEvent(entry) {
    const timeStamp = new Date().toLocaleTimeString();
    setLog((prev) => {
      const newLog = [...prev, `[${timeStamp}] ${entry}`];
      return newLog.slice(-10);
    });
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

  const gameOverHandled = useRef(false);

  function checkGameOver() {
    if (!start) return;

    const cardsPlayed =
      52 -
      (playerOne.deck.length +
        playerOne.reserve.length +
        playerTwo.deck.length +
        playerTwo.reserve.length);
    if (cardsPlayed === 0) return;
    if (gameOverHandled.current) return;

    const p1Total =
      playerOne.deck.length +
      playerOne.reserve.length +
      playerOne.warPile.length;
    const p2Total =
      playerTwo.deck.length +
      playerTwo.reserve.length +
      playerTwo.warPile.length;

    const noCardsHaveBeenPlayed = p1Total + p2Total === 52;
    if (noCardsHaveBeenPlayed) return;

    const bothOut = p1Total === 0 && p2Total === 0;
    const p1Out = p1Total === 0 && p2Total > 0;
    const p2Out = p2Total === 0 && p1Total > 0;

    if (bothOut || p1Out || p2Out) {
      if (gameOverHandled.current) return;
      gameOverHandled.current = true;

      setWar(WAR_STATES.END);

      if (bothOut) {
        setMessage(`Tie! Final Score: ${playerOneScore} to ${playerTwoScore}`);
      } else if (p1Out) {
        setMessage(
          `Player Two Wins! Final Score: ${playerTwoScore} to ${playerOneScore}`
        );
        setPlayerTwoVictories((prev) => prev + 1);
      } else {
        setMessage(
          `Player One Wins! Final Score: ${playerOneScore} to ${playerTwoScore}`
        );
        setPlayerOneVictories((prev) => prev + 1);
      }
    }
  }

  function resetGameState() {
    let deck = buildDeck();
    deck = shuffleDeck(deck);
    const { p1, p2 } = splitDeck(deck);
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
    setLog([]);
    //setHasStartedPlaying(false);
    gameOverHandled.current = false;
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

      //setHasStartedPlaying(true);

      handleCardComparison(drawnCard1, drawnCard2);
    } else {
      setMessage("One player out of cards. Checking for winner . . .");
      setWar(WAR_STATES.END);
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
    if (war === WAR_STATES.END) return;

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
  }

  function awardToPlayerTwo(card1, card2) {
    if (war === WAR_STATES.END) return;

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
    const p1Total = playerOne.deck.length + playerOne.reserve.length;
    const p2Total = playerTwo.deck.length + playerTwo.reserve.length;

    // If BOTH players can't fill war piles
    if (p1Total < 3 && p2Total < 3) {
      setMessage("Not enough cards to fill war piles - game over!");
      setWar(WAR_STATES.END);
      return;
    }

    // If ONLY player one can't continue
    if (p1Total < 3) {
      setMessage("Player One can't continue. Player Two wins!");
      setWar(WAR_STATES.END);
      return;
    }

    // If ONLY player two can't continue
    if (p2Total < 3) {
      setMessage("Player Two can't continue. Player One wins!");
      setWar(WAR_STATES.END);
      return;
    }

    // Otherwise, check if either needs to refresh deck
    const p1CanRefresh = canRefreshDeck(playerOne);
    const p2CanRefresh = canRefreshDeck(playerTwo);

    if (
      (playerOne.deck.length < 3 && p1CanRefresh) ||
      (playerTwo.deck.length < 3 && p2CanRefresh)
    ) {
      setMessage("Need to refresh deck before filling war piles!!!");
      return;
    }
    //keep this as is

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
    if (war === WAR_STATES.END) return;

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
  }

  function handleCardComparison(card1, card2) {
    if (war === WAR_STATES.END) return;

    if (!card1 || !card2) {
      return;
    }
    let result = getWinner(card1, card2);

    const playSummary = `P1: ${card1.rank}${card1.suit} vs. P2: ${card2.rank}${card2.suit}`;

    if (result === "playerOne") {
      logEvent(`${playSummary} -> Player One Wins!`);
      awardToPlayerOne(card1, card2);
    } else if (result === "playerTwo") {
      logEvent(`${playSummary} -> Player Two Wins!`);
      awardToPlayerTwo(card1, card2);
    } else {
      logEvent(`${playSummary} -> WAR!`);
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

    const p1Empty = hasNoCards(playerOne);
    const p2Empty = hasNoCards(playerTwo);

    if (p1Empty || p2Empty) {
      checkGameOver();
      return;
    }

    setWar(WAR_STATES.NONE);
    setMessage("...waiting for card draw");
  }

  function hasNoCards(player) {
    return (
      player.deck.length === 0 &&
      player.reserve.length === 0 &&
      player.warPile.length === 0
    );
  }

  function logButtonHandler () {
    setLogOpen((prev) => !prev)
  }

  const warStateMap = {
    [WAR_STATES.NONE]: {
      handler: drawCard,
      label:
        canRefreshDeck(playerOne) || canRefreshDeck(playerTwo)
          ? "Refresh Deck(s) First"
          : "Draw",
      disabled:
        !canDraw || canRefreshDeck(playerOne) || canRefreshDeck(playerTwo),
    },
    [WAR_STATES.PENDING]: {
      handler: fillWarPiles,
      label: !canRefillWarPile
        ? "Can't Fill War Piles (Click to End)"
        : "Fill War Piles",
      disabled: false,
    },
    [WAR_STATES.FILLED]: {
      handler: drawCard,
      label: "Resolve War",
      disabled: !canDraw,
    },
    [WAR_STATES.RESOLVED]: {
      handler: () => {
        if (hasNoCards(playerOne) || hasNoCards(playerTwo)) {
          return;
        } else {
          handleContinue();
          return;
        }
      },
      label: "Continue",
      disabled: false,
    },
    [WAR_STATES.END]: {
      handler: startGame,
      label: "New Game",
      disabled: false,
    },
  };

  useEffect(() => {
    checkGameOver();
  }, [
    playerOne.deck,
    playerOne.reserve,
    playerOne.warPile,
    playerTwo.deck,
    playerTwo.reserve,
    playerTwo.warPile,
    war,
  ]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [log]);

  return (
    <div className="app-container">
      <h1 className="title">Attrition: The Super War Card Game!</h1>
      <h2 className="message">{message}</h2>

      <div className="scoreboard">
        <div>Player One Victories: {playerOneVictories}</div>
        <div>Player Two Victories: {playerTwoVictories}</div>
      </div>

      <div className="players-info">
        {/* Player one info */}
        <div className="player-info">
          <h3>Player One</h3>
          <div className="card">
            {selected1.rank} {selected1.suit}
          </div>
          {start && war !== WAR_STATES.END && canRefreshDeck(playerOne) && (
            <button onClick={() => refreshDeck("playerOne")}>Fresh Deck</button>
          )}
          <div className="stats">
            <p>Score: {playerOneScore}</p>
            <p>Deck: {playerOne.deck.length}</p>
            <p>Reserve: {playerOne.reserve.length}</p>
            <p>War Pile: {playerOne.warPile.length}</p>
          </div>
        </div>

        {/* Player two info */}
        <div className="player-info">
          <h3>Player Two</h3>
          <div className="card">
            {selected2.rank} {selected2.suit}
          </div>
          {start && war !== WAR_STATES.END && canRefreshDeck(playerTwo) && (
            <button onClick={() => refreshDeck("playerTwo")}>Fresh Deck</button>
          )}
          <div className="stats">
            <p>Score: {playerTwoScore}</p>
            <p>Deck: {playerTwo.deck.length}</p>
            <p>Reserve: {playerTwo.reserve.length}</p>
            <p>War Pile: {playerTwo.warPile.length}</p>
          </div>
        </div>
      </div>

      <div className="game-controls">
        {/* Main Action Button (draw, fill war pile, resolve, continue, etc) */}
        {!start || war === WAR_STATES.END ? (
          <button onClick={startGame}>
            {war === WAR_STATES.END ? "Start New Game" : "Start Game"}
          </button>
        ) : (
          warStateMap[war] && (
            <button
              onClick={warStateMap[war].handler}
              disabled={warStateMap[war].disabled}
            >
              {warStateMap[war].label}
            </button>
          )
        )}
      </div>

      <div className="log-section">
        <h3>Event Log</h3>
        <div className={`log-button ${logOpen ? "open" : ""}`} onClick = {logButtonHandler}>
          <div className="log-button-line left"></div>
          <div className="log-button-line right"></div>
        </div>
        {logOpen && (<div className="log-box">
          <ul>
            {log.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
            <div ref={logEndRef} />
          </ul>
        </div>)}
      </div>
    </div>
  );
}

export default App;
