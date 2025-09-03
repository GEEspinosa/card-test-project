  import { WarPileDisplay } from "./WarPileDisplay";
  export function WarModal({ open, onClose, data }) {
    if (!open || !data) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{data.winner} wins the war!</h3>
          <WarPileDisplay title="Winner's Pile" cards={data.winnerPile} />
          <WarPileDisplay title="Loser's Pile" cards={data.loserPile} />
          <button type="button" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    );
  }