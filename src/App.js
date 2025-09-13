import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./App.css";
import { RANK_VALUES } from "./constants/cardData";
import { WAR_STATES } from "./constants/warStates";
import { themes } from "./constants/themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import InstructionsModal from "./components/InstructionsModal";
import {
  buildDeck,
  shuffleDeck,
  splitDeck,
  hasNoCards,
} from "./utils/deckUtils";
import {findScoreSum, prepareDeckForWar} from "./utils/gameUtils";
import { CardDisplay } from "./components/CardDisplay";
import { WarModal } from "./components/WarModal";

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
  const [lastWarCards, setLastWarCards] = useState({
    winner: null,
    winnerPile: [],
    loserPile: [],
  });
  const [playerOneVictories, setPlayerOneVictories] = useState(0);
  const [playerTwoVictories, setPlayerTwoVictories] = useState(0);
  const [message, setMessage] = useState("...waiting for card draw");
  const [log, setLog] = useState([]);
  const [logOpen, setLogOpen] = useState(true);
  const [theme, setTheme] = useState("classic");
  const [mode, setMode] = useState("dark");
  const [warModalOpen, setWarModalOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = `${theme} ${mode}`;
  }, [theme, mode]);

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
        if (war === WAR_STATES.FILLED) {
          setLastWarCards({
            winner: "Player 1",
            winnerPile: [...playerOne.warPile, card1],
            loserPile: [...playerTwo.warPile, card2],
          });
          setWarModalOpen(true);
        }
        logEvent(`${playSummary} -> Player One Wins! Earned ${score} Points!`);
        awardToPlayerOne(card1, card2, playerOne.warPile, playerTwo.warPile);
      } else if (result === "playerTwo") {
        if (war === WAR_STATES.FILLED) {
          setLastWarCards({
            winner: "Player 2",
            winnerPile: [...playerTwo.warPile, card2],
            loserPile: [...playerOne.warPile, card1],
          });
          setWarModalOpen(true);
        }
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
      return;
    }
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
  }, [canRefreshDeck, playerOne, playerTwo]);

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
    setLastWarCards({ winner: null, winnerPile: [], loserPile: [] });
    setWarModalOpen(false);

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
      if (event.code === "Space") {
        event.preventDefault();
      }
      if (warModalOpen) {
        handleContinue();
        return;
      }

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
    handleContinue,
    warModalOpen,
  ]);

  return (
    <div className="app-container">
      <button
        className="help-button"
        onClick={() => setInstructionsOpen(true)}
        aria-label="Open Instructions"
      >
        <AiOutlineQuestionCircle size ={28} />
      </button>
      {instructionsOpen && (
        <InstructionsModal onClose={() => setInstructionsOpen(false)}/>
      )}
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
          <CardDisplay card={selected1} />
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
          <CardDisplay card={selected2} />
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

      <WarModal
        open={warModalOpen}
        data={lastWarCards}
        onClose={handleContinue}
      />

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
                <div />
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
