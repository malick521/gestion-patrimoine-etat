package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.Categorie.CategorieRequestDTO;
import mr.patrimoine.gestion.dto.Categorie.CategorieResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.CategorieEntity;
import mr.patrimoine.gestion.model.enums.TypeBien;
import mr.patrimoine.gestion.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    // ==================== CREER ====================
    public CategorieResponseDTO creer(CategorieRequestDTO dto) {

        // 1 — Le code existe déjà ?
        if (categorieRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Une catégorie avec le code " + dto.getCode() + " existe déjà");
        }

        // 2 — Construire l'entité
        CategorieEntity categorie = CategorieEntity.builder()
                .nom(dto.getNom())
                .code(dto.getCode().toUpperCase())
                .type(dto.getType())
                .description(dto.getDescription())
                .build();

        CategorieEntity saved = categorieRepository.save(categorie);
        return toResponseDTO(saved);
    }

    // ==================== OBTENIR TOUS ====================
    public List<CategorieResponseDTO> obtenirTous() {
        return categorieRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public CategorieResponseDTO obtenirParId(String id) {
        CategorieEntity categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", id));
        return toResponseDTO(categorie);
    }

    // ==================== OBTENIR PAR CODE ====================
    public CategorieResponseDTO obtenirParCode(String code) {
        CategorieEntity categorie = categorieRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie avec le code", code));
        return toResponseDTO(categorie);
    }

    // ==================== OBTENIR PAR TYPE ====================
    public List<CategorieResponseDTO> obtenirParType(TypeBien type) {
        return categorieRepository.findByType(type)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== RECHERCHER PAR NOM ====================
    public List<CategorieResponseDTO> rechercherParNom(String nom) {
        return categorieRepository.findByNomContainingIgnoreCase(nom)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== MODIFIER ====================
    public CategorieResponseDTO modifier(String id, CategorieRequestDTO dto) {

        // 1 — Catégorie existe ?
        CategorieEntity categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", id));

        // 2 — Le nouveau code est-il déjà pris par une autre ?
        if (!categorie.getCode().equals(dto.getCode().toUpperCase())
                && categorieRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Une catégorie avec le code " + dto.getCode() + " existe déjà");
        }

        // 3 — Mettre à jour
        categorie.setNom(dto.getNom());
        categorie.setCode(dto.getCode().toUpperCase());
        categorie.setType(dto.getType());
        categorie.setDescription(dto.getDescription());

        CategorieEntity saved = categorieRepository.save(categorie);
        return toResponseDTO(saved);
    }

    // ==================== SUPPRIMER ====================
    public void supprimer(String id) {
        if (!categorieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categorie", id);
        }
        categorieRepository.deleteById(id);
    }

    // ==================== MAPPER ====================
    private CategorieResponseDTO toResponseDTO(CategorieEntity categorie) {
        return CategorieResponseDTO.builder()
                .id(categorie.getId())
                .nom(categorie.getNom())
                .code(categorie.getCode())
                .type(categorie.getType())
                .description(categorie.getDescription())
                .build();
    }
}