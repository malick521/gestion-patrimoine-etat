package mr.patrimoine.gestion.dto.Mouvement;

import mr.patrimoine.gestion.model.entity.MouvementEntity;
import jakarta.validation.constraints.*;
import lombok.*;
import mr.patrimoine.gestion.model.enums.TypeMouvement;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MouvementRequestDTO {

    @NotBlank(message = "Bien obligatoire")
    private String bienId;

    @NotNull(message = "Type de mouvement obligatoire")
    private TypeMouvement type;

    private String ministereSourceId;
    private String ministereDestinationId;
    private String motif;
    private String observations;
    private String raisonReforme;
    private Double valeurResiduelle;
}