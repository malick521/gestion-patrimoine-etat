package mr.patrimoine.gestion.dto.Ministere;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MinistereRequestDTO {

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    @NotBlank(message = "Code obligatoire")
    private String code;

    @NotBlank(message = "Responsable obligatoire")
    private String responsable;

    private String description;
    private String telephone;
    private String adresse;

    @Email(message = "Email invalide")
    private String email;
}