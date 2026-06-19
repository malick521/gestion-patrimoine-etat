package mr.patrimoine.gestion.repository;

import mr.patrimoine.gestion.model.entity.AffectationEntity;
import mr.patrimoine.gestion.model.enums.StatutAffectation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AffectationRepository extends MongoRepository<AffectationEntity, String> {

    List<AffectationEntity> findByBienId(String bienId);
    List<AffectationEntity> findByMinistereId(String ministereId);
    List<AffectationEntity> findByUserId(String userId);
    List<AffectationEntity> findByStatut(StatutAffectation statut);
    List<AffectationEntity> findByCreePar(String userId);

    boolean existsByBienIdAndStatut(String bienId, StatutAffectation statut);

    Optional<AffectationEntity> findByBienIdAndStatut(String bienId, StatutAffectation statut);
}