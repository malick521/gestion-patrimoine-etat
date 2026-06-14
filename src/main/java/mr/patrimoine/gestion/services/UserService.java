package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.dto.User.UserRequestDTO;
import mr.patrimoine.gestion.dto.User.UserResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.MinistereEntity;
import mr.patrimoine.gestion.model.entity.UserEntity;
import mr.patrimoine.gestion.model.enums.UserRole;
import mr.patrimoine.gestion.repository.MinistereRepository;
import mr.patrimoine.gestion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MinistereRepository ministereRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== CREER ====================
    public UserResponseDTO creer(UserRequestDTO dto) {

        // 1 — Email déjà utilisé ?
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email déjà utilisé");
        }

        // 2 — Ministère existe ?
        MinistereEntity ministere = ministereRepository.findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        // 3 — Construire l'entité
        UserEntity user = UserEntity.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .ministereId(dto.getMinistereId())
                .role(dto.getRole() != null ? dto.getRole() : UserRole.CONSULTANT)
                .actif(true)
                .dateCreation(LocalDateTime.now())
                .build();

        UserEntity saved = userRepository.save(user);
        return toResponseDTO(saved, ministere);
    }

    // ==================== OBTENIR TOUS ====================
    public List<UserResponseDTO> obtenirTous() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    MinistereEntity ministere = ministereRepository
                            .findById(user.getMinistereId())
                            .orElse(null);
                    return toResponseDTO(user, ministere);
                })
                .toList();
    }

    // ==================== OBTENIR PAR ID ====================
    public UserResponseDTO obtenirParId(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        MinistereEntity ministere = ministereRepository
                .findById(user.getMinistereId())
                .orElse(null);

        return toResponseDTO(user, ministere);
    }

    // ==================== OBTENIR PAR EMAIL ====================
    public UserResponseDTO obtenirParEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User avec email", email));

        MinistereEntity ministere = ministereRepository
                .findById(user.getMinistereId())
                .orElse(null);

        return toResponseDTO(user, ministere);
    }

    // ==================== OBTENIR PAR ROLE ====================
    public List<UserResponseDTO> obtenirParRole(UserRole role) {
        return userRepository.findByRole(role)
                .stream()
                .map(user -> {
                    MinistereEntity ministere = ministereRepository
                            .findById(user.getMinistereId())
                            .orElse(null);
                    return toResponseDTO(user, ministere);
                })
                .toList();
    }

    // ==================== OBTENIR PAR MINISTERE ====================
    public List<UserResponseDTO> obtenirParMinistere(String ministereId) {
        ministereRepository.findById(ministereId)
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", ministereId));

        return userRepository.findByMinistereId(ministereId)
                .stream()
                .map(user -> {
                    MinistereEntity ministere = ministereRepository
                            .findById(user.getMinistereId())
                            .orElse(null);
                    return toResponseDTO(user, ministere);
                })
                .toList();
    }

    // ==================== MODIFIER ====================
    public UserResponseDTO modifier(String id, UserRequestDTO dto) {

        // 1 — User existe ?
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        // 2 — Email déjà pris par un autre ?
        if (!user.getEmail().equals(dto.getEmail())
                && userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email déjà utilisé");
        }

        // 3 — Ministère existe ?
        MinistereEntity ministere = ministereRepository
                .findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        // 4 — Mettre à jour
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());
        user.setMinistereId(dto.getMinistereId());
        if (dto.getRole() != null) user.setRole(dto.getRole());

        // 5 — Mot de passe changé ?
        if (dto.getMotDePasse() != null && !dto.getMotDePasse().isEmpty()) {
            user.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        }

        UserEntity saved = userRepository.save(user);
        return toResponseDTO(saved, ministere);
    }

    // ==================== TOGGLE ACTIF ====================
    public UserResponseDTO toggleActif(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        user.setActif(!user.isActif());
        UserEntity saved = userRepository.save(user);

        MinistereEntity ministere = ministereRepository
                .findById(saved.getMinistereId())
                .orElse(null);

        return toResponseDTO(saved, ministere);
    }

    // ==================== SUPPRIMER ====================
    public void supprimer(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }
        userRepository.deleteById(id);
    }

    // ==================== MAPPER ====================
    private UserResponseDTO toResponseDTO(UserEntity user, MinistereEntity ministere) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .userRole(user.getRole())
                .ministereId(user.getMinistereId())
                .ministereNom(ministere != null ? ministere.getNom() : null)
                .actif(user.isActif())
                .dateCreation(user.getDateCreation())
                .build();
    }
}