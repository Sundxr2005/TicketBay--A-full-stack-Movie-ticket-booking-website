CREATE DATABASE IF NOT EXISTS ticketbay;

USE ticketbay;

CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    genre VARCHAR(100)
);

INSERT INTO movies (name, genre) VALUES
('Spider-Man: No Way Home', 'Action'),
('Interstellar', 'Sci-Fi'),
('The Notebook', 'Romance');
