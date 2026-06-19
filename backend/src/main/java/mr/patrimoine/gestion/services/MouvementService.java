package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.Mouvement.MouvementRequestDTO;
import mr.patrimoine.gestion.dto.Mouvement.MouvementResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.BienEntity;
import mr.patrimoine.gestion.model.entity.MinistereEntity;
import mr.patrimoine.gestion.model.entity.MouvementEntity;
import mr.patrimoine.gestion.model.entity.UserEntity;
import mr.patrimoine.gestion.model.enums.EtatBien;
import mr.patrimoine.gestion.model.enums.TypeMouvement;
import mr.patrimoine.gestion.repository.BienRepository;
import mr.patrimoine.gestion.repository.MinistereRepository;
import mr.patrimoine.gestion.repository.MouvementRepository;
import mr.patrimoine.gestion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MouvementService {

    @Autowired
    private MouvementRepository mouvementRepository;

    @Autowired
    private BienRepository bienRepository;

    @Autowired
    private MinistereRepository ministereRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;


    // ==================== CREER ====================
    public MouvementResponseDTO creer(MouvementRequestDTO dto, String userEmail) {

        // 1 — Récupérer le user depuis le token
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", userEmail));

        // 2 — Bien existe ?
        BienEntity bien = bienRepository.findById(dto.getBienId())
                .orElseThrow(() -> new ResourceNotFoundException("Bien", dto.getBienId()));

        // 3 — Validations selon le type de mouvement
        switch (dto.getType()) {

            case TRANSFERT -> {
                // Ministère source obligatoire
                if (dto.getMinistereSourceId() == null) {
                    throw new BusinessException("Ministère source obligatoire pour un transfert !");
                }
                // Ministère destination obligatoire
                if (dto.getMinistereDestinationId() == null) {
                    throw new BusinessException("Ministère destination obligatoire pour un transfert !");
                }
                // Ministères différents ?
                if (dto.getMinistereSourceId().equals(dto.getMinistereDestinationId())) {
                    throw new BusinessException("Les ministères source et destination doivent être différents !");
                }
                // Ministère source existe ?
                ministereRepository.findById(dto.getMinistereSourceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ministere source", dto.getMinistereSourceId()));
                // Ministère destination existe ?
                ministereRepository.findById(dto.getMinistereDestinationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ministere destination", dto.getMinistereDestinationId()));
                // Mettre à jour le ministère du bien
                bien.setMinistereId(dto.getMinistereDestinationId());
                bienRepository.save(bien);
            }

            case REFORME -> {
                // Raison obligatoire
                if (dto.getRaisonReforme() == null || dto.getRaisonReforme().isEmpty()) {
                    throw new BusinessException("Raison de réforme obligatoire !");
                }
                // Bien déjà réformé ?
                if (mouvementRepository.existsByBienIdAndType(dto.getBienId(), TypeMouvement.REFORME)) {
                    throw new BusinessException("Ce bien est déjà réformé !");
                }
                // Mettre le bien en état REFORME
                bien.setEtat(EtatBien.REFORME);
                bienRepository.save(bien);
            }

            case PERTE -> {
                // Bien déjà perdu ?
                if (mouvementRepository.existsByBienIdAndType(dto.getBienId(), TypeMouvement.PERTE)) {
                    throw new BusinessException("Ce bien est déjà marqué comme perdu !");
                }
                // Mettre le bien en état HORS_SERVICE
                bien.setEtat(EtatBien.HORS_SERVICE);
                bienRepository.save(bien);
            }

            case ENTREE -> {
                // Pas de validation spéciale pour une entrée
            }

            case CESSION -> {
                // Ministère destination obligatoire
                if (dto.getMinistereDestinationId() == null) {
                    throw new BusinessException("Ministère destination obligatoire pour une cession !");
                }
            }
        }

        // 4 — Construire le mouvement
        MouvementEntity mouvement = MouvementEntity.builder()
                .bienId(dto.getBienId())
                .type(dto.getType())
                .dateMouvement(LocalDate.now())
                .ministereSourceId(dto.getMinistereSourceId())
                .ministereDestinationId(dto.getMinistereDestinationId())
                .motif(dto.getMotif())
                .observations(dto.getObservations())
                .raisonReforme(dto.getRaisonReforme())
                .valeurResiduelle(dto.getValeurResiduelle())
                .creePar(user.getId())
                .dateCreation(LocalDateTime.now())
                .build();

        MouvementEntity saved = mouvementRepository.save(mouvement);

        auditLogService.log(user.getId(), user.getEmail(),
                dto.getType().toString(), "Mouvement", saved.getId(),
                "Mouvement " + dto.getType() + " sur bien : " + bien.getDesignation());

        return toResponseDTO(saved, bien, user);
    }

    // ==================== OBTENIR TOUS ====================
    public List<MouvementResponseDTO> obtenirTous() {
        return mouvementRepository.findAll()
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public MouvementResponseDTO obtenirParId(String id) {
        MouvementEntity mouvement = mouvementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mouvement", id));
        return resolveAndMap(mouvement);
    }

    // ==================== OBTENIR PAR BIEN ====================
    public List<MouvementResponseDTO> obtenirParBien(String bienId) {
        return mouvementRepository.findByBienId(bienId)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR TYPE ====================
    public List<MouvementResponseDTO> obtenirParType(TypeMouvement type) {
        return mouvementRepository.findByType(type)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR MINISTERE SOURCE ====================
    public List<MouvementResponseDTO> obtenirParMinistereSource(String ministereId) {
        return mouvementRepository.findByMinistereSourceId(ministereId)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== OBTENIR PAR MINISTERE DESTINATION ====================
    public List<MouvementResponseDTO> obtenirParMinistereDestination(String ministereId) {
        return mouvementRepository.findByMinistereDestinationId(ministereId)
                .stream()
                .map(this::resolveAndMap)
                .toList();
    }

    // ==================== RESOLVE AND MAP ====================
    private MouvementResponseDTO resolveAndMap(MouvementEntity mouvement) {
        BienEntity bien = bienRepository
                .findById(mouvement.getBienId()).orElse(null);
        UserEntity user = userRepository
                .findById(mouvement.getCreePar()).orElse(null);
        return toResponseDTO(mouvement, bien, user);
    }

    // ==================== MAPPER ====================
    private MouvementResponseDTO toResponseDTO(MouvementEntity mouvement,
                                               BienEntity bien,
                                               UserEntity user) {
        // Résoudre ministère source
        MinistereEntity ministereSource = mouvement.getMinistereSourceId() != null
                ? ministereRepository.findById(mouvement.getMinistereSourceId()).orElse(null)
                : null;

        // Résoudre ministère destination
        MinistereEntity ministreDest = mouvement.getMinistereDestinationId() != null
                ? ministereRepository.findById(mouvement.getMinistereDestinationId()).orElse(null)
                : null;

        return MouvementResponseDTO.builder()
                .id(mouvement.getId())
                .bienId(mouvement.getBienId())
                .bienDesignation(bien != null ? bien.getDesignation() : null)
                .type(mouvement.getType())
                .dateMouvement(mouvement.getDateMouvement())
                .ministereSourceId(mouvement.getMinistereSourceId())
                .ministereSourceNom(ministereSource != null ? ministereSource.getNom() : null)
                .ministereDestinationId(mouvement.getMinistereDestinationId())
                .ministereDestinationNom(ministreDest != null ? ministreDest.getNom() : null)
                .motif(mouvement.getMotif())
                .observations(mouvement.getObservations())
                .raisonReforme(mouvement.getRaisonReforme())
                .valeurResiduelle(mouvement.getValeurResiduelle())
                .dateCreation(mouvement.getDateCreation())
                .creePar(mouvement.getCreePar())
                .creeParNom(user != null ? user.getNom() + " " + user.getPrenom() : null)
                .build();
    }
}