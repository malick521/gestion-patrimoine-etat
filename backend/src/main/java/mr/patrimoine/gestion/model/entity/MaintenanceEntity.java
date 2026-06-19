package mr.patrimoine.gestion.model.entity;

import lombok.*;
import mr.patrimoine.gestion.model.enums.StatutMaintenance;
import mr.patrimoine.gestion.model.enums.TypeMaintenance;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "maintenances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceEntity {

    @Id
    private String id;

    @NotBlank
    private String bienId;

    @NotNull
    private TypeMaintenance type;

    @NotNull
    private LocalDate dateIntervention;

    private LocalDate dateFinIntervention;

    private String prestataire;

    private Double cout;

    private String description;

    private String observations;

    private StatutMaintenance statut;

    @CreatedDate
    private LocalDateTime dateCreation;

    private String creePar;




}