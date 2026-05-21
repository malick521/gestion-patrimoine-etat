package mr.patrimoine.gestion.repository;

import mr.patrimoine.gestion.model.entity.MinistereEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MinistereRepository extends MongoRepository<MinistereEntity, String> {

    Optional<MinistereEntity> findByCode(String code);
    boolean existsByCode(String code);
    List<MinistereEntity> findByNomContainingIgnoreCase(String nom);
    List<MinistereEntity> findByCodeContainingIgnoreCase(String code);
    List<MinistereEntity> findByResponsable(String responsable);
    List<MinistereEntity> findByActif(boolean actif);
}