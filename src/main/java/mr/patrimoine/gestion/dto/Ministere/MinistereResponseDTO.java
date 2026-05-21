package mr.patrimoine.gestion.dto.Ministere;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MinistereResponseDTO {

    private String id;
    private String nom;
    private String code;
    private String responsable;
    private String email;
    private String description;
    private String adresse;
    private String telephone;
    private boolean actif;
    private LocalDateTime dateCreation;
}