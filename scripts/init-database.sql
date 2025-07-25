-- Create tables for cyclocross rankings app

-- Series table
CREATE TABLE IF NOT EXISTS series (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  season VARCHAR(10) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  club VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contests table
CREATE TABLE IF NOT EXISTS contests (
  id SERIAL PRIMARY KEY,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age_group VARCHAR(50),
  gender VARCHAR(10),
  participation_points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Races table
CREATE TABLE IF NOT EXISTS races (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  start_time TIME,
  duration_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cyclists table
CREATE TABLE IF NOT EXISTS cyclists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  club VARCHAR(255),
  license_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cyclist Contest relationship table
CREATE TABLE IF NOT EXISTS cyclist_contests (
  id SERIAL PRIMARY KEY,
  cyclist_id INTEGER REFERENCES cyclists(id) ON DELETE CASCADE,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  bib_number INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(contest_id, bib_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_series_id ON events(series_id);
CREATE INDEX IF NOT EXISTS idx_contests_series_id ON contests(series_id);
CREATE INDEX IF NOT EXISTS idx_races_event_id ON races(event_id);
CREATE INDEX IF NOT EXISTS idx_races_contest_id ON races(contest_id);
CREATE INDEX IF NOT EXISTS idx_cyclist_contests_cyclist_id ON cyclist_contests(cyclist_id);
CREATE INDEX IF NOT EXISTS idx_cyclist_contests_contest_id ON cyclist_contests(contest_id);
