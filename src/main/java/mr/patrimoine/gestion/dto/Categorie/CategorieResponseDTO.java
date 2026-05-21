package mr.patrimoine.gestion.dto.Categorie;

import mr.patrimoine.gestion.model.entity.CategorieEntity;
import lombok.*;
import mr.patrimoine.gestion.model.enums.TypeBien;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieResponseDTO {

    private String id;
    private String nom;
    private String code;
    private TypeBien type;
    private String description;
}