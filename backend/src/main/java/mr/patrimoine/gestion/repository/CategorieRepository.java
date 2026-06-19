package mr.patrimoine.gestion.repository;

import mr.patrimoine.gestion.model.entity.CategorieEntity;
import mr.patrimoine.gestion.model.enums.TypeBien;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategorieRepository extends MongoRepository<CategorieEntity, String> {

    Optional<CategorieEntity> findByCode(String code);
    boolean existsByCode(String code);
    List<CategorieEntity> findByType(TypeBien type);
    List<CategorieEntity> findByNomContainingIgnoreCase(String nom);
}