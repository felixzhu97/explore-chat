package com.chat.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chat.users.domain.model.ChatUser;
import com.chat.users.domain.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
@DisplayName("IamUserProvisioner")
class IamUserProvisionerTest {

  @Mock private UserRepository userRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @InjectMocks private IamUserProvisioner provisioner;

  @Test
  void shouldReturnExistingUserWhenEmailMatches() {
    ChatUser existing = ChatUser.register("alice", "alice@example.com", "hash");
    when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(existing));

    ChatUser resolved = provisioner.resolve(iamJwt("sub-1", "alice@example.com"));

    assertThat(resolved).isSameAs(existing);
  }

  @Test
  void shouldCreateUserWhenIamSubjectIsNew() {
    when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode(anyString())).thenReturn("unusable");
    when(userRepository.save(any(ChatUser.class))).thenAnswer(inv -> inv.getArgument(0));

    ChatUser created = provisioner.resolve(iamJwt("sub-xyz", "new@example.com"));

    ArgumentCaptor<ChatUser> captor = ArgumentCaptor.forClass(ChatUser.class);
    verify(userRepository).save(captor.capture());
    assertThat(captor.getValue().getEmail()).isEqualTo("new@example.com");
    assertThat(captor.getValue().getUsername()).startsWith("iam:");
    assertThat(created.getEmail()).isEqualTo("new@example.com");
  }

  @Test
  void shouldCreateSyntheticEmailWhenEmailClaimMissing() {
    when(userRepository.findByUsername("iam:sub-only")).thenReturn(Optional.empty());
    when(passwordEncoder.encode(anyString())).thenReturn("unusable");
    when(userRepository.save(any(ChatUser.class))).thenAnswer(inv -> inv.getArgument(0));

    ChatUser created = provisioner.resolve(iamJwt("sub-only", null));

    assertThat(created.getUsername()).isEqualTo("iam:sub-only");
    assertThat(created.getEmail()).contains("@users.explore.iam");
  }

  private static Jwt iamJwt(String subject, String email) {
    var builder =
        Jwt.withTokenValue("t")
            .header("alg", "none")
            .subject(subject)
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(60));
    if (email != null) {
      builder.claim("email", email);
    }
    return builder.build();
  }
}
