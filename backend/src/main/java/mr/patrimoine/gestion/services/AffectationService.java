package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.Affectation.AffectationRequestDTO;
import mr.patrimoine.gestion.dto.Affectation.AffectationResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.AffectationEntity;
import mr.patrimoine.gestion.model.entity.BienEntity;
import mr.patrimoine.gestion.model.entity.MinistereEntity;
import mr.patrimoine.gestion.model.entity.UserEntity;
import mr.patrimoine.gestion.model.enums.EtatBien;
import mr.patrimoine.gestion.model.enums.StatutAffectation;
import mr.patrimoine.gestion.repository.AffectationRepository;
import mr.patrimoine.gestion.repository.BienRepository;
import mr.patrimoine.gestion.repository.MinistereRepository;
import mr.patrimoine.gestion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AffectationService {

    @Autowired
    private AffectationRepository affectationRepository;

    @Autowired
    private BienRepository bienRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MinistereRepository ministereRepository;

    @Autowired
    private AuditLogService auditLogService;

    // ==================== AFFECTER ====================
    public AffectationResponseDTO affecter(AffectationRequestDTO dto, String userEmail) {

        // 1 — Récupérer le user depuis son email (extrait du token)
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        // 2 — Bien existe ?
        BienEntity bien = bienRepository.findById(dto.getBienId())
                .orElseThrow(() -> new ResourceNotFoundException("Bien", dto.getBienId()));

        // 3 — Bien déjà affecté ?
        if (affectationRepository.existsByBienIdAndStatut(
                dto.getBienId(), StatutAffectation.ACTIVE)) {
            throw new BusinessException("Ce bien est déjà affecté !");
        }

        // 4 — Bien en maintenance ou réformé ?
        if (bien.getEtat() == EtatBien.EN_MAINTENANCE) {
            throw new BusinessException("Ce bien est en maintenance !");
        }
        if (bien.getEtat() == EtatBien.REFORME) {
            throw new BusinessException("Ce bien est réformé !");
        }

        // 5 — Ministère existe ?
        MinistereEntity ministere = ministereRepository.findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        // 6 — Construire l'affectation
        AffectationEntity affectation = AffectationEntity.builder()
                .bienId(dto.getBienId())
                .userId(user.getId())       // ✅ ID résolu depuis l'email du token
                .ministereId(dto.getMinistereId())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .motif(dto.getMotif())
                .observations(dto.getObservations())
                .statut(StatutAffectation.ACTIVE)
                .creePar(user.getId())      // ✅ même user
                .dateCreation(LocalDateTime.now())
                .build();

        AffectationEntity saved = affectationRepository.save(affectation);

        auditLogService.log(user.getId(), user.getEmail(),
                "CREATION_AFFECTATION", "Affectation", saved.getId(),
                "Affectation du bien : " + bien.getDesignation());


        return toResponseDTO(saved, bien, user, ministere);
    }

    // ==================== OBTENIR TOUS ====================
    public List<AffectationResponseDTO> obtenirTous() {
        return affectationRepository.findAll()
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public AffectationResponseDTO obtenirParId(String id) {
        AffectationEntity affectation = affectationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation", id));
        return resolveAndMap(affectation);
    }

    // ==================== OBTENIR PAR BIEN ====================
    public List<AffectationResponseDTO> obtenirParBien(String bienId) {
        return affectationRepository.findByBienId(bienId)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR USER ====================
    public List<AffectationResponseDTO> obtenirParUser(String userId) {
        return affectationRepository.findByUserId(userId)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR MINISTERE ====================
    public List<AffectationResponseDTO> obtenirParMinistere(String ministereId) {
        return affectationRepository.findByMinistereId(ministereId)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR STATUT ====================
    public List<AffectationResponseDTO> obtenirParStatut(StatutAffectation statut) {
        return affectationRepository.findByStatut(statut)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== CLOTURER ====================
    public AffectationResponseDTO cloturer(String id, String userEmail) {

        UserEntity user = userRepository.findByEmail(userEmail).orElse(null);

        AffectationEntity affectation = affectationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation", id));

        // Déjà clôturée ?
        if (affectation.getStatut() == StatutAffectation.CLOTUREE) {
            throw new BusinessException("Cette affectation est déjà clôturée !");
        }

        affectation.setStatut(StatutAffectation.CLOTUREE);
        AffectationEntity saved = affectationRepository.save(affectation);

        auditLogService.log(user != null ? user.getId() : null,
                userEmail,
                "CLOTURE_AFFECTATION", "Affectation", id,
                "Clôture de l'affectation : " + id);

        return resolveAndMap(saved);
    }

    // ==================== SUPPRIMER ====================
    public void supprimer(String id, String userEmail) {

        UserEntity user = userRepository.findByEmail(userEmail).orElse(null);

        if (!affectationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Affectation", id);
        }
        affectationRepository.deleteById(id);

        auditLogService.log(user != null ? user.getId() : null,
                userEmail,
                "Supprimer une affectation", "Affectation", id,
                "Suppression de l'affectation : " + id);
    }

    // ==================== RESOLVE AND MAP ====================
    private AffectationResponseDTO resolveAndMap(AffectationEntity affectation) {
        BienEntity bien = bienRepository
                .findById(affectation.getBienId()).orElse(null);
        UserEntity user = userRepository
                .findById(affectation.getUserId()).orElse(null);
        MinistereEntity ministere = ministereRepository
                .findById(affectation.getMinistereId()).orElse(null);
        return toResponseDTO(affectation, bien, user, ministere);
    }

    // ==================== MAPPER ====================
    private AffectationResponseDTO toResponseDTO(AffectationEntity affectation,
                                                 BienEntity bien,
                                                 UserEntity user,
                                                 MinistereEntity ministere) {
        return AffectationResponseDTO.builder()
                .id(affectation.getId())
                .bienId(affectation.getBienId())
                .bienDesignation(bien != null ? bien.getDesignation() : null)
                .userId(affectation.getUserId())
                .userNom(user != null ? user.getNom() + " " + user.getPrenom() : null)
                .ministereId(affectation.getMinistereId())
                .ministereNom(ministere != null ? ministere.getNom() : null)
                .dateDebut(affectation.getDateDebut())
                .dateFin(affectation.getDateFin())
                .motif(affectation.getMotif())
                .statut(affectation.getStatut())
                .observations(affectation.getObservations())
                .dateCreation(affectation.getDateCreation())
                .creePar(affectation.getCreePar())
                .build();
    }
}