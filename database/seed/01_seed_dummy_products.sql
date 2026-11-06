-- Seed Data for Happy Steppy (Authentic Dummy Products matching happysteppy.pk)

-- Categories
INSERT INTO Categories (Name, Slug, Description) VALUES
('Supplements', 'supplements', 'Health supplements, multivitamins, and dietary support'),
('Sensory & Special Needs', 'sensory-special-needs', 'Autism equipment, calming toys, and fine motor skills tools'),
('Natural Foods', 'natural-foods', 'Premium Sukri Dates, Ab-e-Zam Zam, and Extra Virgin Olive Oil');

-- Brands
INSERT INTO Brands (Name, Slug) VALUES
('Kirkman', 'kirkman'),
('NOW Foods', 'now-foods'),
('Nordic Naturals', 'nordic-naturals'),
('Bioray', 'bioray'),
('Life Extension', 'life-extension'),
('Happy Steppy Sensory', 'happy-steppy-sensory'),
('Al-Madina Munawara', 'al-madina-munawara'),
('Cobram Estate', 'cobram-estate');

-- Products
INSERT INTO Products (Name, Slug, Sku, BrandId, CategoryId, Price, SalePrice, StockQuantity, ImageUrl, ShortDescription, Rating, ReviewCount, IsFeatured, IsDealOfTheDay) VALUES
('Kirkman L-Taurine 1000 mg – Hypoallergenic 100 Caps', 'kirkman-l-taurine-1000mg', 'HS-KIRK-01', 1, 1, 9500.00, 8499.00, 14, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae', 'High purity L-Taurine designed for dietary sensitivities and special nutritional needs.', 4.9, 38, 1, 1),
('Life Extension One-Per-Day Multivitamin 60 Tablets', 'life-extension-one-per-day-60tabs', 'HS-LIFE-02', 5, 1, 7800.00, 6999.00, 25, 'https://images.unsplash.com/photo-1577401239170-897942555fb3', 'Best-in-class multi-nutrient formula with high-potency vitamins and minerals.', 4.8, 52, 1, 1),
('Bioray NDF CALM 2 Fl Oz – Adrenal Support & Focus', 'bioray-ndf-calm-2oz', 'HS-BIO-03', 4, 1, 13500.00, 11999.00, 8, 'https://images.unsplash.com/photo-1608248597359-5633a598926c', 'Organic herbal formula to support adrenal function and reduce nervousness.', 5.0, 29, 1, 1),
('Nordic Naturals Omega-3 1560 mg Lemon Flavor 8 Oz Liquid', 'nordic-naturals-omega3-liquid', 'HS-NORD-04', 3, 1, 14500.00, 12800.00, 12, 'https://images.unsplash.com/photo-1550572017-edd951aa8f72', 'Pure arctic cod liver oil high in EPA & DHA for brain and nervous system support.', 4.9, 44, 1, 0),
('NOW Double Strength DHA-500 Fish Oil 90 Softgels', 'now-dha-500-90softgels', 'HS-NOW-05', 2, 1, 8900.00, 7999.00, 18, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de', 'Molecularly distilled omega-3 supporting cognitive brain function and eye wellness.', 4.7, 61, 0, 1),
('Wooden Jigsaw Puzzle Board Set – Motor Skill & Focus Toy', 'wooden-jigsaw-puzzle-board-set', 'HS-SENS-06', 6, 2, 3499.00, 2899.00, 20, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1', 'Non-toxic wooden puzzle engineered for autism sensory integration and motor skills.', 4.9, 41, 1, 1),
('2-in-1 Wooden Spelling & Letter Matching Game for Kids', '2in1-wooden-spelling-letter-game', 'HS-SENS-07', 6, 2, 2999.00, 2499.00, 16, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b', 'Preschool educational game designed to build speech development and cognitive recall.', 4.8, 33, 1, 0),
('Kids EVA Foam Puzzle Mat Set – Alphabets & Numbers', 'kids-eva-foam-puzzle-mat', 'HS-SENS-08', 6, 2, 4500.00, 3800.00, 9, 'https://images.unsplash.com/photo-1516627145497-ae6968895b74', 'Interlocking soft foam tiles for sensory playrooms and calming motor activity zones.', 4.9, 57, 0, 1),
('3D Hamburger Press Gyroball Fidget Spinner Toy', '3d-gyroball-fidget-spinner', 'HS-SENS-09', 6, 2, 1850.00, 1499.00, 30, 'https://images.unsplash.com/photo-1563245372-f21724e3856d', 'Tactile calming toy to relieve sensory overload and ADHD anxiety.', 4.7, 28, 1, 0),
('Original Sukri Khajoor Imported Makkah 1kg', 'original-sukri-khajoor-1kg', 'HS-NAT-10', 7, 3, 2800.00, 2400.00, 40, 'https://images.unsplash.com/photo-1559181567-c3190ca9959b', 'Premium soft and naturally sweet Sukri dates directly imported from Makkah.', 5.0, 76, 1, 0);

