package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.config.JwtUtil;
import mr.patrimoine.gestion.dto.Auth.LoginRequestDTO;
import mr.patrimoine.gestion.dto.Auth.LoginResponseDTO;
import mr.patrimoine.gestion.dto.User.UserRequestDTO;
import mr.patrimoine.gestion.dto.User.UserResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.UserEntity;
import mr.patrimoine.gestion.repository.MinistereRepository;
import mr.patrimoine.gestion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MinistereRepository ministereRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== LOGIN ====================
    public LoginResponseDTO login(LoginRequestDTO dto) {

        // 1 — L'email existe-t-il ?
        UserEntity user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException("Email ou mot de passe incorrect"));

        // 2 — Le compte est-il actif ?
        if (!user.isActif()) {
            throw new BusinessException("Compte désactivé, contactez l'administrateur");
        }

        // 3 — Le mot de passe est-il correct ?
        if (!passwordEncoder.matches(dto.getMotDePasse(), user.getMotDePasse())) {
            throw new BusinessException("Email ou mot de passe incorrect");
        }

        // 4 — Mettre à jour la dernière connexion
        user.setDerniereConnexion(LocalDateTime.now());
        userRepository.save(user);

        // 5 — Générer le token JWT
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        // 6 — Retourner la réponse avec le token
        return LoginResponseDTO.builder()
                .token(token)
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // ==================== REGISTER ====================
    public UserResponseDTO register(UserRequestDTO dto) {

        // 1 — L'email est-il déjà pris ?
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email déjà utilisé");
        }

        // 2 — Le ministère existe-t-il ?
        var ministere = ministereRepository.findById(dto.getMinistereId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministere", dto.getMinistereId()));

        // 3 — Construire l'entité user
        UserEntity user = UserEntity.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .ministereId(dto.getMinistereId())
                .role(dto.getRole() != null ? dto.getRole() : UserEntity.Role.CONSULTANT)
                .actif(true)
                .dateCreation(LocalDateTime.now())
                .build();

        UserEntity saved = userRepository.save(user);

        // 4 — Retourner la réponse
        return UserResponseDTO.builder()
                .id(saved.getId())
                .nom(saved.getNom())
                .prenom(saved.getPrenom())
                .email(saved.getEmail())
                .role(saved.getRole())
                .ministereId(saved.getMinistereId())
                .ministereNom(ministere.getNom())
                .actif(saved.isActif())
                .dateCreation(saved.getDateCreation())
                .build();
    }
}