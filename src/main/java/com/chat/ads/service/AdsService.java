package com.chat.ads.service;

import com.chat.ads.domain.model.AdAccount;
import com.chat.ads.domain.model.AdCampaign;
import com.chat.ads.domain.model.AdCreative;
import com.chat.ads.domain.repository.AdAccountRepository;
import com.chat.ads.domain.repository.AdCampaignRepository;
import com.chat.ads.domain.repository.AdCreativeRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdsService {

  private final AdAccountRepository accountRepository;
  private final AdCampaignRepository campaignRepository;
  private final AdCreativeRepository creativeRepository;

  public AdsService(
      AdAccountRepository accountRepository,
      AdCampaignRepository campaignRepository,
      AdCreativeRepository creativeRepository) {
    this.accountRepository = accountRepository;
    this.campaignRepository = campaignRepository;
    this.creativeRepository = creativeRepository;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> accounts() {
    return Map.of(
        "accounts", accountRepository.listAll().stream().map(this::toAccount).toList());
  }

  @Transactional
  public Map<String, Object> createAccount(String ownerId, String name) {
    return toAccount(accountRepository.save(AdAccount.create(ownerId, name)));
  }

  @Transactional(readOnly = true)
  public Map<String, Object> campaigns() {
    return Map.of(
        "campaigns", campaignRepository.listAll().stream().map(this::toCampaign).toList());
  }

  @Transactional
  public Map<String, Object> createCampaign(String accountId, String name, long budget) {
    accountRepository
        .findById(accountId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
    return toCampaign(campaignRepository.save(AdCampaign.create(accountId, name, budget)));
  }

  @Transactional
  public Map<String, Object> activateCampaign(String campaignId) {
    AdCampaign campaign = requireCampaign(campaignId);
    campaign.activate();
    return toCampaign(campaignRepository.save(campaign));
  }

  @Transactional
  public Map<String, Object> createCreative(
      String campaignId, String headline, String body, String mediaUrl) {
    requireCampaign(campaignId);
    return toCreative(
        creativeRepository.save(AdCreative.create(campaignId, headline, body, mediaUrl)));
  }

  @Transactional(readOnly = true)
  public Map<String, Object> creatives(String campaignId) {
    List<Map<String, Object>> items =
        creativeRepository.findByCampaignId(campaignId).stream().map(this::toCreative).toList();
    return Map.of("creatives", items);
  }

  private AdCampaign requireCampaign(String id) {
    return campaignRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign not found"));
  }

  private Map<String, Object> toAccount(AdAccount account) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", account.getId());
    body.put("ownerId", account.getOwnerId());
    body.put("name", account.getName());
    body.put("status", account.getStatus());
    return body;
  }

  private Map<String, Object> toCampaign(AdCampaign campaign) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", campaign.getId());
    body.put("accountId", campaign.getAccountId());
    body.put("name", campaign.getName());
    body.put("status", campaign.getStatus());
    body.put("budget", campaign.getBudget());
    return body;
  }

  private Map<String, Object> toCreative(AdCreative creative) {
    Map<String, Object> body = new HashMap<>();
    body.put("id", creative.getId());
    body.put("campaignId", creative.getCampaignId());
    body.put("headline", creative.getHeadline());
    body.put("body", creative.getBody());
    body.put("mediaUrl", creative.getMediaUrl());
    body.put("status", creative.getStatus());
    return body;
  }
}
