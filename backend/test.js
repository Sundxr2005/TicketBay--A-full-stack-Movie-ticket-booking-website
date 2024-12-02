const db = require('./models/db');

(async () => {
    try {
        const [rows] = await db.query('SELECT * FROM movies');
        console.log(rows);
    } catch (err) {
        console.error('Database connection error:', err);
    }
})();
