-- Create superannuation contributions table
CREATE TABLE superannuation_contributions (
    id SERIAL PRIMARY KEY,
    contribution_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) NOT NULL
);

-- Optional: Add an index on contribution_date for faster queries
CREATE INDEX idx_superannuation_contribution_date ON superannuation_contributions(contribution_date);

-- Optional: Add a check constraint to ensure amount is positive
ALTER TABLE superannuation_contributions ADD CONSTRAINT chk_positive_amount CHECK (amount > 0);

-- Optional: Add a check constraint to ensure balance is non-negative
ALTER TABLE superannuation_contributions ADD CONSTRAINT chk_non_negative_balance CHECK (current_balance >= 0);