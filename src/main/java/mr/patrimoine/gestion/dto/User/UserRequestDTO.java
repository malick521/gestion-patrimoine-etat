package mr.patrimoine.gestion.dto.User;

import mr.patrimoine.gestion.model.entity.UserEntity;
import jakarta.validation.constraints.*;
import lombok.*;
import mr.patrimoine.gestion.model.enums.Role;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {

    @NotBlank(message = "Nom obligatoire")
    private String nom;

    @NotBlank(message = "Prénom obligatoire")
    private String prenom;

    @NotBlank(message = "Email obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Mot de passe obligatoire")
    @Size(min = 8, message = "Mot de passe minimum 8 caractères")
    private String motDePasse;

    @NotBlank(message = "Ministère obligatoire")
    private String ministereId;

    private Role role;
}