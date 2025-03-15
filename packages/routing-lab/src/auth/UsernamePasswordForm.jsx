import { useActionState } from "react";


const UsernamePasswordForm = ({ onSubmit }) => {
  const [result, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const username = formData.get("username");
      const password = formData.get("password");

      if (!username || !password) {
        return {
          type: "error",
          message: "Please fill in your username and password.",
        };
      }

      try {
        // Call the onSubmit prop with form data
        const submitResult = await onSubmit({ username, password });
        return submitResult;
      } catch (error) {
        return {
          type: "error",
          message: error.message || "An error occurred during submission.",
        };
      }
    },
    null
  );

  return (
    <>
      {result && (
        <p className={`message ${result.type}`}>{result.message}</p>
      )}
      {isPending && <p className="message loading">Submitting...</p>}
      <form action={submitAction}>
        <div>
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            disabled={isPending} 
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            disabled={isPending} 
          />
        </div>
        <div>
          <button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
};

export default UsernamePasswordForm;