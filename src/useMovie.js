import { useEffect, useState } from "react";

const Api = "http://www.omdbapi.com/?apikey=ba9b631a&";

export function useMovie(query) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.length) {
      setMovies([]);
      setError("");
      return;
    }

    const controller = new AbortController();
    async function getMovies() {
      try {
        setError("");
        setLoading(true);
        const res = await fetch(`${Api}s=${query}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Something went wrong!!!");
        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not found!");
        setMovies(data.Search);
        setLoading(false);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // handleCloseMovie();
    getMovies();
    return () => controller.abort();
  }, [query]);

  return { movies, loading, error };
}
