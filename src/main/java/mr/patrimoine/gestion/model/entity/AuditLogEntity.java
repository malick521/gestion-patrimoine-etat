package mr.patrimoine.gestion.model.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogEntity {

    @Id
    private String id;

    private String userId;
    private String userEmail;
    private String action;
    private String entite;
    private String entiteId;
    private String details;
    private String ancienneValeur;
    private String nouvelleValeur;
    private String ipAddress;

    @CreatedDate
    private LocalDateTime dateAction;
}