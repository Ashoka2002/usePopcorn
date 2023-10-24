import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating.js";
import { useMovie } from "./useMovie.js";
import { useLocalStorageState } from "./useLocalStorageState.js";
import { useKey } from "./useKey.js";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const Api = "http://www.omdbapi.com/?apikey=ba9b631a&";

const root = document.documentElement;

const setVariables = (vars) =>
  Object.entries(vars).forEach((v) => root.style.setProperty(v[0], v[1]));

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [isDark, setIsDark] = useLocalStorageState(
    window.matchMedia("(prefers-color-scheme:dark)").matches,
    "dark"
  );
  const { movies, loading, error } = useMovie(query);

  useEffect(() => {
    if (isDark) {
      const myVariables = {
        "--color-primary": "#6741d9",
        "--color-primary-light": "#7950f2",
        "--color-text": "#dee2e6",
        "--color-text-dark": "#adb5bd",
        "--color-background-100": "#343a40",
        "--color-background-500": "#2b3035",
        "--color-background-900": "#212529",
      };
      setVariables(myVariables);
    } else {
      const myVariables = {
        "--color-primary": "#8EC3B0",
        "--color-primary-light": "#9ED5C5",
        "--color-text": "#2b3035",
        "--color-text-dark": "#212529",
        "--color-background-100": "#F8F6F4",
        "--color-background-500": "#E3F4F4",
        "--color-background-900": "#D2E9E9",
      };
      setVariables(myVariables);
    }
  }, [isDark]);

  function handleSelectMovie(id) {
    setSelectedId((selectedMovie) => (selectedMovie === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWached(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWached(id) {
    setWatched((movie) => watched.filter((movie) => movie.imdbID !== id));
  }

  function handleToggleDark() {
    setIsDark((curr) => !curr);
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        {movies.length > 0 && <NumResults movies={movies} />}
        <DarkMode handleToggleDark={handleToggleDark} isDark={isDark} />
      </Navbar>

      <Main>
        <Box>
          {loading && <Loader />}
          {!loading && !error && (
            <MovieList onMoiveSelect={handleSelectMovie} movies={movies} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetail
              watched={watched}
              onAddWached={handleAddWached}
              onCloseMovie={handleCloseMovie}
              selectedId={selectedId}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                onDeleteWached={handleDeleteWached}
                watched={watched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function DarkMode({ isDark, handleToggleDark }) {
  return (
    <div onClick={handleToggleDark} className="theme-icon">
      {isDark ? <BsFillSunFill /> : <BsFillMoonStarsFill />}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onMoiveSelect }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} onMoiveSelect={onMoiveSelect} movie={movie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onMoiveSelect }) {
  return (
    <li
      onClick={() => {
        onMoiveSelect(movie.imdbID);
      }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetail({ watched, selectedId, onCloseMovie, onAddWached }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useKey("Escape", onCloseMovie);

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRaing = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function onAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: +imdbRating,
      runtime: runtime !== "N/A" ? +runtime.split(" ").at(0) : 0,
      userRating,
      userRatingDesision: countRef.current,
    };

    onAddWached(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(() => {
    async function getMoviesDetail() {
      try {
        setLoading(true);
        const res = await fetch(`${Api}i=${selectedId}`);
        if (!res.ok) throw new Error("Something went wrong!!!");
        const data = await res.json();
        setMovie(data);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      }
    }
    getMoviesDetail();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;
    document.title = `MOVIE | ${title} `;
    return () => (document.title = "usePopcorn");
  }, [title]);

  return loading ? (
    <Loader />
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${title}`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} IMDB rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={onAdd}>
                  + add to watchlist
                </button>
              )}
            </>
          ) : (
            <p>you have Rated this movie {watchedUserRaing}🌟</p>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched?.map((movie) => movie.userRating));
  const avgRuntime = average(watched?.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDeleteWached }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          onDeleteWached={onDeleteWached}
          key={movie.imdbID}
          movie={movie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWached }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWached(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
