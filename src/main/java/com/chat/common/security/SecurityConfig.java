package com.chat.common.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Chat API security: public auth endpoints; IAM module scopes for messaging / social / admin when
 * Bearer is an Explore IAM JWT.
 *
 * @see <a
 *     href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps">GitHub
 *     OAuth scopes</a>
 */
@Configuration
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter)
      throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(Customizer.withDefaults())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/actuator/health", "/actuator/info", "/api/v1/health")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/v1/auth/register",
                        "/api/v1/auth/login",
                        "/api/v1/auth/forgotPassword",
                        "/api/v1/auth/resetPassword")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/refreshToken")
                    .permitAll()
                    .requestMatchers("/api/v1/admin/**")
                    .hasAuthority("SCOPE_admin:chat")
                    .requestMatchers(
                        "/api/v1/chats/**",
                        "/api/v1/calls/**",
                        "/api/v1/media/**",
                        "/api/v1/notifications/**")
                    .hasAnyAuthority("ROLE_USER", "SCOPE_write:chat_messaging")
                    .requestMatchers(
                        "/api/v1/posts/**",
                        "/api/v1/users/**",
                        "/api/v1/groups/**",
                        "/api/v1/status/**",
                        "/api/v1/search/**")
                    .hasAnyAuthority("ROLE_USER", "SCOPE_write:chat_social")
                    .requestMatchers("/api/v1/**")
                    .authenticated()
                    .anyRequest()
                    .permitAll())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
