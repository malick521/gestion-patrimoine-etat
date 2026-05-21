package mr.patrimoine.gestion.dto.Affectation;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffectationRequestDTO {

    @NotBlank(message = "Bien obligatoire")
    private String bienId;

    @NotBlank(message = "Utilisateur obligatoire")
    private String userId;

    @NotBlank(message = "Ministère obligatoire")
    private String ministereId;

    @NotNull(message = "Date de début obligatoire")
    private LocalDate dateDebut;

    private LocalDate dateFin;

    @NotBlank(message = "Motif obligatoire")
    private String motif;

    private String observations;
}