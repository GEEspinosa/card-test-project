import React from "react";

export default function InstructionsModal({ onClose }) {
  return (
    <div className="instruction-modal-overlay">
      <div className="instruction-modal-content">
        <h2>Game Controls</h2>
        <ul>
          <li>
            <strong>1</strong> = Refresh Player One's Deck
          </li>
          <li>
            <strong>2</strong> = Refresh Player Two's Deck
          </li>
          <li>
            <strong>Space</strong> = Play / Continue
          </li>
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
