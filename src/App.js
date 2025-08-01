import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const [start, setStart] = useState(false);
  const [war, setWar] = useState(WAR_STATES.NONE);
  const [playerOne, setPlayerOne] = useState({
    deck: [],
    reserve: [],
    warPile: [],
  });
  const [playerTwo, setPlayerTwo] = useState({
    deck: [],
    reserve: [],
    warPile: [],
  });
  const [selected1, setSelected1] = useState({ suit: "draw", rank: "card" });
  const [selected2, setSelected2] = useState({ suit: "draw", rank: "card" });
  const [playerOneScore, setPlayerOneScore] = useState(0);
  const [playerTwoScore, setPlayerTwoScore] = useState(0);
  const [playerOneVictories, setPlayerOneVictories] = useState(0);
  const [playerTwoVictories, setPlayerTwoVictories] = useState(0);
  const [message, setMessage] = useState("...waiting for card draw");
  const [log, setLog] = useState([]);
  const [logOpen, setLogOpen] = useState(true);

  useEffect(() => {
    console.log("Player One Victories changed:", playerOneVictories);
  }, [playerOneVictories]);

  useEffect(() => {
    console.log("Player Two Victories changed:", playerTwoVictories);
  }, [playerTwoVictories]);

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

  const canRefreshDeck = useCallback(
    (player) => {
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
    },
    [war, start]
  );

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

  const resetGameState = useCallback(() => {
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
  }, []);

  const startGame = useCallback(() => {
    resetGameState();
    setStart(true);
  }, [resetGameState]);

  const awardToPlayerOne = useCallback(
    (card1, card2) => {
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
    },
    [playerOne.warPile, playerTwo.warPile, war]
  );

  const awardToPlayerTwo = useCallback(
    (card1, card2) => {
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
    },
    [playerOne.warPile, playerTwo.warPile, war]
  );

  const handleCardComparison = useCallback(
    (card1, card2) => {
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
    },
    [awardToPlayerOne, awardToPlayerTwo, war]
  );

  function hasNoCards(player) {
    return (
      player.deck.length === 0 &&
      player.reserve.length === 0 &&
      player.warPile.length === 0
    );
  }

  function checkForVictory(p1, p2) {
    const p1Total = p1.deck.length + p1.reserve.length + p1.warPile.length;
    const p2Total = p2.deck.length + p2.reserve.length + p2.warPile.length;

    if (p1Total === 0 && p2Total > 0) {
      setMessage("Player One is out of cards. Player Two wins!");
      setPlayerTwoVictories((prev) => prev + 1);
      setWar(WAR_STATES.END);
      return true; // indicates game ended
    }

    if (p2Total === 0 && p1Total > 0) {
      setMessage("Player Two is out of cards. Player One wins!");
      setPlayerOneVictories((prev) => prev + 1);
      setWar(WAR_STATES.END);
      return true; // indicates game ended
    }

    return false; //game continues
  }

  const drawCard = useCallback(() => {
    if (war === WAR_STATES.END || war === WAR_STATES.PENDING) return;
    if (
      playerOne.deck.length === 0 &&
      playerOne.reserve.length === 0 &&
      playerOne.warPile.length === 0
    ) {
      console.log("Incrementing Player Two Victories from", playerTwoVictories);
      setMessage("Player One out of cards. Player Two wins!");
      setPlayerTwoVictories((prev) => {
        console.log("New Player Two Victories", prev + 1);
        return prev + 1;
      });
      setWar(WAR_STATES.END);
      return;
    }

    if (
      playerTwo.deck.length === 0 &&
      playerTwo.reserve.length === 0 &&
      playerTwo.warPile.length === 0
    ) {
      console.log("Incrementing Player One Victories from", playerOneVictories);
      setMessage("Player Two out of cards. Player One wins!");
      setPlayerOneVictories((prev) => {
        console.log("New Player One Victories", prev + 1);
        return prev + 1;
      });
      setWar(WAR_STATES.END);
      return;
    }

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
  }, [
    handleCardComparison,
    playerOneVictories,
    playerTwoVictories,
    war,
    playerOne.deck,
    playerOne.reserve.length,
    playerOne.warPile.length,
    playerTwo.deck,
    playerTwo.reserve.length,
    playerTwo.warPile.length,
  ]);

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

  const prepareDeckForWar = useCallback((deck, reserve) => {
    if (deck.length >= 3) {
      return { deck: [...deck], reserve: [...reserve] };
    }

    return {
      deck: [...shuffleDeck(reserve), ...deck],
      reserve: [],
    };
  }, []);

  const fillWarPiles = useCallback(() => {
    if (checkForVictory(playerOne, playerTwo)) {
      return; //stop further play if game ended
    }
    const p1Total = playerOne.deck.length + playerOne.reserve.length;
    const p2Total = playerTwo.deck.length + playerTwo.reserve.length;

    // If ONLY player one can't continue
    if (p1Total < 3) {
      setMessage("Player One can't continue. Player Two wins!");
      setPlayerTwoVictories((prev) => prev + 1);
      setWar(WAR_STATES.END);
      return;
    }

    // If ONLY player two can't continue
    if (p2Total < 3) {
      setMessage("Player Two can't continue. Player One wins!");
      setPlayerOneVictories((prev) => prev + 1);
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
  }, [canRefreshDeck, playerOne, playerTwo, prepareDeckForWar]);

  const refreshDeck = useCallback(
    (playerKey) => {
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
    },
    [playerOne, playerTwo, war]
  );

  const handleContinue = useCallback(() => {
    setWar(WAR_STATES.NONE);
    setSelected1({ suit: "draw", rank: "card" });
    setSelected2({ suit: "draw", rank: "card" });

    const p1Empty = hasNoCards(playerOne);
    const p2Empty = hasNoCards(playerTwo);

    if (p1Empty || p2Empty) {
      //checkGameOver();
      setWar(WAR_STATES.END);
      return;
    }

    setWar(WAR_STATES.NONE);
    setMessage("...waiting for card draw");
  }, [playerOne, playerTwo]);

  function logButtonHandler() {
    setLogOpen((prev) => !prev);
  }

  const warStateMap = useMemo(
    () => ({
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
    }),
    [
      canDraw,
      canRefillWarPile,
      canRefreshDeck,
      drawCard,
      fillWarPiles,
      handleContinue,
      playerOne,
      playerTwo,
      startGame,
    ]
  );

  useEffect(() => {
    function handleKeyDown(event) {
      console.log(event.code);

      const hasGameStarted =
        playerOne.deck.length > 0 && playerTwo.deck.length > 0;

      const playerOneNeedsRefill =
        (playerOne.deck.length === 0 && playerOne.reserve.length > 0) ||
        (war === WAR_STATES.PENDING &&
          playerOne.deck.length < 3 &&
          playerOne.reserve.length > 0);

      const playerTwoNeedsRefill =
        (playerTwo.deck.length === 0 && playerTwo.reserve.length > 0) ||
        (war === WAR_STATES.PENDING &&
          playerTwo.deck.length < 3 &&
          playerTwo.reserve.length > 0);

      const anyPlayerNeedsRefill = playerOneNeedsRefill || playerTwoNeedsRefill;

      const currentState = warStateMap[war];

      if (event.code === "Space") {
        event.preventDefault();

        if (!hasGameStarted && !anyPlayerNeedsRefill) {
          startGame(); // your custom function
          return;
        }

        if (!anyPlayerNeedsRefill && currentState && !currentState.disabled) {
          warStateMap[war].handler();
        }
      }
      if (event.code === "Digit1") {
        event.preventDefault();

        if (playerOneNeedsRefill) {
          refreshDeck("playerOne");
        }
      }

      if (event.code === "Digit2") {
        event.preventDefault();

        if (playerTwoNeedsRefill) {
          refreshDeck("playerTwo");
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    warStateMap,
    war,
    refreshDeck,
    playerOne.deck.length,
    playerOne.reserve.length,
    playerTwo.deck.length,
    playerTwo.length,
    playerTwo.reserve.length,
    startGame,
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
        {start && (canRefreshDeck(playerOne) || canRefreshDeck(playerTwo)) ? (
          <button
            onClick={warStateMap[WAR_STATES.NONE].handler}
            disabled={warStateMap[WAR_STATES.NONE].disabled}
          >
            {warStateMap[WAR_STATES.NONE].label}
          </button>
        ) : !start || war === WAR_STATES.END ? (
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
        <div className="log-controls-container">
          <div
            className={`log-button ${logOpen ? "open" : ""}`}
            onClick={logButtonHandler}
          >
            <div className="log-button-line left"></div>
            <div className="log-button-line right"></div>
          </div>
          {logOpen && (
            <div className="log-box">
              <ul>
                {log.map((entry, i) => (
                  <li key={i}>{entry}</li>
                ))}
                <div ref={logEndRef} />
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
