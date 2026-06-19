package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.AuditLog.AuditLogResponseDTO;
import mr.patrimoine.gestion.services.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    // GET /api/audit-logs
    @GetMapping
    public ResponseEntity<List<AuditLogResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(auditLogService.obtenirTous());
    }

    // GET /api/audit-logs/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(auditLogService.obtenirParId(id));
    }

    // GET /api/audit-logs/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponseDTO>> obtenirParUser(
            @PathVariable String userId) {
        return ResponseEntity.ok(auditLogService.obtenirParUser(userId));
    }

    // GET /api/audit-logs/action/{action}
    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogResponseDTO>> obtenirParAction(
            @PathVariable String action) {
        return ResponseEntity.ok(auditLogService.obtenirParAction(action));
    }

    // GET /api/audit-logs/entite/{entite}
    @GetMapping("/entite/{entite}")
    public ResponseEntity<List<AuditLogResponseDTO>> obtenirParEntite(
            @PathVariable String entite) {
        return ResponseEntity.ok(auditLogService.obtenirParEntite(entite));
    }

    // GET /api/audit-logs/entite-id/{entiteId}
    @GetMapping("/entite-id/{entiteId}")
    public ResponseEntity<List<AuditLogResponseDTO>> obtenirParEntiteId(
            @PathVariable String entiteId) {
        return ResponseEntity.ok(auditLogService.obtenirParEntiteId(entiteId));
    }

    // GET /api/audit-logs/periode?debut=...&fin=...
    @GetMapping("/periode")
    public ResponseEntity<List<AuditLogResponseDTO>> obtenirParPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(auditLogService.obtenirParPeriode(debut, fin));
    }
}