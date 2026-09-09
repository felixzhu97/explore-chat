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
 * Dual-track Bearer auth: Chat HS access tokens, or Explore IAM JWTs mapped to {@link ChatUser}.
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
      var auth =
          new UsernamePasswordAuthenticationToken(
              user.getId(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
      SecurityContextHolder.getContext().setAuthentication(auth);
    } catch (RuntimeException ignored) {
      SecurityContextHolder.clearContext();
    }
  }
}
