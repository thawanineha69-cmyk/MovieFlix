class MovieExplorer {
    constructor() {
        // ==========================================
        // OMDb API
        // ==========================================
        this.API_KEY = "8e60e4a9";
        this.BASE_URL = "https://www.omdbapi.com/";

        this.currentPage = 1;
        this.currentSearch = "Avengers";
        this.totalResults = 0;

        this.currentGenre = "";
        this.currentYear = "";
        this.currentSort = "";

        this.searchTimeout = null;

        this.init();
    }

    // ==========================================
    // INITIALIZE
    // ==========================================

    init() {
        this.cacheElements();
        this.bindEvents();

        this.loadMovies();
        this.loadTrendingMovies();
    }

    // ==========================================
    // CACHE HTML ELEMENTS
    // ==========================================

    cacheElements() {
        this.searchInput = document.querySelector("#search-input");
        this.searchButton = document.querySelector("#search-button");

        this.genreFilter = document.querySelector("#genre-filter");
        this.yearFilter = document.querySelector("#year-filter");
        this.sortFilter = document.querySelector("#sort-by");

        this.clearFiltersButton =
            document.querySelector("#clear-filters");

        this.movieGrid =
            document.querySelector("#movie-grid");

        this.trendingMovies =
            document.querySelector("#trending-movies");

        this.randomMovies =
            document.querySelector("#random-movies");

        this.randomSectionTitle =
            document.querySelector("#random-section-title");

        this.prevButton =
            document.querySelector("#prev-page");

        this.nextButton =
            document.querySelector("#next-page");

        this.pageInfo =
            document.querySelector("#page-info");

        this.loading =
            document.querySelector("#loading");

        this.errorMessage =
            document.querySelector("#error-message");
    }

    // ==========================================
    // EVENTS
    // ==========================================

    bindEvents() {

        // Search button
        if (this.searchButton) {
            this.searchButton.addEventListener("click", () => {
                this.performSearch();
            });
        }

        // Search Enter
        if (this.searchInput) {
            this.searchInput.addEventListener("keyup", (event) => {

                if (event.key === "Enter") {
                    this.performSearch();
                }
            });

            // Debounce search
            this.searchInput.addEventListener("input", () => {

                clearTimeout(this.searchTimeout);

                this.searchTimeout = setTimeout(() => {

                    const value =
                        this.searchInput.value.trim();

                    if (value.length >= 2) {
                        this.performSearch();
                    }

                }, 700);
            });
        }

        // Genre
        if (this.genreFilter) {
            this.genreFilter.addEventListener("change", () => {
                this.applyFilters();
            });
        }

        // Year
        if (this.yearFilter) {
            this.yearFilter.addEventListener("change", () => {
                this.applyFilters();
            });
        }

        // Sort
        if (this.sortFilter) {
            this.sortFilter.addEventListener("change", () => {
                this.applyFilters();
            });
        }

        // Clear
        if (this.clearFiltersButton) {
            this.clearFiltersButton.addEventListener("click", () => {
                this.clearFilters();
            });
        }

        // Previous
        if (this.prevButton) {
            this.prevButton.addEventListener("click", () => {

                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadMovies();
                }

            });
        }

        // Next
        if (this.nextButton) {
            this.nextButton.addEventListener("click", () => {

                const totalPages =
                    Math.ceil(this.totalResults / 10);

                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadMovies();
                }

            });
        }
    }

    // ==========================================
    // API REQUEST
    // ==========================================

    async fetchAPI(params = {}) {

        const queryParams = new URLSearchParams();

        queryParams.append("apikey", this.API_KEY);

        Object.keys(params).forEach((key) => {

            if (
                params[key] !== "" &&
                params[key] !== null &&
                params[key] !== undefined
            ) {
                queryParams.append(key, params[key]);
            }

        });

        const url =
            `${this.BASE_URL}?${queryParams.toString()}`;

        try {

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `HTTP Error: ${response.status}`
                );
            }

            const data = await response.json();

            if (data.Response === "False") {
                throw new Error(
                    data.Error || "Movie not found"
                );
            }

            return data;

        } catch (error) {

            console.error("OMDb API Error:", error);

            throw error;
        }
    }

    // ==========================================
    // LOAD MOVIES
    // ==========================================

    async loadMovies() {

        this.showLoading();

        try {

            const params = {
                s: this.currentSearch,
                type: "movie",
                page: this.currentPage
            };

            // Year
            if (this.currentYear) {
                params.y = this.currentYear;
            }

            const data =
                await this.fetchAPI(params);

            this.totalResults =
                parseInt(data.totalResults) || 0;

            let movies = data.Search || [];

            // Genre filtering requires details
            if (this.currentGenre) {

                movies =
                    await this.filterMoviesByGenre(
                        movies,
                        this.currentGenre
                    );
            }

            // Sorting
            movies =
                this.sortMovies(
                    movies,
                    this.currentSort
                );

            this.renderMovies(
                movies,
                this.movieGrid
            );

            this.updatePagination();

            this.hideLoading();

        } catch (error) {

            this.hideLoading();

            this.showError(
                error.message ||
                "Unable to load movies."
            );
        }
    }

    // ==========================================
    // TRENDING / POPULAR MOVIES
    // ==========================================
    // OMDb does not have a real "trending" endpoint.
    // We use popular/common movie searches.

    async loadTrendingMovies() {

        if (!this.trendingMovies) {
            return;
        }

        this.trendingMovies.innerHTML =
            `<div class="movie-loading">
                Loading movies...
            </div>`;

        const popularTitles = [
            "Avengers",
            "Batman",
            "Spider-Man",
            "Harry Potter",
            "Jurassic Park",
            "Mission Impossible",
            "Fast",
            "Superman"
        ];

        try {

            const requests =
                popularTitles.map((title) => {

                    return this.fetchAPI({
                        s: title,
                        type: "movie",
                        page: 1
                    });

                });

            const results =
                await Promise.allSettled(requests);

            let movies = [];

            results.forEach((result) => {

                if (result.status === "fulfilled") {

                    if (result.value.Search) {
                        movies.push(
                            ...result.value.Search.slice(0, 2)
                        );
                    }
                }
            });

            // Remove duplicates
            movies = this.removeDuplicates(movies);

            this.renderMovies(
                movies.slice(0, 12),
                this.trendingMovies
            );

        } catch (error) {

            console.error(
                "Trending movies error:",
                error
            );

            this.trendingMovies.innerHTML =
                `<p>Unable to load movies.</p>`;
        }
    }

    // ==========================================
    // RANDOM MOVIES
    // ==========================================

    async loadRandomMovies() {

        const randomWords = [
            "love",
            "man",
            "the",
            "star",
            "night",
            "life",
            "dark",
            "war",
            "world",
            "home"
        ];

        const randomWord =
            randomWords[
            Math.floor(
                Math.random() * randomWords.length
            )
            ];

        try {

            const data =
                await this.fetchAPI({
                    s: randomWord,
                    type: "movie",
                    page: Math.floor(
                        Math.random() * 5
                    ) + 1
                });

            let movies =
                data.Search || [];

            movies =
                this.shuffleArray(movies);

            this.renderMovies(
                movies.slice(0, 8),
                this.randomMovies
            );

            if (this.randomSectionTitle) {
                this.randomSectionTitle.textContent =
                    "Random Movies";
            }

        } catch (error) {

            console.error(
                "Random movie error:",
                error
            );
        }
    }

    // ==========================================
    // SEARCH
    // ==========================================

    performSearch() {

        if (!this.searchInput) {
            return;
        }

        const searchValue =
            this.searchInput.value.trim();

        if (!searchValue) {

            this.searchInput.focus();

            return;
        }

        this.currentSearch =
            searchValue;

        this.currentPage = 1;

        this.currentGenre = "";
        this.currentYear = "";
        this.currentSort = "";

        if (this.genreFilter) {
            this.genreFilter.value = "";
        }

        if (this.yearFilter) {
            this.yearFilter.value = "";
        }

        if (this.sortFilter) {
            this.sortFilter.value = "";
        }

        this.loadMovies();
    }

    // ==========================================
    // FILTERS
    // ==========================================

    applyFilters() {

        this.currentGenre =
            this.genreFilter
                ? this.genreFilter.value
                : "";

        this.currentYear =
            this.yearFilter
                ? this.yearFilter.value
                : "";

        this.currentSort =
            this.sortFilter
                ? this.sortFilter.value
                : "";

        this.currentPage = 1;

        this.loadMovies();
    }

    // ==========================================
    // CLEAR FILTERS
    // ==========================================

    clearFilters() {

        this.currentGenre = "";
        this.currentYear = "";
        this.currentSort = "";

        if (this.genreFilter) {
            this.genreFilter.value = "";
        }

        if (this.yearFilter) {
            this.yearFilter.value = "";
        }

        if (this.sortFilter) {
            this.sortFilter.value = "";
        }

        this.currentPage = 1;

        this.loadMovies();
    }

    // ==========================================
    // GENRE FILTER
    // ==========================================
    // OMDb doesn't provide genre IDs.
    // So we fetch details and compare Genre text.

    async filterMoviesByGenre(
        movies,
        genre
    ) {

        if (!genre) {
            return movies;
        }

        const detailedMovies = [];

        const requests =
            movies.map((movie) => {

                return this.fetchAPI({
                    i: movie.imdbID,
                    plot: "short"
                });

            });

        const results =
            await Promise.allSettled(requests);

        results.forEach((result) => {

            if (result.status === "fulfilled") {

                const movie =
                    result.value;

                if (
                    movie.Genre &&
                    movie.Genre
                        .toLowerCase()
                        .includes(
                            genre.toLowerCase()
                        )
                ) {

                    detailedMovies.push(movie);
                }
            }
        });

        return detailedMovies;
    }

    // ==========================================
    // SORT
    // ==========================================

    sortMovies(
        movies,
        sortType
    ) {

        if (!sortType) {
            return movies;
        }

        const sorted =
            [...movies];

        switch (sortType) {

            case "title-asc":

                sorted.sort((a, b) =>
                    a.Title.localeCompare(
                        b.Title
                    )
                );

                break;

            case "title-desc":

                sorted.sort((a, b) =>
                    b.Title.localeCompare(
                        a.Title
                    )
                );

                break;

            case "year-asc":

                sorted.sort((a, b) =>
                    parseInt(a.Year) -
                    parseInt(b.Year)
                );

                break;

            case "year-desc":

                sorted.sort((a, b) =>
                    parseInt(b.Year) -
                    parseInt(a.Year)
                );

                break;
        }

        return sorted;
    }

    // ==========================================
    // RENDER MOVIES
    // ==========================================

    renderMovies(
        movies,
        container
    ) {

        if (!container) {
            return;
        }

        if (!movies || movies.length === 0) {

            container.innerHTML =
                `<div class="no-movies">
                    <h3>No movies found</h3>
                    <p>Try another search.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            movies.map(
                (movie) =>
                    this.createMovieCard(movie)
            ).join("");

        // Details buttons
        container
            .querySelectorAll(".movie-card")
            .forEach((card) => {

                card.addEventListener("click", () => {

                    const imdbID = card.dataset.id;

                    window.location.href =
                        `details.html?id=${imdbID}`;

                });

            });
    }

    // ==========================================
    // MOVIE CARD
    // ==========================================

    createMovieCard(movie) {

        const poster =
            movie.Poster &&
                movie.Poster !== "N/A"
                ? movie.Poster
                : "https://placehold.co/300x450?text=No+Poster";

        const title =
            this.escapeHTML(
                movie.Title || "Unknown"
            );

        const year =
            this.escapeHTML(
                movie.Year || "N/A"
            );

        const type =
            this.escapeHTML(
                movie.Type || "movie"
            );

        return `
            <div
                class="movie-card"
                data-id="${movie.imdbID}"
            >

                <div class="movie-poster">

                    <img
                        src="${poster}"
                        alt="${title}"
                        loading="lazy"
                        onerror="
                            this.src='https://placehold.co/300x450?text=No+Poster'
                        "
                    >

                    <div class="movie-overlay">

                        <span class="watch-btn">
                            View Details
                        </span>

                    </div>

                </div>

                <div class="movie-info">

                    <h3>
                        ${title}
                    </h3>

                    <div class="movie-meta">

                        <span>
                            ${year}
                        </span>

                        <span>
                            ${type}
                        </span>

                    </div>

                </div>

            </div>
        `;
    }

    // ==========================================
    // MOVIE DETAILS
    // ==========================================

    async showMovieDetails(
        imdbID
    ) {

        try {

            const movie =
                await this.fetchAPI({
                    i: imdbID,
                    plot: "full"
                });

            this.createMovieModal(
                movie
            );

        } catch (error) {

            console.error(
                "Movie details error:",
                error
            );
        }
    }

    // ==========================================
    // MODAL
    // ==========================================

    createMovieModal(movie) {

        const existingModal =
            document.querySelector(".movie-modal");

        if (existingModal) {
            existingModal.remove();
        }

        const poster =
            movie.Poster &&
                movie.Poster !== "N/A"
                ? movie.Poster
                : "https://placehold.co/300x450?text=No+Poster";

        const modal =
            document.createElement("div");

        modal.className = "movie-modal";

        modal.innerHTML = `
        <div class="modal-content">

            <button
                class="close-modal"
                id="close-modal"
            >
                &times;
            </button>

            <div class="modal-body">

                <div class="modal-poster">

                    <img
                        src="${poster}"
                        alt="${this.escapeHTML(movie.Title || "Movie")}"
                        onerror="this.src='https://placehold.co/300x450?text=No+Poster'"
                    >

                </div>

                <div class="modal-info">

                    <h2>
                        ${this.escapeHTML(
            movie.Title || "Unknown"
        )}
                    </h2>

                    <div class="detail-meta">

                        <span>
                            ${this.escapeHTML(
            movie.Year || "N/A"
        )}
                        </span>

                        <span>
                            ${this.escapeHTML(
            movie.Runtime || "N/A"
        )}
                        </span>

                        <span>
                            ${this.escapeHTML(
            movie.Rated || "N/A"
        )}
                        </span>

                    </div>

                    <p>
                        <strong>Genre:</strong>
                        ${this.escapeHTML(
            movie.Genre || "N/A"
        )}
                    </p>

                    <p>
                        <strong>Director:</strong>
                        ${this.escapeHTML(
            movie.Director || "N/A"
        )}
                    </p>

                    <p>
                        <strong>Actors:</strong>
                        ${this.escapeHTML(
            movie.Actors || "N/A"
        )}
                    </p>

                    <p>
                        <strong>IMDb Rating:</strong>
                        ⭐ ${this.escapeHTML(
            movie.imdbRating || "N/A"
        )}
                    </p>

                    <p>
                        <strong>Plot:</strong>
                        ${this.escapeHTML(
            movie.Plot || "No plot available."
        )}
                    </p>

                    <p>
                        <strong>Language:</strong>
                        ${this.escapeHTML(
            movie.Language || "N/A"
        )}
                    </p>

                    <p>
                        <strong>Country:</strong>
                        ${this.escapeHTML(
            movie.Country || "N/A"
        )}
                    </p>

                </div>

            </div>

        </div>
    `;

        document.body.appendChild(modal);

        const closeButton =
            modal.querySelector("#close-modal");

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                () => {
                    modal.remove();
                }
            );
        }

        modal.addEventListener(
            "click",
            (event) => {

                if (event.target === modal) {
                    modal.remove();
                }

            }
        );
    }

    // ==========================================
    // PAGINATION
    // ==========================================

    updatePagination() {

        const totalPages =
            Math.ceil(
                this.totalResults / 10
            );

        if (this.pageInfo) {

            this.pageInfo.textContent =
                `Page ${this.currentPage} of ${totalPages || 1
                }`;
        }

        if (this.prevButton) {

            this.prevButton.disabled =
                this.currentPage <= 1;
        }

        if (this.nextButton) {

            this.nextButton.disabled =
                this.currentPage >= totalPages;
        }
    }

    // ==========================================
    // LOADING
    // ==========================================

    showLoading() {

        if (this.loading) {
            this.loading.style.display =
                "block";
        }

        if (this.errorMessage) {
            this.errorMessage.style.display =
                "none";
        }
    }

    hideLoading() {

        if (this.loading) {
            this.loading.style.display =
                "none";
        }
    }

    // ==========================================
    // ERROR
    // ==========================================

    showError(message) {

        if (!this.errorMessage) {
            console.error(message);
            return;
        }

        this.errorMessage.innerHTML = `
            <div class="error-box">
                <h3>Something went wrong</h3>
                <p>
                    ${this.escapeHTML(message)}
                </p>
            </div>
        `;

        this.errorMessage.style.display =
            "block";
    }

    // ==========================================
    // REMOVE DUPLICATES
    // ==========================================

    removeDuplicates(movies) {

        const map =
            new Map();

        movies.forEach((movie) => {

            if (movie.imdbID) {

                map.set(
                    movie.imdbID,
                    movie
                );
            }
        });

        return Array.from(
            map.values()
        );
    }

    // ==========================================
    // SHUFFLE
    // ==========================================

    shuffleArray(array) {

        const newArray =
            [...array];

        for (
            let i = newArray.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );

            [
                newArray[i],
                newArray[j]
            ] = [
                    newArray[j],
                    newArray[i]
                ];
        }

        return newArray;
    }

    // ==========================================
    // ESCAPE HTML
    // ==========================================

    escapeHTML(value) {

        if (!value) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}


// ==============================================
// START APPLICATION
// ==============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        window.movieExplorer =
            new MovieExplorer();

    }
);