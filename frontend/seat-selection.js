const params = new URLSearchParams(window.location.search);
const movieId = params.get('movieId');
console.log('Movie ID:', movieId);

if (!movieId) {
    alert('Movie ID not found!');
    window.location.href = '/'; // Redirect to home if movieId is not in the URL
}

const userId = 1; // Assuming the user is logged in with ID = 1
const seatsContainer = document.getElementById('seats-container');
const showtimesContainer = document.getElementById('showtimes-container'); // For showtime buttons

// Fetch movie details
async function fetchMovieDetails() {
    try {
        const response = await fetch(`/movie/${movieId}`);
        if (!response.ok) throw new Error('Movie not found');

        const movie = await response.json();
        console.log('Fetched Movie:', movie);

        // Populate movie details
        document.getElementById('movie-name').textContent = movie.name;
        document.getElementById('movie-language').textContent = movie.language;
        document.getElementById('movie-genre').textContent = `Genre: ${movie.genre}`;
        document.getElementById('movie-description').textContent = `About the movie: ${movie.description}`;
        document.getElementById('movie-cast').textContent = `Cast: ${movie.cast}`;
        document.getElementById('movie-poster').src = movie.posterUrl || '';
        document.getElementById('movie-poster').alt = movie.name;

        // Fetch available showtimes
        fetchShowtimes(movieId);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        alert('Failed to load movie details.');
    }
}

// Fetch showtimes and create buttons
async function fetchShowtimes(movieId) {
    console.log('Fetching showtimes for movieId:', movieId); // Debug movieId
    try {
        const response = await fetch(`/showtimes/${movieId}`);
        if (!response.ok) throw new Error('Showtimes not found');

        const showtimes = await response.json();
        console.log('Fetched Showtimes:', showtimes);

        // Create a button for each showtime
        showtimesContainer.innerHTML = '';
        showtimes.forEach(showtime => {
            const button = document.createElement('button');
            button.classList.add('showtime-btn');
            button.textContent = `${showtime.show_time}`;
            button.dataset.showtimeId = showtime.id;
            console.log('Button Data:', button.dataset.showtimeId); // Debug button dataset

            // Add click event to fetch seats and set active state
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                document.querySelectorAll('.showtime-btn').forEach(btn => btn.classList.remove('selected'));

                // Set clicked button as selected
                button.classList.add('selected');

                // Fetch seats for the selected showtime
                fetchSeats(showtime.id);
            });

            showtimesContainer.appendChild(button);
        });

        // Automatically fetch seats for the first showtime and mark it as selected
        if (showtimes.length > 0) {
            const firstShowtimeButton = showtimesContainer.querySelector('.showtime-btn');
            firstShowtimeButton.classList.add('selected');
            fetchSeats(showtimes[0].id);
        }
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        alert('Failed to load showtimes.');
    }
}

// Fetch seat layout for a showtime
async function fetchSeats(showtimeId) {
    try {
        const response = await fetch(`/seats/${movieId}/${showtimeId}`);
        if (!response.ok) throw new Error('Seats not found');

        const seats = await response.json();
        console.log('Fetched Seats:', seats);

        // Populate seats container
        seatsContainer.innerHTML = '';
        seats.forEach((seat, index) => {
            const seatDiv = document.createElement('div');
            seatDiv.classList.add('seat', seat.isBooked ? 'booked' : 'available');
            seatDiv.textContent = seat.seatNumber;

            if (!seat.isBooked) {
                seatDiv.addEventListener('click', () => toggleSeatSelection(seatDiv));
            }

            seatsContainer.appendChild(seatDiv);

            // Add aisle after every 20th seat
            if ((index + 1) % 20 === 0) {
                const aisleDiv = document.createElement('div');
                aisleDiv.classList.add('aisle');
                seatsContainer.appendChild(aisleDiv);
            }
        });
    } catch (error) {
        console.error('Error fetching seats:', error);
        alert('Failed to load seats.');
    }
}
function toggleFloatingButton() {
    const selectedSeats = document.querySelectorAll('.seat.selected').length;
    const bookButton = document.getElementById('book-seats-btn');
    if (selectedSeats > 0) {
        bookButton.classList.add('show');
    } else {
        bookButton.classList.remove('show');
    }
}

// Update seat selection logic to call toggleFloatingButton
function toggleSeatSelection(seatDiv) {
    if (seatDiv.classList.contains('selected')) {
        seatDiv.classList.remove('selected');
    } else if (document.querySelectorAll('.seat.selected').length < 5) {
        seatDiv.classList.add('selected');
    } else {
        alert('You can select up to 5 seats only.');
    }
    toggleFloatingButton(); // Update button visibility
}
// Handle seat booking
document.getElementById('book-seats-btn').addEventListener('click', async () => {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    const seatNumbers = Array.from(selectedSeats).map(seat => seat.textContent);
    const selectedShowtimeId = document.querySelector('.showtime-btn.selected')?.dataset.showtimeId;

    if (!selectedShowtimeId) {
        alert('Please select a showtime.');
        return;
    }

    if (seatNumbers.length === 0) {
        alert('Please select at least one seat.');
        return;
    }

    try {
        const response = await fetch('/book-seats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieId, userId, seats: seatNumbers, showtimeId: selectedShowtimeId }),
        });

        if (response.ok) {
            alert('Seats booked successfully!');
            // Refresh seats for the selected showtime
            fetchSeats(selectedShowtimeId);
        } else {
            const errorMessage = await response.text();
            alert(`Failed to book seats: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error booking seats:', error);
        alert('Error booking seats.');
    }
});

// Fetch movie details on page load
fetchMovieDetails();
