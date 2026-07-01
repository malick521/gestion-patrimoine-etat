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

    // ==================== MÉTHODE PRIVÉE POUR L'UPLOAD ====================
    private String sauvegarderImageSurDisque(String id, MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Le fichier doit être une image !");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = id + "_" + System.currentTimeMillis() + extension;

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(),
                    uploadPath.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
            return "/api/biens/images/" + filename;
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de l'upload de l'image !");
        }
    }

    // ==================== CRÉER ====================
    public BienResponseDTO creer(BienRequestDTO dto, MultipartFile imageFile, String userEmail) {

        if (bienRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Un bien avec le code " + dto.getCode() + " existe déjà");
        }

        MinistereEntity ministere = ministereRepository.findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        CategorieEntity categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", dto.getCategorieId()));

        BienEntity bien = BienEntity.builder()
                .code(dto.getCode().toUpperCase())
                .designation(dto.getDesignation())
                .description(dto.getDescription())
                .valeurAcquisition(dto.getValeurAcquisition())
                .valeurActuelle(dto.getValeurAcquisition())
                .dateAcquisition(dto.getDateAcquisition())
                .etat(dto.getEtat() != null ? dto.getEtat() : EtatBien.BON)
                .localisation(dto.getLocalisation())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .categorieId(dto.getCategorieId())
                .ministereId(dto.getMinistereId())
                .fournisseur(dto.getFournisseur())
                .numeroSerie(dto.getNumeroSerie())
                .observations(dto.getObservations())
                .build();

        BienEntity saved = bienRepository.save(bien);

        // Si une image est fournie lors de la création, on la sauvegarde
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = sauvegarderImageSurDisque(saved.getId(), imageFile);
            saved.setImageUrl(imageUrl);
            saved = bienRepository.save(saved);
        }

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

    // ==================== UPLOAD IMAGE SEULE ====================
    public BienResponseDTO uploadImage(String id, MultipartFile file, String userEmail) {

        BienEntity bien = bienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", id));

        // Utilisation de la méthode extraite
        String imageUrl = sauvegarderImageSurDisque(id, file);
        bien.setImageUrl(imageUrl);
        BienEntity saved = bienRepository.save(bien);

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
        BienEntity bien = bienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bien", id));

        if (!bien.getCode().equals(dto.getCode().toUpperCase())
                && bienRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Un bien avec le code " + dto.getCode() + " existe déjà");
        }

        MinistereEntity ministere = ministereRepository.findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        CategorieEntity categorie = categorieRepository.findById(dto.getCategorieId())
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", dto.getCategorieId()));

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
                .latitude(bien.getLatitude())
                .imageUrl(bien.getImageUrl())
                .longitude(bien.getLongitude())
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