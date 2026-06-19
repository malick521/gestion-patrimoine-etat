package mr.patrimoine.gestion.dto.User;

import lombok.*;
import mr.patrimoine.gestion.model.enums.UserRole;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {

    private String id;
    private String nom;
    private String prenom;
    private String email;
    private UserRole userRole;
    private String ministereId;
    private String ministereNom;
    private boolean actif;
    private LocalDateTime dateCreation;
}