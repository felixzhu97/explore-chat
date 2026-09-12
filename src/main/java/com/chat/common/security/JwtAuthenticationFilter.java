package com.chat.common.security;

import com.chat.auth.service.IamUserProvisioner;
import com.chat.auth.service.JwtTokenService;
import com.chat.users.domain.model.ChatUser;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Dual-track Bearer auth: Chat HS access tokens ({@code ROLE_USER} only), or Explore IAM JWTs with
 * GitHub-style {@code SCOPE_*} authorities plus {@code ROLE_USER}.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenService jwtTokenService;
  private final ObjectProvider<JwtDecoder> iamJwtDecoder;
  private final ObjectProvider<IamUserProvisioner> iamUserProvisioner;

  public JwtAuthenticationFilter(
      JwtTokenService jwtTokenService,
      ObjectProvider<JwtDecoder> iamJwtDecoder,
      ObjectProvider<IamUserProvisioner> iamUserProvisioner) {
    this.jwtTokenService = jwtTokenService;
    this.iamJwtDecoder = iamJwtDecoder;
    this.iamUserProvisioner = iamUserProvisioner;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      if (!authenticateChatHs(token)) {
        authenticateIam(token);
      }
    }
    filterChain.doFilter(request, response);
  }

  private boolean authenticateChatHs(String token) {
    try {
      Claims claims = jwtTokenService.parseAccess(token);
      var auth =
          new UsernamePasswordAuthenticationToken(
              claims.getSubject(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
      SecurityContextHolder.getContext().setAuthentication(auth);
      return true;
    } catch (RuntimeException ignored) {
      SecurityContextHolder.clearContext();
      return false;
    }
  }

  private void authenticateIam(String token) {
    JwtDecoder decoder = iamJwtDecoder.getIfAvailable();
    IamUserProvisioner provisioner = iamUserProvisioner.getIfAvailable();
    if (decoder == null || provisioner == null) {
      return;
    }
    try {
      Jwt jwt = decoder.decode(token);
      ChatUser user = provisioner.resolve(jwt);
      if (user.isDeleted() || user.isDisabled()) {
        SecurityContextHolder.clearContext();
        return;
      }
      List<SimpleGrantedAuthority> authorities = new ArrayList<>();
      for (String scope : scopesFrom(jwt)) {
        authorities.add(new SimpleGrantedAuthority("SCOPE_" + scope));
      }
      if (authorities.isEmpty()) {
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
      }
      var auth = new UsernamePasswordAuthenticationToken(user.getId(), null, authorities);
      SecurityContextHolder.getContext().setAuthentication(auth);
    } catch (RuntimeException ignored) {
      SecurityContextHolder.clearContext();
    }
  }

  /** Parses space-delimited {@code scope} or list {@code scp} claims from an IAM JWT. */
  public static List<String> scopesFrom(Jwt jwt) {
    Object scopeClaim = jwt.getClaims().get("scope");
    if (scopeClaim instanceof String scopeString && !scopeString.isBlank()) {
      return Arrays.stream(scopeString.split("\\s+")).filter(s -> !s.isBlank()).toList();
    }
    Object scp = jwt.getClaims().get("scp");
    if (scp instanceof List<?> list) {
      return list.stream().map(Object::toString).filter(s -> !s.isBlank()).toList();
    }
    return List.of();
  }
}
