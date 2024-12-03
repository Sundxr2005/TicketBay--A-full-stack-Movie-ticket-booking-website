const express = require('express');
const path = require('path');
const db = require('./models/db');
const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fetch movies with their names and posters
app.get('/movies', async (req, res) => {
    try {
        const [movies] = await db.query('SELECT * FROM movies');
        
        // Construct response with movie names and posters
        const movieDetails = movies.map(movie => ({
            id: movie.id,
            name: movie.name,
            genre: movie.genre,
            posterUrl: movie.poster_url // Send movie poster URL
        }));
        
        res.json(movieDetails);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Error fetching movies');
    }
});

// Fetch a specific movie by its ID
app.get('/movie/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [movie] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
        if (movie.length === 0) {
            return res.status(404).send('Movie not found');
        }

        const movieDetails = {
            id: movie[0].id,
            name: movie[0].name,
            language: movie[0].language,
            genre: movie[0].genre,
            posterUrl: movie[0].poster_url, // Send movie poster URL
            description: movie[0].description, // Send movie description
            cast: movie[0].cast // Send movie cast
        };

        res.json(movieDetails);
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).send('Error fetching movie');
    }
});

// Add a movie with name, genre, and poster URL
app.post('/add-movie', async (req, res) => {
    const { name, genre, poster_url } = req.body;
    try {
        const result = await db.query('INSERT INTO movies (name, genre, poster_url) VALUES (?, ?, ?)', [name, genre, poster_url]);
        const movieId = result.insertId;

        // Add 300 seats for the new movie
        const totalSeats = 300;
        for (let i = 1; i <= totalSeats; i++) {
            await db.query('INSERT INTO seats (movie_id, seat_number, is_booked) VALUES (?, ?, 0)', [movieId, i]);
        }

        res.send('Movie and seats added successfully!');
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).send('Error adding movie');
    }
});

// Book ticket
app.post('/book-ticket', async (req, res) => {
    const { movieId, userId, tickets } = req.body;
    try {
        await db.query('INSERT INTO bookings (movie_id, user_id, tickets) VALUES (?, ?, ?)', [movieId, userId, tickets]);
        res.send('Ticket booked successfully!');
    } catch (error) {
        console.error('Error booking ticket:', error);
        res.status(500).send('Error booking ticket');
    }
});

// Fetch seat status for a movie (available or booked) for a specific showtime
app.get('/seats/:movieId/:showtimeId', async (req, res) => {
    const { movieId, showtimeId } = req.params;
    try {
        const seats = [];
        const totalSeats = 300; // Assuming 300 seats for the movie

        // Fetch the seat booking status for the given movie and showtime
        for (let i = 1; i <= totalSeats; i++) {
            const [rows] = await db.query('SELECT * FROM bookings WHERE movie_id = ? AND showtime_id = ? AND seat_number = ?', [movieId, showtimeId, i]);
            seats.push({ seatNumber: i, isBooked: rows.length > 0 });
        }

        // Send seats data as JSON response
        res.json(seats);
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ error: 'Error fetching seats' });
    }
});

// Book selected seats for a user
app.post('/book-seats', async (req, res) => {
    const { movieId, seats, userId, showtimeId } = req.body;

    if (!showtimeId) {
        return res.status(400).send('Showtime ID is required.');
    }

    try {
        const unavailableSeats = [];
        for (const seat of seats) {
            const [rows] = await db.query('SELECT * FROM bookings WHERE movie_id = ? AND showtime_id = ? AND seat_number = ?', [movieId, showtimeId, seat]);
            if (rows.length > 0) {
                unavailableSeats.push(seat);
            }
        }

        if (unavailableSeats.length > 0) {
            return res.status(400).send(`The following seats are already booked: ${unavailableSeats.join(', ')}`);
        }

        for (const seat of seats) {
            await db.query('INSERT INTO bookings (movie_id, user_id, seat_number, showtime_id) VALUES (?, ?, ?, ?)', [movieId, userId, seat, showtimeId]);
        }

        res.send('Seats booked successfully!');
    } catch (error) {
        console.error('Error booking seats:', error);
        res.status(500).send('Error booking seats');
    }
});


// Fetch showtimes for a specific movie
app.get('/showtimes/:movieId', async (req, res) => {
    const { movieId } = req.params;
    try {
        const [showtimes] = await db.query('SELECT * FROM showtimes WHERE movie_id = ?', [movieId]);
        if (!showtimes || showtimes.length === 0) {
            return res.status(404).json({ error: 'No showtimes found for this movie.' });
        }
        res.json(showtimes);
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        res.status(500).send('Error fetching showtimes');
    }
});


// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
