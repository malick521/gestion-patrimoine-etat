package mr.patrimoine.gestion.dto.Affectation;

import mr.patrimoine.gestion.model.entity.AffectationEntity;
import lombok.*;
import mr.patrimoine.gestion.model.enums.StatutAffectation;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffectationResponseDTO {

    private String id;
    private String bienId;
    private String bienDesignation;
    private String userId;
    private String userNom;
    private String ministereId;
    private String ministereNom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String motif;
    private StatutAffectation statut;
    private String observations;
    private LocalDateTime dateCreation;
    private String creePar;
    private String creeParNom;
}