package mr.patrimoine.gestion.repository;

import mr.patrimoine.gestion.model.entity.MouvementEntity;
import mr.patrimoine.gestion.model.enums.TypeMouvement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MouvementRepository extends MongoRepository<MouvementEntity, String> {

    List<MouvementEntity> findByBienId(String bienId);
    List<MouvementEntity> findByType(TypeMouvement type);
    List<MouvementEntity> findByCreePar(String userId);
    List<MouvementEntity> findByMinistereSourceId(String ministereId);
    List<MouvementEntity> findByMinistereDestinationId(String ministereId);
    boolean existsByBienIdAndType(String bienId, TypeMouvement type);
}