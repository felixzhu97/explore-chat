package com.chat.ads.domain.repository;

import com.chat.ads.domain.model.AdCampaign;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.ads.domain.model.AdCampaign} aggregates. */
public interface AdCampaignRepository {

  AdCampaign save(AdCampaign campaign);

  Optional<AdCampaign> findById(String id);

  List<AdCampaign> findByAccountId(String accountId);

  List<AdCampaign> listAll();
}
