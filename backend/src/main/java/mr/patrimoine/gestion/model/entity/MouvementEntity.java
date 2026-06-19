package mr.patrimoine.gestion.model.entity;

import lombok.*;
import mr.patrimoine.gestion.model.enums.TypeMouvement;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "mouvements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MouvementEntity {

    @Id
    private String id;

    @NotBlank
    private String bienId;

    @NotNull
    private TypeMouvement type;

    @NotNull
    private LocalDate dateMouvement;

    private String ministereSourceId;
    private String ministereDestinationId;
    private String motif;
    private String observations;
    private String raisonReforme;
    private Double valeurResiduelle;

    @CreatedDate
    private LocalDateTime dateCreation;

    private String creePar;


}