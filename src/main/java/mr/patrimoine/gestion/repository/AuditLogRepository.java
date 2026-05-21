package mr.patrimoine.gestion.repository;

import mr.patrimoine.gestion.model.entity.AuditLogEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLogEntity, String> {

    List<AuditLogEntity> findByUserId(String userId);
    List<AuditLogEntity> findByEntiteId(String entiteId);
    List<AuditLogEntity> findByAction(String action);
    List<AuditLogEntity> findByEntite(String entite);
    List<AuditLogEntity> findByUserIdAndEntite(String userId, String entite);

    @Query("{ 'dateAction': { $gte: ?0, $lte: ?1 } }")
    List<AuditLogEntity> findByDateActionBetween(LocalDateTime debut, LocalDateTime fin);
}