package mr.patrimoine.gestion.dto.AuditLog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponseDTO {

    private String id;
    private String userId;
    private String userEmail;
    private String action;
    private String entite;
    private String entiteId;
    private String details;
    private String ancienneValeur;
    private String nouvelleValeur;
    private LocalDateTime dateAction;
}
