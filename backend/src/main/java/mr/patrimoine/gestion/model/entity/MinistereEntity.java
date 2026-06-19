package mr.patrimoine.gestion.model.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Document(collection = "ministeres")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MinistereEntity {

    @Id
    private String id;

    @NotBlank
    private String nom;

    @NotBlank
    @Indexed(unique = true)
    private String code;

    private String description;
    private String responsable;
    private String telephone;
    private String email;
    private String adresse;
    private boolean actif = true;
    private LocalDateTime dateCreation;
}