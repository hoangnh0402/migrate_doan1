package com.hqcsystem.infrastructure.adapter.in.web;

import com.hqcsystem.infrastructure.persistence.entity.EntityDbEntry;
import com.hqcsystem.infrastructure.persistence.repository.EntityDbRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/ngsi-ld/v1")
public class NgsildController {

    private final EntityDbRepository entityDbRepository;
    private final ObjectMapper objectMapper;

    public NgsildController(EntityDbRepository entityDbRepository) {
        this.entityDbRepository = entityDbRepository;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping("/entities")
    public ResponseEntity<Object> createEntity(@RequestBody Map<String, Object> entity) {
        String id = (String) entity.get("id");
        String type = (String) entity.get("type");

        if (id == null || type == null) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Entity must have 'id' and 'type' fields"));
        }

        if (entityDbRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("detail", "Entity " + id + " already exists"));
        }

        EntityDbEntry entry = new EntityDbEntry();
        entry.setId(id);
        entry.setType(type);
        try { entry.setData(objectMapper.writeValueAsString(entity)); } catch (Exception e) { entry.setData("{}"); }
        entry.setCreatedAt(LocalDateTime.now());

        entityDbRepository.save(entry);
        return ResponseEntity.status(HttpStatus.CREATED).body(entity);
    }

    @GetMapping("/entities")
    public ResponseEntity<List<Object>> queryEntities(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {

        List<EntityDbEntry> entities;
        if (type != null) {
            entities = entityDbRepository.findByType(type);
        } else {
            entities = entityDbRepository.findAll();
        }

        List<Object> result = new ArrayList<>();
        int end = Math.min(offset + limit, entities.size());
        for (int i = offset; i < end; i++) {
            result.add(parseJsonb(entities.get(i).getData()));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/entities/{entityId}")
    public ResponseEntity<Object> getEntity(@PathVariable String entityId) {
        return entityDbRepository.findById(entityId)
                .map(e -> ResponseEntity.ok((Object) parseJsonb(e.getData())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/entities/{entityId}/attrs")
    public ResponseEntity<Object> updateEntityAttributes(@PathVariable String entityId, @RequestBody Map<String, Object> attributes) {
        Optional<EntityDbEntry> opt = entityDbRepository.findById(entityId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        EntityDbEntry entry = opt.get();
        Map<String, Object> data = parseJsonb(entry.getData());
        data.putAll(attributes);
        try { entry.setData(objectMapper.writeValueAsString(data)); } catch (Exception e) { /* ignore */ }
        entry.setModifiedAt(LocalDateTime.now());
        entityDbRepository.save(entry);

        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @DeleteMapping("/entities/{entityId}")
    public ResponseEntity<Void> deleteEntity(@PathVariable String entityId) {
        if (!entityDbRepository.existsById(entityId)) {
            return ResponseEntity.notFound().build();
        }
        entityDbRepository.deleteById(entityId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getEntityTypes() {
        List<Object[]> counts = entityDbRepository.countGroupByType();
        List<Map<String, Object>> types = new ArrayList<>();
        for (Object[] row : counts) {
            types.add(Map.of("type", row[0], "count", row[1]));
        }
        return ResponseEntity.ok(Map.of("types", types));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonb(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) { return Collections.emptyMap(); }
    }
}

