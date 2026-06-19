package mr.patrimoine.gestion.dto.Auth;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private String token;
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
}