  export function WarPileDisplay({ title, cards }) {
    if (!cards || cards.length === 0) return null;
    return (
      <div className="war-display-container">
        <h4>{title}</h4>
        <div className="war-display">
          {cards.map((card, idx) => (
            <div key={idx} className="card small-card">
              <div className="card-rank top-left">{card.rank}</div>
              <div className="card-rank bottom-right">{card.rank}</div>
              <div className="card-suit-container">
                <div className="card-suit">{card.suit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }