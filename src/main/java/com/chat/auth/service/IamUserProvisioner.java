package com.chat.auth.service;

import com.chat.users.domain.model.ChatUser;
import com.chat.users.domain.repository.UserRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Finds or creates a {@link ChatUser} for an Explore IAM access token. */
@Service
public class IamUserProvisioner {

  static final String USERNAME_PREFIX = "iam:";

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public IamUserProvisioner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Resolves the Chat user for a validated IAM JWT (email preferred, else {@code iam:{sub}}).
   *
   * @param jwt validated Explore IAM access token
   * @return persisted Chat user
   */
  @Transactional
  public ChatUser resolve(Jwt jwt) {
    String subject = jwt.getSubject();
    if (subject == null || subject.isBlank()) {
      throw new IllegalArgumentException("IAM JWT subject is required");
    }
    String email = jwt.getClaimAsString("email");
    if (email != null && !email.isBlank()) {
      String normalized = email.trim().toLowerCase(Locale.ROOT);
      return userRepository
          .findByEmail(normalized)
          .or(() -> userRepository.findByEmail(email.trim()))
          .orElseGet(() -> create(usernameFor(subject), email.trim()));
    }
    String username = usernameFor(subject);
    return userRepository.findByUsername(username).orElseGet(() -> create(username, syntheticEmail(subject)));
  }

  private ChatUser create(String username, String email) {
    String hash = passwordEncoder.encode(UUID.randomUUID().toString());
    return userRepository.save(ChatUser.registerFromIam(username, email, hash));
  }

  static String usernameFor(String subject) {
    String compact = subject.trim().replaceAll("[^a-zA-Z0-9._-]", "_");
    if (compact.length() > 40) {
      compact = compact.substring(0, 40);
    }
    return USERNAME_PREFIX + compact;
  }

  static String syntheticEmail(String subject) {
    return usernameFor(subject) + "@users.explore.iam";
  }
}
