package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.Ministere.MinistereRequestDTO;
import mr.patrimoine.gestion.dto.Ministere.MinistereResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.MinistereEntity;
import mr.patrimoine.gestion.repository.MinistereRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MinistereService {

    @Autowired
    private MinistereRepository ministereRepository;

    // ==================== CREER ====================
    public MinistereResponseDTO creer(MinistereRequestDTO dto) {

        // 1 — Le code existe déjà ?
        if (ministereRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Un ministère avec le code " + dto.getCode() + " existe déjà");
        }

        // 2 — Construire l'entité
        MinistereEntity ministere = MinistereEntity.builder()
                .nom(dto.getNom())
                .code(dto.getCode().toUpperCase())
                .responsable(dto.getResponsable())
                .description(dto.getDescription())
                .telephone(dto.getTelephone())
                .email(dto.getEmail())
                .adresse(dto.getAdresse())
                .actif(true)
                .dateCreation(LocalDateTime.now())
                .build();

        MinistereEntity saved = ministereRepository.save(ministere);

        return toResponseDTO(saved);
    }

    // ==================== OBTENIR TOUS ====================
    public List<MinistereResponseDTO> obtenirTous() {
        return ministereRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public MinistereResponseDTO obtenirParId(String id) {
        MinistereEntity ministere = ministereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", id));
        return toResponseDTO(ministere);
    }

    // ==================== OBTENIR PAR CODE ====================
    public MinistereResponseDTO obtenirParCode(String code) {
        MinistereEntity ministere = ministereRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Ministere avec le code", code));
        return toResponseDTO(ministere);
    }

    // ==================== RECHERCHER PAR NOM ====================
    public List<MinistereResponseDTO> rechercherParNom(String nom) {
        return ministereRepository.findByNomContainingIgnoreCase(nom)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== MINISTERES ACTIFS ====================
    public List<MinistereResponseDTO> obtenirActifs() {
        return ministereRepository.findByActif(true)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // ==================== MODIFIER ====================
    public MinistereResponseDTO modifier(String id, MinistereRequestDTO dto) {

        // 1 — Ministère existe ?
        MinistereEntity ministere = ministereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", id));

        // 2 — Le nouveau code est-il déjà pris par un autre ?
        if (!ministere.getCode().equals(dto.getCode().toUpperCase())
                && ministereRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Un ministère avec le code " + dto.getCode() + " existe déjà");
        }

        // 3 — Mettre à jour les champs
        ministere.setNom(dto.getNom());
        ministere.setCode(dto.getCode().toUpperCase());
        ministere.setResponsable(dto.getResponsable());
        ministere.setDescription(dto.getDescription());
        ministere.setTelephone(dto.getTelephone());
        ministere.setEmail(dto.getEmail());
        ministere.setAdresse(dto.getAdresse());

        MinistereEntity saved = ministereRepository.save(ministere);
        return toResponseDTO(saved);
    }

    // ==================== ACTIVER / DESACTIVER ====================
    public MinistereResponseDTO toggleActif(String id) {
        MinistereEntity ministere = ministereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", id));

        ministere.setActif(!ministere.isActif());
        MinistereEntity saved = ministereRepository.save(ministere);
        return toResponseDTO(saved);
    }

    // ==================== SUPPRIMER ====================
    public void supprimer(String id) {
        if (!ministereRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ministere", id);
        }
        ministereRepository.deleteById(id);
    }

    // ==================== MAPPER ====================
    private MinistereResponseDTO toResponseDTO(MinistereEntity ministere) {
        return MinistereResponseDTO.builder()
                .id(ministere.getId())
                .nom(ministere.getNom())
                .code(ministere.getCode())
                .responsable(ministere.getResponsable())
                .description(ministere.getDescription())
                .telephone(ministere.getTelephone())
                .email(ministere.getEmail())
                .adresse(ministere.getAdresse())
                .actif(ministere.isActif())
                .dateCreation(ministere.getDateCreation())
                .build();
    }
}