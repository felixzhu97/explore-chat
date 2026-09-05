package com.chat.ads.domain.repository;

import com.chat.ads.domain.model.AdCreative;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.ads.domain.model.AdCreative} aggregates. */
public interface AdCreativeRepository {

  AdCreative save(AdCreative creative);

  Optional<AdCreative> findById(String id);

  List<AdCreative> findByCampaignId(String campaignId);
}
