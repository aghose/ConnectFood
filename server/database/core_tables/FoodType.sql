/*  A domain table that holds all possible hard-coded short hand food type descriptions.
 *  Should be used to populate some form item such as a combobox for selection.
 *  We may be able to get data from an online database for this in the future...
 */
CREATE TABLE IF NOT EXISTS FoodType
(
    foodTypeKey SERIAL PRIMARY KEY
);

ALTER TABLE FoodType ADD COLUMN IF NOT EXISTS foodTypeDescription VARCHAR(60) NOT NULL;

-- We can add all our FoodType entries here.
