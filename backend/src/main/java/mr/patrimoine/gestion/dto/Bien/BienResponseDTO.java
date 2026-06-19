package mr.patrimoine.gestion.dto.Bien;

import mr.patrimoine.gestion.model.entity.BienEntity;
import lombok.*;
import mr.patrimoine.gestion.model.enums.EtatBien;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BienResponseDTO {

    private String id;
    private String code;
    private String designation;
    private String description;
    private Double valeurAcquisition;
    private Double valeurActuelle;
    private LocalDate dateAcquisition;
    private EtatBien etat;
    private String localisation;
    private String categorieId;
    private String categorieNom;
    private String ministereId;
    private String ministereNom;
    private String fournisseur;
    private String numeroSerie;
    private String observations;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}