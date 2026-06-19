package mr.patrimoine.gestion.repository;

import mr.patrimoine.gestion.model.entity.BienEntity;
import mr.patrimoine.gestion.model.enums.EtatBien;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BienRepository extends MongoRepository<BienEntity, String> {

    Optional<BienEntity> findByCode(String code);
    boolean existsByCode(String code);
    List<BienEntity> findByMinistereId(String ministereId);
    List<BienEntity> findByCategorieId(String categorieId);
    List<BienEntity> findByEtat(EtatBien etat);
    List<BienEntity> findByMinistereIdAndEtat(String ministereId, EtatBien etat);
    List<BienEntity> findByDesignationContainingIgnoreCase(String keyword);

    @Query("{ 'cout': { $gte: ?0, $lte: ?1 } }")
    List<BienEntity> findByValeurAcquisitionBetween(Double min, Double max);
}