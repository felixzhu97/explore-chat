package com.chat.ads.infra;

import com.chat.ads.domain.model.AdCreative;
import com.chat.ads.domain.repository.AdCreativeRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataAdCreativeRepository
    extends JpaRepository<AdCreative, String>, AdCreativeRepository {

  @Override
  List<AdCreative> findByCampaignId(String campaignId);
}
