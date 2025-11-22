'use client';

import { useState } from 'react';
import styles from './page.module.css';
import EditorForm from '@/components/EditorForm';
import ResultViewer from '@/components/ResultViewer';
import { signOut } from './auth/actions';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setStatus('Generating image...');
    setOriginalUrl(data.image_urls[0]); // Keep original URL for ResultViewer

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (responseData.outputs && responseData.outputs.length > 0) {
        setResultUrl(responseData.outputs[0]);
        setStatus('Completed');
      } else {
        throw new Error('No output image returned');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setStatus('Failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.topBar}>
          <form action={signOut}>
            <button className={styles.logoutButton}>Sign Out</button>
          </form>
        </div>
        <h1>Seedream Editor</h1>
        <p>AI-powered image editing with Seedream V4</p>
      </div>

      <EditorForm onSubmit={handleSubmit} isLoading={isLoading} />

      {status && <div className={styles.status}>{status}</div>}

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {resultUrl && (
        <ResultViewer resultUrl={resultUrl} originalUrl={originalUrl} />
      )}
    </main>
  );
}
