package com.chat.common.config;

import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

/** Snake_case naming; maps entity User to chat_user ({@code user} is a reserved word). */
@SuppressWarnings("removal")
public class ChatPhysicalNamingStrategy extends CamelCaseToUnderscoresNamingStrategy {

  private static final String USER_TABLE = "user";
  private static final String CHAT_USER_TABLE = "chat_user";

  @Override
  public Identifier toPhysicalTableName(Identifier logicalName, JdbcEnvironment jdbcEnvironment) {
    Identifier physical = super.toPhysicalTableName(logicalName, jdbcEnvironment);
    if (physical != null && USER_TABLE.equalsIgnoreCase(physical.getText())) {
      return Identifier.toIdentifier(CHAT_USER_TABLE, physical.isQuoted());
    }
    return physical;
  }
}
