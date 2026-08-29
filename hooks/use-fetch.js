"use client";

import { useCallback, useState } from "react";

export default function useFetch(cb) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fn = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cb(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cb]);

  return { data, error, loading, fn };
}
