export function AccountSettings({ userName, onUserNameChange }) {
    return (
      <>
        <h2>Account settings</h2>
        <label>
          Username
          <input 
            value={userName} 
            onChange={(e) => onUserNameChange(e.target.value)} 
          />
        </label>
        <p><i>Changes are auto-saved.</i></p>
      </>
    );
  }