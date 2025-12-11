CREATE TABLE IF NOT EXISTS shows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('SHOW', 'BUS', 'DOCTOR')),
    start_time TIMESTAMP NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    label VARCHAR(20) NOT NULL, -- e.g., "A1", "B2"
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PENDING', 'BOOKED')),
    user_id VARCHAR(255), -- Simple string identifier for user/session
    expires_at TIMESTAMP,
    UNIQUE(show_id, label)
);

CREATE INDEX IF NOT EXISTS idx_seats_show_id ON seats(show_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
