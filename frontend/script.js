let selectedMovieId = null;

async function fetchMovies() {
    try {
        const response = await fetch('/movies');
        const movies = await response.json();
        const movieContainer = document.querySelector('.movies');
        movieContainer.innerHTML = '';

        movies.forEach(movie => {
            const movieDiv = document.createElement('div');
            movieDiv.classList.add('movie-card');
            movieDiv.innerHTML = `
    <img src="${movie.posterUrl}" alt="${movie.name}" />
    <h3>${movie.name}</h3>
    <p>Genre: ${movie.genre}</p>
    <button onclick="openBookingModal(${movie.id})">Book Ticket</button>
`;

            movieContainer.appendChild(movieDiv);
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function openBookingModal(movieId) {
    selectedMovieId = movieId;
    window.location.href = `/seat-selection.html?movieId=${movieId}`;
}

fetchMovies();
