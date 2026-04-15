import "./LoginPromptModal.css";

function LoginPromptModal({ open, message, onCancel, onLogin }) {
  if (!open) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-card">
        <h2>Please login</h2>
        <p>{message}</p>
        <div className="login-modal-actions">
          <button
            type="button"
            className="login-modal-button login-modal-login"
            onClick={onLogin}
          >
            Login
          </button>
          <button
            type="button"
            className="login-modal-button login-modal-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPromptModal;
