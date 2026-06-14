package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.AuditLog.AuditLogResponseDTO;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.AuditLogEntity;
import mr.patrimoine.gestion.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    // ==================== LOG ====================
    // Méthode appelée par tous les autres services
    public void log(String userId,
                    String userEmail,
                    String action,
                    String entite,
                    String entiteId,
                    String details) {

        AuditLogEntity log = AuditLogEntity.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .entite(entite)
                .entiteId(entiteId)
                .details(details)
                .dateAction(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }

    // Surcharge avec ancienne/nouvelle valeur
    public void log(String userId,
                    String userEmail,
                    String action,
                    String entite,
                    String entiteId,
                    String details,
                    String ancienneValeur,
                    String nouvelleValeur) {

        AuditLogEntity log = AuditLogEntity.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .entite(entite)
                .entiteId(entiteId)
                .details(details)
                .ancienneValeur(ancienneValeur)
                .nouvelleValeur(nouvelleValeur)
                .dateAction(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }

    // ==================== OBTENIR TOUS ====================
    public List<AuditLogResponseDTO> obtenirTous() {
        return auditLogRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public AuditLogResponseDTO obtenirParId(String id) {
        AuditLogEntity log = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog", id));
        return toResponseDTO(log);
    }

    // ==================== OBTENIR PAR USER ====================
    public List<AuditLogResponseDTO> obtenirParUser(String userId) {
        return auditLogRepository.findByUserId(userId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== OBTENIR PAR ACTION ====================
    public List<AuditLogResponseDTO> obtenirParAction(String action) {
        return auditLogRepository.findByAction(action)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== OBTENIR PAR ENTITE ====================
    public List<AuditLogResponseDTO> obtenirParEntite(String entite) {
        return auditLogRepository.findByEntite(entite)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== OBTENIR PAR ENTITE ID ====================
    public List<AuditLogResponseDTO> obtenirParEntiteId(String entiteId) {
        return auditLogRepository.findByEntiteId(entiteId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== OBTENIR PAR PERIODE ====================
    public List<AuditLogResponseDTO> obtenirParPeriode(
            LocalDateTime debut, LocalDateTime fin) {
        return auditLogRepository.findByDateActionBetween(debut, fin)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== MAPPER ====================
    private AuditLogResponseDTO toResponseDTO(AuditLogEntity log) {
        return AuditLogResponseDTO.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .userEmail(log.getUserEmail())
                .action(log.getAction())
                .entite(log.getEntite())
                .entiteId(log.getEntiteId())
                .details(log.getDetails())
                .ancienneValeur(log.getAncienneValeur())
                .nouvelleValeur(log.getNouvelleValeur())
                .dateAction(log.getDateAction())
                .build();
    }
}