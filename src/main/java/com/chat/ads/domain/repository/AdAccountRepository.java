package com.chat.ads.domain.repository;

import com.chat.ads.domain.model.AdAccount;
import java.util.List;
import java.util.Optional;

/** Persistence port for {@link com.chat.ads.domain.model.AdAccount} aggregates. */
public interface AdAccountRepository {

  AdAccount save(AdAccount account);

  Optional<AdAccount> findById(String id);

  List<AdAccount> findByOwnerId(String ownerId);

  List<AdAccount> listAll();
}
