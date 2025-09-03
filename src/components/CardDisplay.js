  export function CardDisplay({ card }) {
    return card.suit === "draw" ? (
      <div className="card">
        {card.suit} {card.rank}
      </div>
    ) : (
      <div className="card">
        <div className="card-rank top-left">{card.rank}</div>
        <div className="card-rank bottom-right">{card.rank}</div>
        <div className="card-suit-container">
          <div className="card-suit">{card.suit}</div>
        </div>
      </div>
    );
  }