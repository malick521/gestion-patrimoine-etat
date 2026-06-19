package mr.patrimoine.gestion.model.entity;

import lombok.*;
import mr.patrimoine.gestion.model.enums.StatutAffectation;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "affectations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffectationEntity {

    @Id
    private String id;

    @NotBlank
    private String bienId;

    @NotBlank
    private String userId;

    @NotBlank
    private String ministereId;

    @NotNull
    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String motif;

    private StatutAffectation statut;

    private String observations;

    @CreatedDate
    private LocalDateTime dateCreation;

    private String creePar;

}