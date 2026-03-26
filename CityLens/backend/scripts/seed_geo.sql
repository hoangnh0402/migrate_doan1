INSERT INTO streets (name, highway_type, geometry) VALUES ('Đường Giải Phóng', 'primary', ST_GeomFromText('LINESTRING(105.84 21.00, 105.85 21.01)', 4326)) ON CONFLICT DO NOTHING;
INSERT INTO buildings (name, building_type, geometry) VALUES ('Tòa nhà CityLens', 'office', ST_GeomFromText('POLYGON((105.81 21.03, 105.82 21.03, 105.82 21.04, 105.81 21.04, 105.81 21.03))', 4326)) ON CONFLICT DO NOTHING;
INSERT INTO pois (name, category, location) VALUES ('Hồ Hoàn Kiếm', 'tourism', ST_GeomFromText('POINT(105.85 21.02)', 4326)) ON CONFLICT DO NOTHING;
INSERT INTO administrative_boundaries (name, admin_level, geometry) VALUES ('Quận Hoàn Kiếm', 7, ST_GeomFromText('POLYGON((105.84 21.02, 105.86 21.02, 105.86 21.04, 105.84 21.04, 105.84 21.02))', 4326)) ON CONFLICT DO NOTHING;
