import { useState, useEffect } from 'react';

export function usePyodide() {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if ((window as any).pyodideLoadPromise) {
          const py = await (window as any).pyodideLoadPromise;
          setPyodide(py);
          setIsLoading(false);
          return;
        }

        const loadPromise = new Promise(async (resolve, reject) => {
          try {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
            script.onload = async () => {
              try {
                const py = await (window as any).loadPyodide();
                // Redirect stdout to our own handler if possible, but for simple REPL we can capture it during eval
                resolve(py);
              } catch (err) {
                reject(err);
              }
            };
            script.onerror = () => reject(new Error('Failed to load Pyodide script'));
            document.body.appendChild(script);
          } catch (err) {
            reject(err);
          }
        });

        (window as any).pyodideLoadPromise = loadPromise;
        const py = await loadPromise;
        setPyodide(py);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Pyodide loading error", err);
        setError(err.message || 'Failed to load Python environment');
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { pyodide, isLoading, error };
}
