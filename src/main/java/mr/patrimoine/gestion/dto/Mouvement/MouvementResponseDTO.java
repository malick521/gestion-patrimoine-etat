package mr.patrimoine.gestion.dto.Mouvement;

import mr.patrimoine.gestion.model.entity.MouvementEntity;
import lombok.*;
import mr.patrimoine.gestion.model.enums.TypeMouvement;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MouvementResponseDTO {

    private String id;
    private String bienId;
    private String bienDesignation;
    private TypeMouvement type;
    private LocalDate dateMouvement;
    private String ministereSourceId;
    private String ministereSourceNom;
    private String ministereDestinationId;
    private String ministereDestinationNom;
    private String motif;
    private String observations;
    private String raisonReforme;
    private Double valeurResiduelle;
    private LocalDateTime dateCreation;
    private String creePar;
    private String creeParNom;
}