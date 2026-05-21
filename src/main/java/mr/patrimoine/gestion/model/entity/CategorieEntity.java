package mr.patrimoine.gestion.model.entity;

import lombok.*;
import mr.patrimoine.gestion.model.enums.TypeBien;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieEntity {

    @Id
    private String id;

    @NotBlank
    private String nom;

    @Indexed(unique = true)
    private String code;

    private TypeBien type;

    private String description;


}