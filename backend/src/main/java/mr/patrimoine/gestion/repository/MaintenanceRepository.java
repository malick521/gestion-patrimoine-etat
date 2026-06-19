package mr.patrimoine.gestion.repository;

import mr.patrimoine.gestion.model.entity.MaintenanceEntity;
import mr.patrimoine.gestion.model.enums.StatutMaintenance;
import mr.patrimoine.gestion.model.enums.TypeMaintenance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceRepository extends MongoRepository<MaintenanceEntity, String> {

    List<MaintenanceEntity> findByBienId(String bienId);
    List<MaintenanceEntity> findByType(TypeMaintenance type);
    List<MaintenanceEntity> findByStatut(StatutMaintenance statut);
    List<MaintenanceEntity> findByBienIdAndStatut(String bienId,StatutMaintenance statut);
    List<MaintenanceEntity> findByCreePar(String userId);
    boolean existsByBienIdAndStatut(String bienId,StatutMaintenance statut);

    @Query("{ 'cout': { $gte: ?0, $lte: ?1 } }")
    List<MaintenanceEntity> findByCoutBetween(Double min, Double max);
}