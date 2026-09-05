package com.chat.media.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

  private final Path uploadDir;
  private final String publicBaseUrl;

  public MediaController(
      @Value("${chat.media.upload-dir:uploads}") String uploadDir,
      @Value("${chat.media.public-base-url:http://localhost:9001/uploads}") String publicBaseUrl)
      throws Exception {
    this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    Files.createDirectories(this.uploadDir);
    this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> uploadRoot(
      Authentication authentication, @RequestPart("file") MultipartFile file) {
    return upload(authentication, file);
  }

  @PostMapping(value = "upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> upload(
      Authentication authentication, @RequestPart("file") MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
    }
    try {
      String original = file.getOriginalFilename() == null ? "bin" : file.getOriginalFilename();
      String name = UUID.randomUUID() + "-" + original;
      Path target = uploadDir.resolve(name);
      file.transferTo(target);
      Map<String, Object> body = new HashMap<>();
      body.put("id", name);
      body.put("url", publicBaseUrl + "/" + name);
      body.put("key", name);
      String mime =
          file.getContentType() == null ? "application/octet-stream" : file.getContentType();
      body.put("mimeType", mime);
      body.put("size", file.getSize());
      body.put("uploaderId", authentication.getName());
      return body;
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed");
    }
  }
}
