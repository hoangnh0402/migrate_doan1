package com.citylens.infrastructure.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/geographic")
public class GeographicController {

    private final JdbcTemplate jdbcTemplate;

    public GeographicController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/boundaries/geojson")
    public ResponseEntity<Map<String, Object>> getBoundariesGeoJson(
            @RequestParam(name = "admin_level", required = false) Integer adminLevel,
            @RequestParam(name = "parent_id", required = false) Integer parentId,
            @RequestParam(name = "simplify_tolerance", defaultValue = "0.001") double simplifyTolerance,
            @RequestParam(name = "districts_only", defaultValue = "false") boolean districtsOnly) {

        try {
            StringBuilder where = new StringBuilder("WHERE geometry IS NOT NULL");
            List<Object> params = new ArrayList<>();

            if (districtsOnly) {
                where.append(" AND admin_level = 6");
            } else if (adminLevel != null) {
                where.append(" AND admin_level = ?");
                params.add(adminLevel);
            }
            if (parentId != null) {
                where.append(" AND parent_id = ?");
                params.add(parentId);
            }

            String sql = "SELECT id, osm_id, name, name_en, admin_level, parent_id, population, tags, " +
                    "ST_AsGeoJSON(ST_Simplify(geometry, " + simplifyTolerance + ")) as geom " +
                    "FROM administrative_boundaries " + where;

            List<Map<String, Object>> features = new ArrayList<>();
            jdbcTemplate.query(sql, params.toArray(), rs -> {
                Map<String, Object> props = new LinkedHashMap<>();
                props.put("id", rs.getInt("id"));
                props.put("osm_id", rs.getLong("osm_id"));
                props.put("name", rs.getString("name"));
                props.put("name_en", rs.getString("name_en"));
                props.put("admin_level", rs.getInt("admin_level"));
                props.put("parent_id", rs.getObject("parent_id"));
                props.put("population", rs.getObject("population"));

                Map<String, Object> feature = new LinkedHashMap<>();
                feature.put("type", "Feature");
                feature.put("id", rs.getInt("id"));
                feature.put("geometry", parseJson(rs.getString("geom")));
                feature.put("properties", props);
                features.add(feature);
            });

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("type", "FeatureCollection");
            response.put("features", features);
            response.put("metadata", Map.of("count", features.size(), "simplify_tolerance", simplifyTolerance));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/boundaries/hanoi-union")
    public ResponseEntity<Object> getHanoiUnionBoundary(
            @RequestParam(name = "simplify_tolerance", defaultValue = "0.0005") double simplifyTolerance) {
        try {
            String sql = """
                WITH hanoi_wards AS (SELECT geometry FROM administrative_boundaries WHERE admin_level = 6 AND geometry IS NOT NULL),
                hanoi_city AS (SELECT geometry FROM administrative_boundaries WHERE admin_level = 4 AND geometry IS NOT NULL LIMIT 1),
                union_geom AS (
                    SELECT CASE WHEN (SELECT COUNT(*) FROM hanoi_wards) > 0 THEN (SELECT ST_Union(geometry) FROM hanoi_wards)
                    ELSE (SELECT geometry FROM hanoi_city) END as geom)
                SELECT ST_AsGeoJSON(ST_Simplify(geom, ?)) as geojson,
                       ST_Area(geom::geography)/1000000 as area_km2,
                       ST_NPoints(geom) as num_points,
                       COALESCE((SELECT COUNT(*) FROM hanoi_wards),1) as num_wards
                FROM union_geom
                """;

            return jdbcTemplate.query(sql, new Object[]{simplifyTolerance}, rs -> {
                if (rs.next()) {
                    Map<String, Object> feature = new LinkedHashMap<>();
                    feature.put("type", "Feature");
                    feature.put("id", "hanoi-union");
                    feature.put("geometry", parseJson(rs.getString("geojson")));
                    feature.put("properties", Map.of(
                            "name", "Thành phố Hà Nội",
                            "name_en", "Hanoi City",
                            "area_km2", rs.getDouble("area_km2"),
                            "num_points", rs.getInt("num_points"),
                            "num_wards", rs.getInt("num_wards")
                    ));
                    return ResponseEntity.ok((Object) feature);
                }
                return ResponseEntity.notFound().build();
            });
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/boundaries")
    public ResponseEntity<Map<String, Object>> getBoundaries(
            @RequestParam(name = "admin_level", required = false) Integer adminLevel,
            @RequestParam(name = "parent_id", required = false) Integer parentId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "100") int limit) {
        try {
            StringBuilder where = new StringBuilder("WHERE 1=1");
            List<Object> params = new ArrayList<>();

            if (adminLevel != null) { where.append(" AND admin_level = ?"); params.add(adminLevel); }
            if (parentId != null) { where.append(" AND parent_id = ?"); params.add(parentId); }
            if (search != null) { where.append(" AND (name ILIKE ? OR name_en ILIKE ?)"); params.add("%" + search + "%"); params.add("%" + search + "%"); }

            String sql = "SELECT id, osm_id, name, name_en, admin_level, parent_id, population FROM administrative_boundaries " + where + " OFFSET ? LIMIT ?";
            params.add(skip); params.add(limit);

            List<Map<String, Object>> items = jdbcTemplate.queryForList(sql, params.toArray());
            long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM administrative_boundaries", Long.class);

            return ResponseEntity.ok(Map.of("total", total, "skip", skip, "limit", limit, "items", items));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("total", 0, "skip", skip, "limit", limit, "items", Collections.emptyList()));
        }
    }

    @GetMapping("/boundaries/{boundaryId}")
    public ResponseEntity<Object> getBoundaryById(@PathVariable int boundaryId,
            @RequestParam(name = "include_geometry", defaultValue = "false") boolean includeGeometry) {
        try {
            String sql = includeGeometry ?
                    "SELECT id, osm_id, name, name_en, admin_level, parent_id, population, tags, ST_AsGeoJSON(geometry) as geojson FROM administrative_boundaries WHERE id = ?" :
                    "SELECT id, osm_id, name, name_en, admin_level, parent_id, population, tags FROM administrative_boundaries WHERE id = ?";
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, boundaryId);
            if (rows.isEmpty()) return ResponseEntity.notFound().build();
            Map<String, Object> row = rows.get(0);
            if (includeGeometry && row.containsKey("geojson")) {
                row.put("geometry", parseJson((String) row.get("geojson")));
                row.remove("geojson");
            }
            return ResponseEntity.ok(row);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/boundaries/{boundaryId}/details")
    public ResponseEntity<Object> getBoundaryDetails(@PathVariable int boundaryId,
            @RequestParam(name = "include_geometry", defaultValue = "true") boolean includeGeometry,
            @RequestParam(name = "simplify_tolerance", defaultValue = "0.0005") double simplifyTolerance) {
        try {
            String sqlBasic = "SELECT id, osm_id, name, name_en, admin_level, parent_id, population, tags, " +
                    "ROUND((ST_Area(geometry::geography)/1000000)::numeric, 2) as area_km2, " +
                    "ST_AsGeoJSON(ST_Simplify(geometry, ?)) as geojson, " +
                    "ST_X(ST_Centroid(geometry)) as center_lng, ST_Y(ST_Centroid(geometry)) as center_lat " +
                    "FROM administrative_boundaries WHERE id = ? AND geometry IS NOT NULL";

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sqlBasic, simplifyTolerance, boundaryId);
            if (rows.isEmpty()) return ResponseEntity.notFound().build();

            Map<String, Object> row = rows.get(0);
            Map<String, Object> boundary = new LinkedHashMap<>(row);
            if (includeGeometry && boundary.containsKey("geojson")) {
                boundary.put("geometry", parseJson((String) boundary.get("geojson")));
            }
            boundary.remove("geojson");
            boundary.put("center", Map.of("lat", row.get("center_lat"), "lng", row.get("center_lng")));
            boundary.remove("center_lat"); boundary.remove("center_lng");

            return ResponseEntity.ok(Map.of("boundary", boundary, "statistics", Map.of()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/boundaries/list/simple")
    public ResponseEntity<Map<String, Object>> getBoundariesListSimple(
            @RequestParam(name = "admin_level", defaultValue = "6") int adminLevel) {
        try {
            String sql = "SELECT id, name, name_en, ROUND((ST_Area(geometry::geography)/1000000)::numeric, 2) as area_km2 " +
                    "FROM administrative_boundaries WHERE admin_level = ? AND geometry IS NOT NULL ORDER BY name";
            List<Map<String, Object>> items = jdbcTemplate.queryForList(sql, adminLevel);
            return ResponseEntity.ok(Map.of("total", items.size(), "items", items));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("total", 0, "items", Collections.emptyList()));
        }
    }

    @GetMapping("/boundaries/containing-point")
    public ResponseEntity<Map<String, Object>> getBoundaryContainingPoint(
            @RequestParam double latitude, @RequestParam double longitude,
            @RequestParam(name = "admin_level", required = false) Integer adminLevel) {
        try {
            StringBuilder sql = new StringBuilder("SELECT id, name, name_en, admin_level, parent_id FROM administrative_boundaries WHERE ST_Contains(geometry, ST_SetSRID(ST_Point(?, ?), 4326))");
            List<Object> params = new ArrayList<>(List.of(longitude, latitude));
            if (adminLevel != null) { sql.append(" AND admin_level = ?"); params.add(adminLevel); }

            List<Map<String, Object>> boundaries = jdbcTemplate.queryForList(sql.toString(), params.toArray());
            return ResponseEntity.ok(Map.of("point", Map.of("latitude", latitude, "longitude", longitude), "boundaries", boundaries));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("point", Map.of("latitude", latitude, "longitude", longitude), "boundaries", Collections.emptyList()));
        }
    }

    @SuppressWarnings("unchecked")
    private Object parseJson(String json) {
        if (json == null) return null;
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Map.class);
        } catch (Exception e) { return json; }
    }
}
