(function () {
  "use strict";

  const DEFAULT_REVIEWS = [
    {
      id: "seed-1",
      title: "Inception",
      director: "Christopher Nolan",
      releaseYear: 2010,
      genre: "Sci-Fi",
      rating: 5,
      isFavorite: true,
      dateWatched: "2026-02-15",
      reviewText: "A masterclass in original, high-concept blockbusters. Nolan weaves an intricate narrative of dreams within dreams, anchored by Hans Zimmer's incredible score, incredible cinematography, and outstanding visual effects.",
      posterUrl: makePoster("Inception", "Sci-Fi", "#111827", "#d4af37")
    },
    {
      id: "seed-2",
      title: "La La Land",
      director: "Damien Chazelle",
      releaseYear: 2016,
      genre: "Drama",
      rating: 5,
      isFavorite: true,
      dateWatched: "2026-03-01",
      reviewText: "A colorful love letter to classical Hollywood musicals and the dreamer in all of us. The score is enchanting, and the bittersweet final sequence is unforgettable.",
      posterUrl: makePoster("La La Land", "Drama", "#4c1d2f", "#f8d57e")
    },
    {
      id: "seed-3",
      title: "Parasite",
      director: "Bong Joon Ho",
      releaseYear: 2019,
      genre: "Thriller",
      rating: 5,
      isFavorite: false,
      dateWatched: "2026-04-10",
      reviewText: "A brilliant, genre-bending masterpiece that blends dark comedy, social satire, and high-tension thriller effortlessly.",
      posterUrl: makePoster("Parasite", "Thriller", "#14211d", "#e5e7eb")
    },
    {
      id: "seed-4",
      title: "Spirited Away",
      director: "Hayao Miyazaki",
      releaseYear: 2001,
      genre: "Animation",
      rating: 4,
      isFavorite: true,
      dateWatched: "2026-05-20",
      reviewText: "A whimsical, deeply emotional, and profoundly imaginative journey into a spirit world. Every scene is dripping with atmosphere and rich folklore.",
      posterUrl: makePoster("Spirited Away", "Animation", "#1d2433", "#a7f3d0")
    }
  ];

  const PRESET_POSTERS = [
    ["Sci-Fi Blue", makePoster("Deep Space", "Sci-Fi", "#0f172a", "#60a5fa")],
    ["Cinema Noir", makePoster("Noir Night", "Mystery", "#09090b", "#d4af37")],
    ["Warm Indie", makePoster("Golden Hour", "Drama", "#3f1f1f", "#fbbf24")],
    ["Cyber Sunset", makePoster("Neon City", "Action", "#211034", "#fb7185")],
    ["Zen Fantasy", makePoster("Spirit Road", "Fantasy", "#14332f", "#a7f3d0")]
  ];

  const GENRES = ["All Genres", "Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Romance", "Animation", "Documentary", "Mystery"];
  const DEFAULT_POSTER = makePoster("CineLog", "Movie Journal", "#18181b", "#d4af37");
  const STORAGE_KEY = "cinelog_reviews";

  let reviews = loadReviews();
  let searchQuery = "";
  let selectedGenre = "All Genres";
  let favoritesOnly = false;
  let sortBy = "date-desc";
  let formRating = 5;
  let formIsFavorite = false;
  let editingReviewId = null;

  function makePoster(title, subtitle, background, accent) {
    const safeTitle = String(title).replace(/[<>&]/g, "");
    const safeSubtitle = String(subtitle).replace(/[<>&]/g, "");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="${background}"/>
            <stop offset="1" stop-color="#050505"/>
          </linearGradient>
          <radialGradient id="r" cx="72%" cy="20%" r="55%">
            <stop offset="0" stop-color="${accent}" stop-opacity=".42"/>
            <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="900" height="560" fill="url(#g)"/>
        <rect width="900" height="560" fill="url(#r)"/>
        <g fill="none" stroke="${accent}" stroke-opacity=".28" stroke-width="3">
          <circle cx="706" cy="168" r="86"/>
          <circle cx="706" cy="168" r="128"/>
          <path d="M72 438h756M72 472h520"/>
        </g>
        <g font-family="Segoe UI, Arial, sans-serif">
          <text x="72" y="92" fill="${accent}" font-size="24" font-weight="700" letter-spacing="7">${safeSubtitle.toUpperCase()}</text>
          <text x="72" y="378" fill="#fff" font-size="68" font-weight="800">${safeTitle}</text>
          <text x="72" y="420" fill="#d1d5db" font-size="24">Personal movie journal poster</text>
        </g>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function loadReviews() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : DEFAULT_REVIEWS.slice();
    } catch (error) {
      return DEFAULT_REVIEWS.slice();
    }
  }

  function saveReviews() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function stars(rating) {
    const filled = "★".repeat(Number(rating) || 0);
    const empty = "☆".repeat(5 - (Number(rating) || 0));
    return `<span class="stars" aria-label="${rating} out of 5 stars">${filled}${empty}</span>`;
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function renderStats() {
    const total = reviews.length;
    const avg = total ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total).toFixed(1) : "0.0";
    const favorites = reviews.filter((review) => review.isFavorite).length;
    const topGenre = getTopGenre();

    document.getElementById("stats-container").innerHTML = [
      statCard("Films", "Watched", total),
      statCard("Stars", "Avg Rating", `${avg} / 5`),
      statCard("Heart", "Favorites", favorites),
      statCard("Trend", "Top Genre", topGenre)
    ].join("");
  }

  function statCard(icon, label, value) {
    return `
      <article class="stat-card">
        <span class="stat-icon">${escapeHtml(icon)}</span>
        <div>
          <p class="stat-label">${escapeHtml(label)}</p>
          <p class="stat-value" title="${escapeHtml(value)}">${escapeHtml(value)}</p>
        </div>
      </article>
    `;
  }

  function getTopGenre() {
    if (!reviews.length) return "N/A";
    const counts = reviews.reduce((map, review) => {
      map[review.genre] = (map[review.genre] || 0) + 1;
      return map;
    }, {});
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || "N/A";
  }

  function renderFilters() {
    document.getElementById("filter-container").innerHTML = `
      <div class="filter-top">
        <input id="search-input" type="search" value="${escapeHtml(searchQuery)}" placeholder="Search by title, director, genre, or review">
        <div class="filter-actions">
          <button type="button" id="favorites-toggle-btn" class="ghost-button ${favoritesOnly ? "active" : ""}">Favorites Only</button>
          <select id="sort-select" aria-label="Sort movies">
            <option value="date-desc" ${sortBy === "date-desc" ? "selected" : ""}>Newest Watched</option>
            <option value="date-asc" ${sortBy === "date-asc" ? "selected" : ""}>Oldest Watched</option>
            <option value="rating-desc" ${sortBy === "rating-desc" ? "selected" : ""}>Highest Rated</option>
            <option value="rating-asc" ${sortBy === "rating-asc" ? "selected" : ""}>Lowest Rated</option>
            <option value="title-asc" ${sortBy === "title-asc" ? "selected" : ""}>Title A-Z</option>
          </select>
        </div>
      </div>
      <p class="section-kicker">Filter by Genre</p>
      <div class="genre-row">
        ${GENRES.map((genre) => `<button type="button" class="chip ${genre === selectedGenre ? "active" : ""}" data-genre="${escapeHtml(genre)}">${escapeHtml(genre)}</button>`).join("")}
      </div>
    `;
  }

  function renderGrid() {
    const movies = getProcessedReviews();
    const hasFilters = searchQuery || selectedGenre !== "All Genres" || favoritesOnly;

    document.getElementById("grid-container").innerHTML = `
      <div class="collection-header">
        <h2>My Movie Collection <span class="match-count">${movies.length} movies match</span></h2>
        ${hasFilters ? `<button type="button" id="clear-filters-btn" class="ghost-button">Clear Filters</button>` : ""}
      </div>
      ${
        movies.length
          ? `<div class="movie-grid">${movies.map(movieCard).join("")}</div>`
          : `<div class="empty-state"><h3>No Movie Reviews Found</h3><p>Try adjusting your filters or add a new movie review.</p></div>`
      }
    `;
  }

  function getProcessedReviews() {
    let processed = reviews.slice();
    const query = searchQuery.toLowerCase().trim();

    if (selectedGenre !== "All Genres") {
      processed = processed.filter((review) => review.genre === selectedGenre);
    }
    if (favoritesOnly) {
      processed = processed.filter((review) => review.isFavorite);
    }
    if (query) {
      processed = processed.filter((review) => {
        return [review.title, review.director, review.genre, review.reviewText].some((value) => String(value || "").toLowerCase().includes(query));
      });
    }

    processed.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.dateWatched) - new Date(a.dateWatched);
      if (sortBy === "date-asc") return new Date(a.dateWatched) - new Date(b.dateWatched);
      if (sortBy === "rating-desc") return b.rating - a.rating;
      if (sortBy === "rating-asc") return a.rating - b.rating;
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      return 0;
    });

    return processed;
  }

  function movieCard(review) {
    return `
      <article class="movie-card">
        <div class="poster-wrap">
          <img src="${escapeHtml(review.posterUrl || DEFAULT_POSTER)}" alt="${escapeHtml(review.title)} poster" onerror="this.src='${DEFAULT_POSTER}'">
          <button type="button" class="favorite-button ${review.isFavorite ? "active" : ""}" data-favorite-id="${escapeHtml(review.id)}" aria-label="Toggle favorite">♥</button>
          <span class="genre-badge">${escapeHtml(review.genre)}</span>
        </div>
        <div class="card-body">
          <div class="card-title-line">
            <h3>${escapeHtml(review.title)}</h3>
            <span class="year-pill">${escapeHtml(review.releaseYear)}</span>
          </div>
          <p class="director">Directed by ${escapeHtml(review.director || "Unknown")}</p>
          ${stars(review.rating)}
          <p class="review-snippet">${escapeHtml(review.reviewText || "No review text yet.")}</p>
          <div class="card-actions">
            <button type="button" class="ghost-button" data-view-id="${escapeHtml(review.id)}">View</button>
            <button type="button" class="ghost-button" data-edit-id="${escapeHtml(review.id)}">Edit</button>
            <button type="button" class="danger-button" data-delete-id="${escapeHtml(review.id)}">Delete</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderForm() {
    const active = reviews.find((review) => review.id === editingReviewId);
    const values = active || {
      title: "",
      director: "",
      releaseYear: new Date().getFullYear(),
      genre: "Drama",
      dateWatched: today(),
      posterUrl: "",
      reviewText: ""
    };

    document.getElementById("form-container").innerHTML = `
      <form id="journal-form">
        <div class="form-title">
          <div>
            <p class="section-kicker">${active ? "Editing Review" : "New Review"}</p>
            <h2>${active ? "Update Movie" : "Add Movie"}</h2>
          </div>
          <button type="button" id="form-favorite-btn" class="icon-button ${formIsFavorite ? "active" : ""}" aria-label="Toggle favorite">♥</button>
        </div>

        <div class="field-grid">
          <div class="field full-field">
            <label for="form-title">Movie Title</label>
            <input id="form-title" required value="${escapeHtml(values.title)}" placeholder="Inception">
          </div>
          <div class="field">
            <label for="form-director">Director</label>
            <input id="form-director" value="${escapeHtml(values.director)}" placeholder="Christopher Nolan">
          </div>
          <div class="field">
            <label for="form-year">Release Year</label>
            <input id="form-year" type="number" required min="1888" max="2100" value="${escapeHtml(values.releaseYear)}">
          </div>
          <div class="field">
            <label for="form-genre">Genre</label>
            <select id="form-genre">${GENRES.filter((genre) => genre !== "All Genres").map((genre) => `<option value="${genre}" ${values.genre === genre ? "selected" : ""}>${genre}</option>`).join("")}</select>
          </div>
          <div class="field">
            <label for="form-date">Date Watched</label>
            <input id="form-date" type="date" required value="${escapeHtml(values.dateWatched)}">
          </div>
          <div class="field full-field">
            <label for="form-poster">Poster Image URL</label>
            <input id="form-poster" value="${escapeHtml(values.posterUrl)}" placeholder="https://example.com/poster.jpg">
          </div>
        </div>

        <label>Rating</label>
        <div class="rating-row">
          ${[1, 2, 3, 4, 5].map((value) => `<button type="button" class="star-button ${value <= formRating ? "active" : ""}" data-rating="${value}" aria-label="${value} stars">★</button>`).join("")}
        </div>

        <label>Quick Poster Presets</label>
        <div class="preset-row">
          ${PRESET_POSTERS.map(([name, url]) => `<button type="button" class="chip" data-preset-url="${escapeHtml(url)}">${escapeHtml(name)}</button>`).join("")}
          <button type="button" id="clear-poster-btn" class="danger-button">Clear Image</button>
        </div>

        <div class="field full-field" style="margin-top: 14px;">
          <label for="form-thoughts">Personal Review</label>
          <textarea id="form-thoughts" placeholder="Write your honest critique, favorite scenes, score notes, or overall thoughts...">${escapeHtml(values.reviewText)}</textarea>
        </div>

        <div class="button-row">
          <button type="submit" class="primary-button">${active ? "Save Updates" : "Add to Journal"}</button>
          <button type="button" id="${active ? "form-cancel-btn" : "form-reset-btn"}" class="ghost-button">${active ? "Cancel" : "Reset Form"}</button>
        </div>
      </form>
    `;
  }

  function renderModal(id) {
    const review = reviews.find((item) => item.id === id);
    const container = document.getElementById("modal-container");
    if (!review) {
      container.classList.add("hidden");
      return;
    }

    container.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(review.title)} review">
        <div class="modal-dialog">
          <button type="button" id="modal-close-btn" class="icon-button modal-close" aria-label="Close">X</button>
          <div class="modal-poster">
            <img src="${escapeHtml(review.posterUrl || DEFAULT_POSTER)}" alt="${escapeHtml(review.title)} poster" onerror="this.src='${DEFAULT_POSTER}'">
          </div>
          <div class="modal-body">
            <p class="section-kicker">${escapeHtml(review.genre)} Review</p>
            <h2>${escapeHtml(review.title)}</h2>
            <p class="director">Released ${escapeHtml(review.releaseYear)} · Directed by ${escapeHtml(review.director || "Unknown")} · Watched ${escapeHtml(review.dateWatched)}</p>
            ${stars(review.rating)}
            ${review.isFavorite ? `<p class="section-kicker" style="margin-top: 18px;">Personal Favorite</p>` : ""}
            <div class="modal-review">${escapeHtml(review.reviewText || "No thoughts logged yet.")}</div>
            <div class="modal-actions">
              <button type="button" class="ghost-button" data-edit-id="${escapeHtml(review.id)}">Edit</button>
              <button type="button" class="danger-button" data-delete-id="${escapeHtml(review.id)}">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.classList.remove("hidden");
  }

  function updateUI() {
    renderStats();
    renderFilters();
    renderGrid();
  }

  function resetFormState() {
    editingReviewId = null;
    formRating = 5;
    formIsFavorite = false;
    renderForm();
  }

  function editReview(id) {
    const review = reviews.find((item) => item.id === id);
    if (!review) return;
    editingReviewId = id;
    formRating = review.rating;
    formIsFavorite = review.isFavorite;
    renderForm();
    document.getElementById("form-container").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deleteReview(id) {
    if (!confirm("Delete this movie review from your journal?")) return;
    reviews = reviews.filter((review) => review.id !== id);
    saveReviews();
    document.getElementById("modal-container").classList.add("hidden");
    if (editingReviewId === id) resetFormState();
    updateUI();
  }

  function setupEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      const genre = target.closest("[data-genre]");
      const favorite = target.closest("[data-favorite-id]");
      const view = target.closest("[data-view-id]");
      const edit = target.closest("[data-edit-id]");
      const deleteButton = target.closest("[data-delete-id]");
      const rating = target.closest("[data-rating]");
      const preset = target.closest("[data-preset-url]");

      if (genre) {
        selectedGenre = genre.dataset.genre;
        updateUI();
      } else if (favorite) {
        const id = favorite.dataset.favoriteId;
        reviews = reviews.map((review) => review.id === id ? { ...review, isFavorite: !review.isFavorite } : review);
        saveReviews();
        updateUI();
      } else if (view) {
        renderModal(view.dataset.viewId);
      } else if (edit) {
        document.getElementById("modal-container").classList.add("hidden");
        editReview(edit.dataset.editId);
      } else if (deleteButton) {
        deleteReview(deleteButton.dataset.deleteId);
      } else if (rating) {
        formRating = Number(rating.dataset.rating);
        renderForm();
      } else if (preset) {
        document.getElementById("form-poster").value = preset.dataset.presetUrl;
      } else if (target.closest("#favorites-toggle-btn")) {
        favoritesOnly = !favoritesOnly;
        updateUI();
      } else if (target.closest("#clear-filters-btn")) {
        searchQuery = "";
        selectedGenre = "All Genres";
        favoritesOnly = false;
        updateUI();
      } else if (target.closest("#form-favorite-btn")) {
        formIsFavorite = !formIsFavorite;
        renderForm();
      } else if (target.closest("#clear-poster-btn")) {
        document.getElementById("form-poster").value = "";
      } else if (target.closest("#form-reset-btn") || target.closest("#form-cancel-btn")) {
        resetFormState();
      } else if (target.closest("#reset-seeds-btn")) {
        if (confirm("Reset CineLog to the original seed movie reviews?")) {
          reviews = DEFAULT_REVIEWS.slice();
          saveReviews();
          resetFormState();
          updateUI();
        }
      } else if (target.closest("#modal-close-btn") || target.classList.contains("modal")) {
        document.getElementById("modal-container").classList.add("hidden");
      }
    });

    document.addEventListener("input", (event) => {
      if (event.target.id === "search-input") {
        searchQuery = event.target.value;
        renderGrid();
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target.id === "sort-select") {
        sortBy = event.target.value;
        renderGrid();
      }
    });

    document.addEventListener("submit", (event) => {
      if (event.target.id !== "journal-form") return;
      event.preventDefault();

      const title = document.getElementById("form-title").value.trim();
      const releaseYear = Number(document.getElementById("form-year").value);
      const dateWatched = document.getElementById("form-date").value;

      if (!title || !releaseYear || !dateWatched) {
        alert("Please fill out Title, Release Year, and Date Watched.");
        return;
      }

      const data = {
        title,
        director: document.getElementById("form-director").value.trim(),
        releaseYear,
        genre: document.getElementById("form-genre").value,
        dateWatched,
        rating: formRating,
        isFavorite: formIsFavorite,
        posterUrl: document.getElementById("form-poster").value.trim(),
        reviewText: document.getElementById("form-thoughts").value.trim()
      };

      if (editingReviewId) {
        reviews = reviews.map((review) => review.id === editingReviewId ? { ...data, id: editingReviewId } : review);
      } else {
        reviews.unshift({ ...data, id: `custom-${Date.now()}` });
      }

      saveReviews();
      resetFormState();
      updateUI();
    });
  }

  function init() {
    renderForm();
    updateUI();
    setupEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
