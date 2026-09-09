package com.chat.common.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.chat.auth.service.IamUserProvisioner;
import com.chat.auth.service.JwtTokenService;
import com.chat.users.domain.model.ChatUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter")
class JwtAuthenticationFilterTest {

  @Mock private JwtTokenService jwtTokenService;
  @Mock private ObjectProvider<JwtDecoder> iamJwtDecoder;
  @Mock private ObjectProvider<IamUserProvisioner> iamUserProvisioner;
  @Mock private JwtDecoder decoder;
  @Mock private IamUserProvisioner provisioner;
  @Mock private HttpServletRequest request;
  @Mock private HttpServletResponse response;
  @Mock private FilterChain filterChain;

  private JwtAuthenticationFilter filter;

  @BeforeEach
  void setUp() {
    filter = new JwtAuthenticationFilter(jwtTokenService, iamJwtDecoder, iamUserProvisioner);
    SecurityContextHolder.clearContext();
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void shouldAuthenticateWithIamJwtWhenChatHsFails() throws Exception {
    when(request.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer iam-token");
    when(jwtTokenService.parseAccess("iam-token")).thenThrow(new RuntimeException("not hs"));
    when(iamJwtDecoder.getIfAvailable()).thenReturn(decoder);
    when(iamUserProvisioner.getIfAvailable()).thenReturn(provisioner);
    Jwt jwt =
        Jwt.withTokenValue("iam-token")
            .header("alg", "none")
            .subject("sub")
            .claim("email", "a@b.com")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(60))
            .build();
    when(decoder.decode("iam-token")).thenReturn(jwt);
    ChatUser user = ChatUser.register("alice", "a@b.com", "hash");
    when(provisioner.resolve(jwt)).thenReturn(user);

    filter.doFilter(request, response, filterChain);

    assertThat(SecurityContextHolder.getContext().getAuthentication().getName())
        .isEqualTo(user.getId());
  }
}
