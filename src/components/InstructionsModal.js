import React, { useEffect } from "react";

export default function InstructionsModal({ onClose }) {

//below ensures open instructions modal freezes any scrolling in browser
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      const scrollY = Math.abs(parseInt(document.body.style.top || "0"));
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);
  return (
    <div className="instruction-modal-overlay">
      <div className="instruction-modal-content">
        <h2>Game Controls</h2>
        <ul className="instruction-modal-list">
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
