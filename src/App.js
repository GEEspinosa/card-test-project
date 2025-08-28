import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./App.css";
import { SUITS, RANKS, RANK_VALUES } from "./assets/card-data";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  toString() {
    return `${this.rank}${this.suit}`
  }
}

const themes = ["classic", "retro", "neon"];

const WAR_STATES = {
  NONE: "none",
  PENDING: "pending",
  FILLED: "filled",
  RESOLVED: "resolved",
  END: "end",
};

function App() {
  const [start, setStart] = useState(false);
  const [gameOver, setGameOver] = useState(false);
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
  const [theme, setTheme] = useState("classic");
  const [mode, setMode] = useState("dark");

  useEffect(() => {
    document.documentElement.className = `${theme} ${mode}`;
  }, [theme, mode]);

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
      if (!start || war === WAR_STATES.END) {
        return false;
      }
      const hasReserve = player.reserve.length > 0;
      const isInWar = war === WAR_STATES.PENDING;

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
    // setPlayerOneScore(0);
    // setPlayerTwoScore(0);
    setMessage("...waiting for card draw");
    setWar(WAR_STATES.NONE);
    setLog([]);

    gameOverHandled.current = false;
    setGameOver(false);
  }, []);

  const startGame = useCallback(() => {
    resetGameState();
    setStart(true);
  }, [resetGameState]);

  const findScoreSum = useCallback((card1, card2, warPile1, warPile2) => {
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
  }, []);

  const awardToPlayerOne = useCallback(
    (card1, card2, warPile1, warPile2) => {
      if (war === WAR_STATES.END || gameOver) return;

      let sum = findScoreSum(card1, card2, warPile1, warPile2);
      setPlayerOneScore((prev) => prev + sum);
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
    [war, findScoreSum, gameOver]
  );

  const awardToPlayerTwo = useCallback(
    (card1, card2, warPile1, warPile2) => {
      if (war === WAR_STATES.END || gameOver) return;

      let sum = findScoreSum(card1, card2, warPile1, warPile2);

      setPlayerTwoScore((prev) => prev + sum);
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
    [war, findScoreSum, gameOver]
  );

  const getWinner = useCallback(
    (card1, card2) => {
      if (gameOver) return null;
      const value1 = RANK_VALUES[card1.rank];
      const value2 = RANK_VALUES[card2.rank];
      if (value1 > value2) {
        return "playerOne";
      }
      if (value1 < value2) {
        return "playerTwo";
      }
      return "WAR!";
    },
    [gameOver]
  );

  const handleCardComparison = useCallback(
    (card1, card2) => {
      if (war === WAR_STATES.END) return;

      if (!card1 || !card2) {
        return;
      }
      let result = getWinner(card1, card2);
      if (!result) return;

      const playSummary = `P1: ${card1.rank}${card1.suit} vs. P2: ${card2.rank}${card2.suit}`;
      const score = `${findScoreSum(
        card1,
        card2,
        playerOne.warPile,
        playerTwo.warPile
      )}`;

      if (result === "playerOne") {
        console.log(score);
        logEvent(`${playSummary} -> Player One Wins! Earned ${score} Points!`);
        awardToPlayerOne(card1, card2, playerOne.warPile, playerTwo.warPile);
      } else if (result === "playerTwo") {
        console.log(score);
        logEvent(`${playSummary} -> Player Two Wins! Earned ${score} Points!`);
        awardToPlayerTwo(card1, card2, playerOne.warPile, playerTwo.warPile);
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
    [
      awardToPlayerOne,
      awardToPlayerTwo,
      war,
      playerOne.warPile,
      playerTwo.warPile,
      getWinner,
      findScoreSum,
    ]
  );

  function hasNoCards(player) {
    return (
      [player.deck, player.reserve, player.warPile].every(arr => arr.length === 0)
      // player.deck.length === 0 &&
      // player.reserve.length === 0 &&
      // player.warPile.length === 0
    );
  }

  const checkForVictory = useCallback(() => {
    if (!start || gameOver) {
      return;
    }

    const p1HasNoCards = hasNoCards(playerOne);
    const p2HasNoCards = hasNoCards(playerTwo);

    if (p1HasNoCards || p2HasNoCards) {
    if (p1HasNoCards && p2HasNoCards) {
      setMessage("It's a tie!");
    } else if (p1HasNoCards) {
      setPlayerTwoVictories((prev) => prev + 1);
      setMessage("Player One has no cards left. Player Two wins!");
    } else {
      setPlayerOneVictories((prev) => prev + 1);
      setMessage("Player Two has no cards left. Player One wins!");
    }

    setWar(WAR_STATES.END);
    setGameOver(true);
    return;}

    // // Basic check: no cards at all
    // if (p1HasNoCards || p2HasNoCards) {
    //   const winner = p2HasNoCards ? "Player One" : "Player Two";
    //   if (winner === "Player One") {
    //     setPlayerOneVictories((prev) => prev + 1);
    //   } else {
    //     setPlayerTwoVictories((prev) => prev + 1);
    //   }
    //   setMessage(`${winner} wins the game!`);
    //   setWar(WAR_STATES.END);
    //   setGameOver(true);
    //   return;
    // }

    // // Edge case: player has war pile cards but cannot continue war (no deck or reserve cards)
    // const p1CanContinueWar = !(
    //   playerOne.warPile.length > 0 &&
    //   playerOne.deck.length + playerOne.reserve.length === 0
    // );
    // const p2CanContinueWar = !(
    //   playerTwo.warPile.length > 0 &&
    //   playerTwo.deck.length + playerTwo.reserve.length === 0
    // );

    // if (!p1CanContinueWar) {
    //   setPlayerTwoVictories((prev) => prev + 1);
    //   setMessage("Player One cannot continue war. Player Two wins!");
    //   setWar(WAR_STATES.END);
    //   setGameOver(true);
    //   return;
    // }

    // if (!p2CanContinueWar) {
    //   setPlayerOneVictories((prev) => prev + 1);
    //   setMessage("Player Two cannot continue war. Player One wins!");
    //   setWar(WAR_STATES.END);
    //   setGameOver(true);
    //   return;
    // }
  }, [playerOne, playerTwo, start, gameOver]);

  useEffect(() => {
    if (war !== WAR_STATES.END) {
      checkForVictory();
    }
  }, [
    playerOne.deck.length,
    playerOne.reserve.length,
    playerOne.warPile.length,
    playerTwo.deck.length,
    playerTwo.reserve.length,
    playerTwo.warPile.length,
    war,
    checkForVictory,
  ]);

  const drawCard = useCallback(() => {
    if (war === WAR_STATES.END || war === WAR_STATES.PENDING || gameOver)
      return;

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
  }, [handleCardComparison, war, playerOne.deck, playerTwo.deck, gameOver]);

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
    const p1CanRefresh = canRefreshDeck(playerOne);
    const p2CanRefresh = canRefreshDeck(playerTwo);

    if (
      (playerOne.deck.length < 3 && p1CanRefresh) ||
      (playerTwo.deck.length < 3 && p2CanRefresh)
    ) {
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
    setSelected1({ suit: "draw", rank: "card" });
    setSelected2({ suit: "draw", rank: "card" });

    const p1Empty = hasNoCards(playerOne);
    const p2Empty = hasNoCards(playerTwo);

    if (p1Empty || p2Empty) {
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
      <div className="theme-selector">
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={theme === t ? "active-theme" : ""}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="mode-toggle-container">
        {/* <span>Mode:</span> */}
        <span className="icon">
          {mode === "dark" ? (
            //moon
            <MoonIcon className="moon-icon" />
          ) : (
            //sun
            <SunIcon className="sun-icon" />
          )}
        </span>
        <label className="mode-toggle">
          <input
            type="checkbox"
            checked={mode === "dark"}
            onChange={() => setMode(mode === "dark" ? "light" : "dark")}
          />
          <span className="slider" />
        </label>
      </div>

      <h2 className="message">{message}</h2>

      <div className="scoreboard">
        <div className="scoreboard-player-one">
          <div>Player One Victories: {playerOneVictories}</div>
          <div>Player One Score: {playerOneScore}</div>
        </div>
        <div className="scoreboard-player-two">
          <div>Player Two Victories: {playerTwoVictories}</div>
          <div>Player Two Score: {playerTwoScore}</div>
        </div>
      </div>

      <div className="players-info">
        {/* Player one info */}
        <div className="player-info">
          <h3>Player One</h3>
          {selected1.suit === "draw" ? (
            <div className="card">
              {selected1.suit} {selected1.rank}
            </div>
          ) : (
            <div className="card">
              <div className="card-rank top-left">{selected1.rank}</div>
              <div className="card-rank bottom-right">{selected1.rank}</div>
              <div className="card-suit-container">
                <div className="card-suit">{selected1.suit}</div>
              </div>
            </div>
          )}
          {start && war !== WAR_STATES.END && canRefreshDeck(playerOne) && (
            <button onClick={() => refreshDeck("playerOne")}>Fresh Deck</button>
          )}
          <div className="stats">
            {/* <p>Score: {playerOneScore}</p> */}
            <p>Deck: {playerOne.deck.length}</p>
            <p>Reserve: {playerOne.reserve.length}</p>
            <p>War Pile: {playerOne.warPile.length}</p>
          </div>
        </div>

        {/* Player two info */}
        <div className="player-info">
          <h3>Player Two</h3>
          {selected2.suit === "draw" ? (
            <div className="card">
              {selected2.suit} {selected2.rank}
            </div>
          ) : (
            <div className="card">
              <div className="card-rank top-left">{selected2.rank}</div>
              <div className="card-rank bottom-right">{selected2.rank}</div>
              <div className="card-suit-container">
                <div className="card-suit">{selected2.suit}</div>
              </div>
            </div>
          )}
          {start && war !== WAR_STATES.END && canRefreshDeck(playerTwo) && (
            <button onClick={() => refreshDeck("playerTwo")}>Fresh Deck</button>
          )}
          <div className="stats">
            {/* <p>Score: {playerTwoScore}</p> */}
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
