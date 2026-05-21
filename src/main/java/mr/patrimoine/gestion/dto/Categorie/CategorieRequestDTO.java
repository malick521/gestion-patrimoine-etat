package mr.patrimoine.gestion.dto.Categorie;

import mr.patrimoine.gestion.model.entity.CategorieEntity;
import jakarta.validation.constraints.*;
import lombok.*;
import mr.patrimoine.gestion.model.enums.TypeBien;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorieRequestDTO {

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    @NotBlank(message = "Code obligatoire")
    private String code;

    @NotNull(message = "Type obligatoire")
    private TypeBien type;

    private String description;
}