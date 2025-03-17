import React from 'react';
import { useActionState } from "react";
import './auth.css';

// Rename to avoid conflict with the built-in FormData type
interface AuthFormData {
  username: string;
  password: string;
}

interface FormResult {
  type: "success" | "error";
  message: string;
}

interface UsernamePasswordFormProps {
  onSubmit: (formData: AuthFormData) => Promise<FormResult>;
}

const UsernamePasswordForm: React.FC<UsernamePasswordFormProps> = ({ onSubmit }) => {
  const [result, submitAction, isPending] = useActionState(
    async (_: FormResult | null, formData: FormData) => {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      if (!username || !password) {
        return {
          type: "error" as const,
          message: "Please fill in your username and password.",
        };
      }

      try {
        // Call the onSubmit prop with form data
        const submitResult = await onSubmit({ username, password });
        return submitResult;
      } catch (error) {
        return {
          type: "error" as const,
          message: error instanceof Error ? error.message : "An error occurred during submission.",
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
      {/* Use type assertion to bypass TypeScript's form action typing issues */}
      <form action={submitAction as any}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            disabled={isPending} 
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            disabled={isPending} 
          />
        </div>
        <div className="form-group">
          <button type="submit" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
};

export default UsernamePasswordForm;