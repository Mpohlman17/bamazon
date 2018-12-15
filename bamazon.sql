DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
	item_id AUTO_INCREMENT NOT NULL,
	product_name TEXT NOT NULL,
	department_name TEXT NOT NULL,
	price DECIMAL(2) NOT NULL,
	inventory_quantity INT NOT NULL,
	PRIMARY KEY (item_id)
);
INSERT INTO products (product_name, department_name, price, inventory_quantity)
VALUES ('Red Bull', 'Grocery', 2.99, 750),
('Balance Protine Bars 12 pack', 'Grocery', 10.99, 106),
('Red Rocket Dog Collar', 'Pet Supplies', 11.99, 150),
('iPad Pro', 'Electronics', 609.99, 221),
('Samsung 70in 4k LED TV', 'Electronics', 799.99, 100),
('Mountain Bike', 'Sports & Outdoors', 435.99, 30),
('Warrior Lacrosse Stick', 'Sports & Outdoors', 99.99, 50),
('Bounty Paper Towels 36 pack', 'Bamazon Basics', 24.99, 400),
('Stainless Steal 36 peice set', 'Bamazon Necessities', 37.99, 225),
('Executive Office Chair', 'Office Products', 209.99, 21);
