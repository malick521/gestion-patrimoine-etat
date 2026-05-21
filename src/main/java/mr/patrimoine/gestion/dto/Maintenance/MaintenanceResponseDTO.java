package mr.patrimoine.gestion.dto.Maintenance;

import mr.patrimoine.gestion.model.entity.MaintenanceEntity;
import lombok.*;
import mr.patrimoine.gestion.model.enums.StatutMaintenance;
import mr.patrimoine.gestion.model.enums.TypeMaintenance;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceResponseDTO {

    private String id;
    private String bienId;
    private String bienDesignation;
    private TypeMaintenance type;
    private LocalDate dateIntervention;
    private LocalDate dateFinIntervention;
    private String prestataire;
    private Double cout;
    private String description;
    private String observations;
    private StatutMaintenance statut;
    private LocalDateTime dateCreation;
    private String creePar;
    private String creeParNom;
}