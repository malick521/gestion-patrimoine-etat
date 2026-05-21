package mr.patrimoine.gestion.dto.User;

import mr.patrimoine.gestion.model.entity.UserEntity;
import lombok.*;
import mr.patrimoine.gestion.model.enums.Role;

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
    private Role role;
    private String ministereId;
    private String ministereNom;
    private boolean actif;
    private LocalDateTime dateCreation;
}