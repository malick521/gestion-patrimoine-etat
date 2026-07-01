package mr.patrimoine.gestion.dto.Bien;

import mr.patrimoine.gestion.model.entity.BienEntity;
import jakarta.validation.constraints.*;
import lombok.*;
import mr.patrimoine.gestion.model.enums.EtatBien;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BienRequestDTO {

    @NotBlank(message = "Code obligatoire")
    private String code;

    @NotBlank(message = "Désignation obligatoire")
    private String designation;

    private String description;

    @NotNull(message = "Valeur d'acquisition obligatoire")
    private Double valeurAcquisition;

    @NotNull(message = "Date d'acquisition obligatoire")
    private LocalDate dateAcquisition;

    private EtatBien etat = EtatBien.BON;

    @NotBlank(message = "Localisation obligatoire")
    private String localisation;
    private Double latitude;
    private Double longitude;
    @NotBlank(message = "Catégorie obligatoire")
    private String categorieId;
    private String imageUrl;
    @NotBlank(message = "Ministère obligatoire")
    private String ministereId;

    private String fournisseur;
    private String numeroSerie;
    private String observations;
}