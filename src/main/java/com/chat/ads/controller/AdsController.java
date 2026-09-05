package com.chat.ads.controller;

import com.chat.ads.service.AdsService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ads")
public class AdsController {

  private final AdsService adsService;

  public AdsController(AdsService adsService) {
    this.adsService = adsService;
  }

  @GetMapping("accounts")
  public Map<String, Object> accounts() {
    return adsService.accounts();
  }

  @PostMapping("accounts")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> createAccount(
      Authentication authentication, @RequestBody Map<String, String> body) {
    return adsService.createAccount(
        authentication.getName(), body.getOrDefault("name", "Ad Account"));
  }

  @GetMapping("campaigns")
  public Map<String, Object> campaigns() {
    return adsService.campaigns();
  }

  @PostMapping("campaigns")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> createCampaign(@RequestBody Map<String, Object> body) {
    long budget =
        body.get("budget") == null ? 0L : Long.parseLong(String.valueOf(body.get("budget")));
    return adsService.createCampaign(
        String.valueOf(body.get("accountId")),
        String.valueOf(body.getOrDefault("name", "Campaign")),
        budget);
  }

  @PostMapping("campaigns/{campaign}:activate")
  public Map<String, Object> activateCampaign(@PathVariable String campaign) {
    return adsService.activateCampaign(campaign);
  }

  @GetMapping("campaigns/{campaign}/creatives")
  public Map<String, Object> creatives(@PathVariable String campaign) {
    return adsService.creatives(campaign);
  }

  @PostMapping("campaigns/{campaign}/creatives")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> createCreative(
      @PathVariable String campaign, @RequestBody Map<String, String> body) {
    return adsService.createCreative(
        campaign,
        body.getOrDefault("headline", ""),
        body.get("body"),
        body.get("mediaUrl"));
  }
}
