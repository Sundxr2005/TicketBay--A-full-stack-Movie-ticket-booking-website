const params = new URLSearchParams(window.location.search);
const movieId = params.get('movieId');
console.log('Movie ID:', movieId); 

if (!movieId) {
    alert('Movie ID not found!');
    window.location.href = '/'; // Redirect to home if movieId is not in the URL
}

const userId = 1; // Assuming the user is logged in with ID = 1
const seatsContainer = document.getElementById('seats-container');

// Fetch movie details (name, poster, genre, description, and cast) for the movieId
async function fetchMovieDetails() {
    try {
        const response = await fetch(`/movie/${movieId}`);
        
        if (!response.ok) {
            throw new Error('Movie not found');
        }

        const movie = await response.json();
        
        // Log movie details to see if the posterUrl is present
        console.log('Fetched Movie:', movie);
        
        if (!movie.name || !movie.posterUrl || !movie.genre || !movie.description || !movie.cast) {
            throw new Error('Invalid movie details');
        }

        // Update the movie info section
        const movieNameElement = document.getElementById('movie-name');
        const moviePosterElement = document.getElementById('movie-poster');
        const movieLanguageElement = document.getElementById('movie-language');
        const movieGenreElement = document.getElementById('movie-genre');
        const movieDescriptionElement = document.getElementById('movie-description');
        const movieCastElement = document.getElementById('movie-cast');

        movieNameElement.textContent = movie.name;
        movieLanguageElement.textContent = `${movie.language}`;
        movieGenreElement.textContent = `Genre: ${movie.genre}`;
        movieDescriptionElement.textContent = `About the movie: ${movie.description}`;
        movieCastElement.textContent = `Cast: ${movie.cast}`;

        // Log the poster URL
        console.log('Movie Poster URL:', movie.posterUrl);

        // Check if the poster URL is valid
        if (movie.posterUrl && moviePosterElement) {
            moviePosterElement.src = movie.posterUrl; // Set the movie poster
            moviePosterElement.alt = movie.name; // Set the alt text for the image
        } else {
            console.error('Poster URL is missing or invalid');
        }

    } catch (error) {
        console.error('Error fetching movie details:', error);
        alert('Failed to load movie details.');
    }
}

// Fetch seats data
async function fetchSeats() {
    try {
        const response = await fetch(`/seats/${movieId}`);
        const seats = await response.json();

        seatsContainer.innerHTML = ''; // Clear the container before re-rendering

        // Loop through the seats and create the layout
        let rowCounter = 0;  // Track rows
        seats.forEach((seat, index) => {
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat', seat.isBooked ? 'booked' : 'available');
            seatDiv.textContent = seat.seatNumber;
            seatDiv.dataset.seatNumber = seat.seatNumber;

            // Only add a click event for available seats
            if (!seat.isBooked) {
                seatDiv.addEventListener('click', () => toggleSeatSelection(seatDiv));
            }

            seatsContainer.appendChild(seatDiv);

            // Every 20th seat, add a break (aisle) after it
            if ((index + 1) % 20 === 0) {
                const aisleDiv = document.createElement('div');
                aisleDiv.classList.add('aisle');
                seatsContainer.appendChild(aisleDiv);
            }
        });
    } catch (error) {
        console.error('Error fetching seats:', error);
        alert('Failed to load seat data.');
    }
}

function toggleSeatSelection(seatDiv) {
    // If the seat is already selected, deselect it
    if (seatDiv.classList.contains('selected')) {
        seatDiv.classList.remove('selected');
    } 
    // If it's not selected and less than 5 seats are selected, select it
    else if (document.querySelectorAll('.seat.selected').length < 5) {
        seatDiv.classList.add('selected');
    } 
    // Show an alert if more than 5 seats are selected
    else {
        alert('You can select a maximum of 5 seats.');
    }
}

document.getElementById('book-seats-btn').addEventListener('click', async () => {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    const seatNumbers = Array.from(selectedSeats).map(seat => seat.dataset.seatNumber);

    if (seatNumbers.length > 0) {
        console.log('Sending the following data to the server:', { movieId, userId, seats: seatNumbers }); // Log the data

        try {
            const response = await fetch('/book-seats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ movieId, userId, seats: seatNumbers }),
            });

            if (response.ok) {
                alert('Seats booked successfully!');
                window.location.href = '/';
            } else {
                alert('Error booking seats');
            }
        } catch (error) {
            console.error('Error booking seats:', error);
            alert('Error booking seats');
        }
    } else {
        alert('Please select seats to book');
    }
});

// Fetch movie details when the page loads
fetchMovieDetails();

// Fetch seats data
fetchSeats();
