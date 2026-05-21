package mr.patrimoine.gestion.dto.Maintenance;

import mr.patrimoine.gestion.model.entity.MaintenanceEntity;
import jakarta.validation.constraints.*;
import lombok.*;
import mr.patrimoine.gestion.model.enums.StatutMaintenance;
import mr.patrimoine.gestion.model.enums.TypeMaintenance;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestDTO {

    @NotBlank(message = "Bien obligatoire")
    private String bienId;

    @NotNull(message = "Type de maintenance obligatoire")
    private TypeMaintenance type;

    @NotNull(message = "Date d'intervention obligatoire")
    private LocalDate dateIntervention;

    private LocalDate dateFinIntervention;

    @NotBlank(message = "Prestataire obligatoire")
    private String prestataire;

    private Double cout;

    @NotBlank(message = "Description obligatoire")
    private String description;

    private String observations;

    private StatutMaintenance statut
            = StatutMaintenance.PLANIFIEE;
}