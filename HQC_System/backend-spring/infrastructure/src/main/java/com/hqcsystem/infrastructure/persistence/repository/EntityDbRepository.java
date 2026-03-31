package com.hqcsystem.infrastructure.persistence.repository;

import com.hqcsystem.infrastructure.persistence.entity.EntityDbEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EntityDbRepository extends JpaRepository<EntityDbEntry, String> {
    List<EntityDbEntry> findByType(String type);
    long countByType(String type);

    Optional<EntityDbEntry> findFirstByTypeOrderByModifiedAtDesc(String type);
    Optional<EntityDbEntry> findFirstByTypeOrderByCreatedAtDesc(String type);

    long countByTypeAndModifiedAtAfter(String type, LocalDateTime after);

    @Query("SELECT e.type, COUNT(e) FROM EntityDbEntry e GROUP BY e.type")
    List<Object[]> countGroupByType();
}

