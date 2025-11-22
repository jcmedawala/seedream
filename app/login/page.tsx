'use client';

import { login } from './actions';
import styles from './login.module.css';
import { useState } from 'react';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
        // If successful, the server action redirects, so we don't need to do anything here
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} action={handleSubmit}>
                <h1 className={styles.title}>Seedream Editor Login</h1>

                <div className={styles.group}>
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required placeholder="you@example.com" />
                </div>

                <div className={styles.group}>
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" required placeholder="••••••••" />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.button} disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log in'}
                </button>
            </form>
        </div>
    );
}
