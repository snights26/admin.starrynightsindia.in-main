import "./modals.css";

export default function Modal({ open, title, children, actions, onClose }) {
  if (!open) return null;
  return (
    <div className="app-modal__overlay" role="dialog" aria-modal="true">
      <div className="app-modal">
        <header className="app-modal__header">
          <h2>{title}</h2>
          {onClose && <button type="button" onClick={onClose}>x</button>}
        </header>
        <div className="app-modal__body">{children}</div>
        {actions && <footer className="app-modal__actions">{actions}</footer>}
      </div>
    </div>
  );
}
