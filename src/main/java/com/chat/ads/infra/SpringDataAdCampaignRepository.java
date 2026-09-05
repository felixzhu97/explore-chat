package com.chat.ads.infra;

import com.chat.ads.domain.model.AdCampaign;
import com.chat.ads.domain.repository.AdCampaignRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataAdCampaignRepository
    extends JpaRepository<AdCampaign, String>, AdCampaignRepository {

  @Override
  List<AdCampaign> findByAccountId(String accountId);

  @Override
  default List<AdCampaign> listAll() {
    return findAll();
  }
}
