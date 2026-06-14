package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.Maintenance.MaintenanceRequestDTO;
import mr.patrimoine.gestion.dto.Maintenance.MaintenanceResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.BienEntity;
import mr.patrimoine.gestion.model.entity.MaintenanceEntity;
import mr.patrimoine.gestion.model.entity.UserEntity;
import mr.patrimoine.gestion.model.enums.EtatBien;
import mr.patrimoine.gestion.model.enums.StatutMaintenance;
import mr.patrimoine.gestion.model.enums.TypeMaintenance;
import mr.patrimoine.gestion.repository.BienRepository;
import mr.patrimoine.gestion.repository.MaintenanceRepository;
import mr.patrimoine.gestion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private BienRepository bienRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    // ==================== CREER ====================
    public MaintenanceResponseDTO creer(MaintenanceRequestDTO dto, String userEmail) {

        // 1 — Récupérer le user depuis le token
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        // 2 — Bien existe ?
        BienEntity bien = bienRepository.findById(dto.getBienId())
                .orElseThrow(() -> new ResourceNotFoundException("Bien", dto.getBienId()));

        // 3 — Bien réformé ?
        if (bien.getEtat() == EtatBien.REFORME) {
            throw new BusinessException("Impossible de planifier une maintenance sur un bien réformé !");
        }

        // 4 — Bien déjà en maintenance ?
        if (maintenanceRepository.existsByBienIdAndStatut(
                dto.getBienId(), StatutMaintenance.EN_COURS)) {
            throw new BusinessException("Ce bien est déjà en cours de maintenance !");
        }

        // 5 — Construire l'entité
        MaintenanceEntity maintenance = MaintenanceEntity.builder()
                .bienId(dto.getBienId())
                .type(dto.getType())
                .dateIntervention(dto.getDateIntervention())
                .dateFinIntervention(dto.getDateFinIntervention())
                .prestataire(dto.getPrestataire())
                .cout(dto.getCout())
                .description(dto.getDescription())
                .observations(dto.getObservations())
                .statut(dto.getStatut() != null ? dto.getStatut() : StatutMaintenance.PLANIFIEE)
                .creePar(user.getId())
                .dateCreation(LocalDateTime.now())
                .build();

        // 6 — Si statut EN_COURS → mettre le bien EN_MAINTENANCE
        if (maintenance.getStatut() == StatutMaintenance.EN_COURS) {
            bien.setEtat(EtatBien.EN_MAINTENANCE);
            bienRepository.save(bien);
        }

        MaintenanceEntity saved = maintenanceRepository.save(maintenance);

        auditLogService.log(user.getId(), user.getEmail(),
                "CREATION_MAINTENANCE", "Maintenance", saved.getId(),
                "Maintenance créée sur bien : " + bien.getDesignation());

        return toResponseDTO(saved, bien, user);
    }

    // ==================== OBTENIR TOUS ====================
    public List<MaintenanceResponseDTO> obtenirTous() {
        return maintenanceRepository.findAll()
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public MaintenanceResponseDTO obtenirParId(String id) {
        MaintenanceEntity maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", id));
        return resolveAndMap(maintenance);
    }

    // ==================== OBTENIR PAR BIEN ====================
    public List<MaintenanceResponseDTO> obtenirParBien(String bienId) {
        return maintenanceRepository.findByBienId(bienId)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR TYPE ====================
    public List<MaintenanceResponseDTO> obtenirParType(TypeMaintenance type) {
        return maintenanceRepository.findByType(type)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR STATUT ====================
    public List<MaintenanceResponseDTO> obtenirParStatut(StatutMaintenance statut) {
        return maintenanceRepository.findByStatut(statut)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== TERMINER ====================
    public MaintenanceResponseDTO terminer(String id, String userEmail) {

        UserEntity user = userRepository.findByEmail(userEmail).orElse(null);

        MaintenanceEntity maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", id));

        if (maintenance.getStatut() == StatutMaintenance.TERMINEE) {
            throw new BusinessException("Cette maintenance est déjà terminée !");
        }

        // Mettre à jour le statut maintenance
        maintenance.setStatut(StatutMaintenance.TERMINEE);
        maintenanceRepository.save(maintenance);

        auditLogService.log( user != null ? user.getId() : null,
                userEmail,
                "TERMINER_MAINTENANCE", "Maintenance", id,
                "Maintenance terminée : " + id);

        // Remettre le bien en état BON
        BienEntity bien = bienRepository.findById(maintenance.getBienId()).orElse(null);
        if (bien != null) {
            bien.setEtat(EtatBien.BON);
            bienRepository.save(bien);
        }



        return resolveAndMap(maintenance);
    }

    // ==================== ANNULER ====================
    public MaintenanceResponseDTO annuler(String id) {

        MaintenanceEntity maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance", id));

        if (maintenance.getStatut() == StatutMaintenance.TERMINEE) {
            throw new BusinessException("Impossible d'annuler une maintenance terminée !");
        }

        maintenance.setStatut(StatutMaintenance.ANNULEE);
        maintenanceRepository.save(maintenance);

        // Remettre le bien en état BON
        BienEntity bien = bienRepository.findById(maintenance.getBienId()).orElse(null);
        if (bien != null && bien.getEtat() == EtatBien.EN_MAINTENANCE) {
            bien.setEtat(EtatBien.BON);
            bienRepository.save(bien);
        }

        return resolveAndMap(maintenance);
    }

    // ==================== SUPPRIMER ====================
    public void supprimer(String id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Maintenance", id);
        }
        maintenanceRepository.deleteById(id);
    }

    // ==================== RESOLVE AND MAP ====================
    private MaintenanceResponseDTO resolveAndMap(MaintenanceEntity maintenance) {
        BienEntity bien = bienRepository
                .findById(maintenance.getBienId()).orElse(null);
        UserEntity user = userRepository
                .findById(maintenance.getCreePar()).orElse(null);
        return toResponseDTO(maintenance, bien, user);
    }

    // ==================== MAPPER ====================
    private MaintenanceResponseDTO toResponseDTO(MaintenanceEntity maintenance,
                                                 BienEntity bien,
                                                 UserEntity user) {
        return MaintenanceResponseDTO.builder()
                .id(maintenance.getId())
                .bienId(maintenance.getBienId())
                .bienDesignation(bien != null ? bien.getDesignation() : null)
                .type(maintenance.getType())
                .dateIntervention(maintenance.getDateIntervention())
                .dateFinIntervention(maintenance.getDateFinIntervention())
                .prestataire(maintenance.getPrestataire())
                .cout(maintenance.getCout())
                .description(maintenance.getDescription())
                .observations(maintenance.getObservations())
                .statut(maintenance.getStatut())
                .dateCreation(maintenance.getDateCreation())
                .creePar(maintenance.getCreePar())
                .creeParNom(user != null ? user.getNom() + " " + user.getPrenom() : null)
                .build();
    }
}