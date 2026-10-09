package com.chat.common.config;

import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

/**
 * Snake_case naming with Liquibase table overrides where the entity simple name
 * would collide with reserved words or legacy table names.
 */
@SuppressWarnings("removal")
public class ChatPhysicalNamingStrategy extends CamelCaseToUnderscoresNamingStrategy {

  private static final String USER_TABLE = "user";
  private static final String CHAT_USER_TABLE = "chat_user";
  private static final String POST_TABLE = "post";
  private static final String SOCIAL_POST_TABLE = "social_post";
  private static final String COMMENT_TABLE = "comment";
  private static final String POST_COMMENT_TABLE = "post_comment";

  @Override
  public Identifier toPhysicalTableName(Identifier logicalName, JdbcEnvironment jdbcEnvironment) {
    Identifier physical = super.toPhysicalTableName(logicalName, jdbcEnvironment);
    if (physical == null) {
      return null;
    }
    String text = physical.getText();
    if (USER_TABLE.equalsIgnoreCase(text)) {
      return Identifier.toIdentifier(CHAT_USER_TABLE, physical.isQuoted());
    }
    if (POST_TABLE.equalsIgnoreCase(text)) {
      return Identifier.toIdentifier(SOCIAL_POST_TABLE, physical.isQuoted());
    }
    if (COMMENT_TABLE.equalsIgnoreCase(text)) {
      return Identifier.toIdentifier(POST_COMMENT_TABLE, physical.isQuoted());
    }
    return physical;
  }
}
