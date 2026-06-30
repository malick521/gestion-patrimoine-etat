package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.Bien.BienRequestDTO;
import mr.patrimoine.gestion.dto.Bien.BienResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.BienEntity;
import mr.patrimoine.gestion.model.entity.CategorieEntity;
import mr.patrimoine.gestion.model.entity.MinistereEntity;
import mr.patrimoine.gestion.model.entity.UserEntity;
import mr.patrimoine.gestion.model.enums.EtatBien;
import mr.patrimoine.gestion.repository.BienRepository;
import mr.patrimoine.gestion.repository.CategorieRepository;
import mr.patrimoine.gestion.repository.MinistereRepository;
import mr.patrimoine.gestion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class BienService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Autowired
    private BienRepository bienRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MinistereRepository ministereRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired
    private AuditLogService auditLogService;

    // ✅ CORRECTION ICI : Ajout du paramètre userEmail
    public BienResponseDTO creer(BienRequestDTO dto, String userEmail) {

        if (bienRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Un bien avec le code " + dto.getCode() + " existe déjà");
        }

        // 2 — Ministère existe ?
        MinistereEntity ministere = ministereRepository.findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        // 3 — Catégorie existe ?
        CategorieEntity categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", dto.getCategorieId()));

        // 4 — Construire l'entité
        BienEntity bien = BienEntity.builder()
                .code(dto.getCode().toUpperCase())
                .designation(dto.getDesignation())
                .description(dto.getDescription())
                .valeurAcquisition(dto.getValeurAcquisition())
                .valeurActuelle(dto.getValeurAcquisition())
                .dateAcquisition(dto.getDateAcquisition())
                .etat(dto.getEtat() != null ? dto.getEtat() : EtatBien.BON)
                .localisation(dto.getLocalisation())
                .categorieId(dto.getCategorieId())
                .ministereId(dto.getMinistereId())
                .fournisseur(dto.getFournisseur())
                .numeroSerie(dto.getNumeroSerie())
                .observations(dto.getObservations())
                .build();

        BienEntity saved = bienRepository.save(bien);

        // ✅ CORRECTION ICI : Récupération de l'utilisateur pour l'AuditLog
        UserEntity user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        auditLogService.log(
                user != null ? user.getId() : null,
                userEmail != null ? userEmail : "SYSTEM",
                "CREATION_BIEN", "Bien", saved.getId(),
                "Création du bien : " + saved.getDesignation());

        return toResponseDTO(saved, ministere, categorie);
    }


    public BienResponseDTO uploadImage(String id, MultipartFile file, String userEmail) {

        // 1 — Bien existe ?
        BienEntity bien = bienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", id));

        // 2 — Vérifier que c'est bien une image
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Le fichier doit être une image !");
        }

        // 3 — Générer un nom unique
        String extension = file.getOriginalFilename()
                .substring(file.getOriginalFilename().lastIndexOf("."));
        String filename = id + "_" + System.currentTimeMillis() + extension;

        // 4 — Sauvegarder sur disque
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(),
                    uploadPath.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de l'upload de l'image !");
        }

        // 5 — Sauvegarder l'URL en base
        bien.setImageUrl("/api/biens/images/" + filename);
        BienEntity saved = bienRepository.save(bien);

        // 6 — Log
        auditLogService.log(null, userEmail,
                "UPLOAD_IMAGE_BIEN", "Bien", id,
                "Upload image pour bien : " + bien.getDesignation());

        MinistereEntity ministere = ministereRepository
                .findById(saved.getMinistereId()).orElse(null);
        CategorieEntity categorie = categorieRepository
                .findById(saved.getCategorieId()).orElse(null);

        return toResponseDTO(saved, ministere, categorie);
    }

    // ==================== OBTENIR TOUS ====================
    public List<BienResponseDTO> obtenirTous() {
        return bienRepository.findAll()
                .stream()
                .map(bien -> {
                    MinistereEntity ministere = ministereRepository
                            .findById(bien.getMinistereId()).orElse(null);
                    CategorieEntity categorie = categorieRepository
                            .findById(bien.getCategorieId()).orElse(null);
                    return toResponseDTO(bien, ministere, categorie);
                })
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public BienResponseDTO obtenirParId(String id) {
        BienEntity bien = bienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", id));

        MinistereEntity ministere = ministereRepository
                .findById(bien.getMinistereId()).orElse(null);
        CategorieEntity categorie = categorieRepository
                .findById(bien.getCategorieId()).orElse(null);

        return toResponseDTO(bien, ministere, categorie);
    }

    // ==================== OBTENIR PAR CODE ====================
    public BienResponseDTO obtenirParCode(String code) {
        BienEntity bien = bienRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Bien avec le code", code));

        MinistereEntity ministere = ministereRepository
                .findById(bien.getMinistereId()).orElse(null);
        CategorieEntity categorie = categorieRepository
                .findById(bien.getCategorieId()).orElse(null);

        return toResponseDTO(bien, ministere, categorie);
    }

    // ==================== OBTENIR PAR MINISTERE ====================
    public List<BienResponseDTO> obtenirParMinistere(String ministereId) {
        ministereRepository.findById(ministereId)
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", ministereId));

        return bienRepository.findByMinistereId(ministereId)
                .stream()
                .map(bien -> {
                    MinistereEntity ministere = ministereRepository
                            .findById(bien.getMinistereId()).orElse(null);
                    CategorieEntity categorie = categorieRepository
                            .findById(bien.getCategorieId()).orElse(null);
                    return toResponseDTO(bien, ministere, categorie);
                })
                .toList();
    }

    // ==================== OBTENIR PAR ETAT ====================
    public List<BienResponseDTO> obtenirParEtat(EtatBien etat) {
        return bienRepository.findByEtat(etat)
                .stream()
                .map(bien -> {
                    MinistereEntity ministere = ministereRepository
                            .findById(bien.getMinistereId()).orElse(null);
                    CategorieEntity categorie = categorieRepository
                            .findById(bien.getCategorieId()).orElse(null);
                    return toResponseDTO(bien, ministere, categorie);
                })
                .toList();
    }

    // ==================== RECHERCHER ====================
    public List<BienResponseDTO> rechercher(String keyword) {
        return bienRepository.findByDesignationContainingIgnoreCase(keyword)
                .stream()
                .map(bien -> {
                    MinistereEntity ministere = ministereRepository
                            .findById(bien.getMinistereId()).orElse(null);
                    CategorieEntity categorie = categorieRepository
                            .findById(bien.getCategorieId()).orElse(null);
                    return toResponseDTO(bien, ministere, categorie);
                })
                .toList();
    }

    // ==================== MODIFIER ====================
    public BienResponseDTO modifier(String id, BienRequestDTO dto) {

        // 1 — Bien existe ?
        BienEntity bien = bienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", id));

        // 2 — Code déjà pris par un autre ?
        if (!bien.getCode().equals(dto.getCode().toUpperCase())
                && bienRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Un bien avec le code " + dto.getCode() + " existe déjà");
        }

        // 3 — Ministère existe ?
        MinistereEntity ministere = ministereRepository.findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        // 4 — Catégorie existe ?
        CategorieEntity categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", dto.getCategorieId()));

        // 5 — Mettre à jour
        bien.setCode(dto.getCode().toUpperCase());
        bien.setDesignation(dto.getDesignation());
        bien.setDescription(dto.getDescription());
        bien.setValeurAcquisition(dto.getValeurAcquisition());
        bien.setDateAcquisition(dto.getDateAcquisition());
        bien.setEtat(dto.getEtat());
        bien.setLocalisation(dto.getLocalisation());
        bien.setCategorieId(dto.getCategorieId());
        bien.setMinistereId(dto.getMinistereId());
        bien.setFournisseur(dto.getFournisseur());
        bien.setNumeroSerie(dto.getNumeroSerie());
        bien.setObservations(dto.getObservations());

        BienEntity saved = bienRepository.save(bien);
        return toResponseDTO(saved, ministere, categorie);
    }

    // ==================== MODIFIER ETAT ====================
    public BienResponseDTO modifierEtat(String id, EtatBien etat, String userEmail) {

        UserEntity user = userRepository.findByEmail(userEmail).orElse(null);

        BienEntity bien = bienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", id));

        String ancienEtat = bien.getEtat().toString();

        bien.setEtat(etat);

        BienEntity saved = bienRepository.save(bien);

        MinistereEntity ministere = ministereRepository
                .findById(saved.getMinistereId()).orElse(null);
        CategorieEntity categorie = categorieRepository
                .findById(saved.getCategorieId()).orElse(null);

        auditLogService.log( user != null ? user.getId() : null,
                userEmail,
                "MODIFICATION_ETAT_BIEN", "Bien", id,
                "Etat modifié", ancienEtat, etat.toString());

        return toResponseDTO(saved, ministere, categorie);
    }

    // ==================== SUPPRIMER ====================
    public void supprimer(String id, String userEmail) {

        UserEntity user = userRepository.findByEmail(userEmail).orElse(null);

        if (!bienRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bien", id);
        }
        bienRepository.deleteById(id);

        auditLogService.log( user != null ? user.getId() : null,
                userEmail,
                "SUPPRESSION_BIEN", "Bien", id,
                "Suppression du bien : " + id);
    }

    // ==================== MAPPER ====================
    public BienResponseDTO toResponseDTO(BienEntity bien,
                                         MinistereEntity ministere,
                                         CategorieEntity categorie) {
        return BienResponseDTO.builder()
                .id(bien.getId())
                .code(bien.getCode())
                .designation(bien.getDesignation())
                .description(bien.getDescription())
                .valeurAcquisition(bien.getValeurAcquisition())
                .valeurActuelle(bien.getValeurActuelle())
                .dateAcquisition(bien.getDateAcquisition())
                .etat(bien.getEtat())
                .localisation(bien.getLocalisation())
                .categorieId(bien.getCategorieId())
                .categorieNom(categorie != null ? categorie.getNom() : null)
                .ministereId(bien.getMinistereId())
                .ministereNom(ministere != null ? ministere.getNom() : null)
                .fournisseur(bien.getFournisseur())
                .numeroSerie(bien.getNumeroSerie())
                .observations(bien.getObservations())
                .dateCreation(bien.getDateCreation())
                .dateModification(bien.getDateModification())
                .build();
    }
}