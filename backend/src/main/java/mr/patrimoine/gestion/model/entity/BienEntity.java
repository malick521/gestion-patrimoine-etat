package mr.patrimoine.gestion.model.entity;

import lombok.*;
import mr.patrimoine.gestion.model.enums.EtatBien;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "biens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienEntity {

    @Id
    private String id;

    @NotBlank
    @Indexed(unique = true)
    private String code;

    @NotBlank
    private String designation;

    private String description;

    @NotNull
    private Double valeurAcquisition;

    private Double valeurActuelle;

    @NotNull
    private LocalDate dateAcquisition;

    private EtatBien etat;

    private String localisation;

    @NotBlank
    private String categorieId;

    @NotBlank
    private String ministereId;

    private String fournisseur;
    private String numeroSerie;
    private String observations;

    private String imageUrl;
    private Double latitude;
    private Double longitude;

    @CreatedDate
    private LocalDateTime dateCreation;

    @LastModifiedDate
    private LocalDateTime dateModification;
}