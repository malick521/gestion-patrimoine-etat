package mr.patrimoine.gestion.model.entity;

import lombok.*;
import mr.patrimoine.gestion.model.enums.Role;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    private String id;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @Email
    @Indexed(unique = true)
    private String email;

    @NotBlank
    private String motDePasse;

    private Role role;

    private String ministereId;

    private String telephone;

    private boolean actif = true;

    private LocalDateTime dateCreation;

    private LocalDateTime derniereConnexion;


   
}