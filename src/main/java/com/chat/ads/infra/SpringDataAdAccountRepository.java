package com.chat.ads.infra;

import com.chat.ads.domain.model.AdAccount;
import com.chat.ads.domain.repository.AdAccountRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataAdAccountRepository
    extends JpaRepository<AdAccount, String>, AdAccountRepository {

  @Override
  List<AdAccount> findByOwnerId(String ownerId);

  @Override
  default List<AdAccount> listAll() {
    return findAll();
  }
}
