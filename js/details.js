const API_KEY = "8e60e4a9";
const BASE_URL = "https://www.omdbapi.com/";


// =========================================================
// URL SE MOVIE ID LENA
// =========================================================

const params = new URLSearchParams(window.location.search);

const imdbID = params.get("id");


// =========================================================
// CHECK MOVIE ID
// =========================================================

if (!imdbID) {

    document.querySelector("#movie-details").innerHTML = `
        <div class="movie-error">

            <h2>Movie not found</h2>

            <p>
                Movie ID is missing.
            </p>

        </div>
    `;

} else {

    loadMovieDetails();

}


// =========================================================
// API SE MOVIE DETAILS LENA
// =========================================================

async function loadMovieDetails() {

    try {

        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`
        );

        const movie = await response.json();

        console.log("Movie Details:", movie);


        // API error check

        if (movie.Response === "False") {

            throw new Error(
                movie.Error || "Movie not found"
            );

        }


        // Movie display

        displayMovie(movie);

    } catch (error) {

        console.error(
            "Movie details error:",
            error
        );


        document.querySelector("#movie-details").innerHTML = `
            <div class="movie-error">

                <h2>Something went wrong</h2>

                <p>
                    ${error.message}
                </p>

            </div>
        `;
    }
}


// =========================================================
// MOVIE DETAILS SCREEN PAR SHOW KARNA
// =========================================================

function displayMovie(movie) {


    // Poster check

    const poster =
        movie.Poster &&
        movie.Poster !== "N/A"
            ? movie.Poster
            : "https://placehold.co/300x450?text=No+Poster";


    document.querySelector("#movie-details").innerHTML = `

        <!-- =========================================
             POSTER
        ========================================== -->

        <div class="movie-detail-poster">

            <img
                src="${poster}"
                alt="${movie.Title || "Movie Poster"}"
                onerror="this.src='https://placehold.co/300x450?text=No+Poster'"
            >

        </div>


        <!-- =========================================
             MOVIE INFORMATION
        ========================================== -->

        <div class="movie-detail-info">

            <h1>
                ${movie.Title || "Unknown"}
            </h1>


            <!-- Movie Meta -->

            <div class="movie-detail-meta">

                <span>
                    ${movie.Year || "N/A"}
                </span>

                <span>
                    ${movie.Runtime || "N/A"}
                </span>

                <span>
                    ${movie.Rated || "N/A"}
                </span>

                <span>
                    ⭐ ${movie.imdbRating || "N/A"}
                </span>

            </div>


            <!-- Genre -->

            <p>
                <strong>Genre:</strong>
                ${movie.Genre || "N/A"}
            </p>


            <!-- Director -->

            <p>
                <strong>Director:</strong>
                ${movie.Director || "N/A"}
            </p>


            <!-- Actors -->

            <p>
                <strong>Actors:</strong>
                ${movie.Actors || "N/A"}
            </p>


            <!-- Language -->

            <p>
                <strong>Language:</strong>
                ${movie.Language || "N/A"}
            </p>


            <!-- Country -->

            <p>
                <strong>Country:</strong>
                ${movie.Country || "N/A"}
            </p>


            <!-- Plot -->

            <div class="movie-description">

                <h2>
                    Plot
                </h2>

                <p>
                    ${movie.Plot || "No plot available."}
                </p>

            </div>

        </div>

    `;
}