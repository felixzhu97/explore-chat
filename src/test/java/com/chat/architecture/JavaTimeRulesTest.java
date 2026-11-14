package com.chat.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.library.freeze.FreezingArchRule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JavaTimeRulesTest {

  private static final JavaClasses CLASSES = ProductionClasses.ALL;

  @Test
  @DisplayName("should not depend on legacy date types when java time covers them")
  void shouldNotDependOnLegacyDateTypes() {
    // Existing violations are frozen in src/test/resources/archunit_store; new ones fail.
    FreezingArchRule.freeze(
            noClasses()
                .should()
                .dependOnClassesThat()
                .haveFullyQualifiedName("java.util.Date")
                .orShould()
                .dependOnClassesThat()
                .haveFullyQualifiedName("java.util.Calendar")
                .orShould()
                .dependOnClassesThat()
                .haveFullyQualifiedName("java.sql.Timestamp")
                .orShould()
                .dependOnClassesThat()
                .haveFullyQualifiedName("java.sql.Date")
                .orShould()
                .dependOnClassesThat()
                .resideInAPackage("org.joda.time..")
                .because(
                    "java.time is immutable and time-zone explicit. Fix: use Instant, LocalDate or"
                        + " ZonedDateTime and convert at the boundary"))
        .check(CLASSES);
  }

  @Test
  @DisplayName("should read the current time from an injected clock")
  void shouldReadTheCurrentTimeFromAnInjectedClock() {
    noClasses()
        .should()
        .callMethod(System.class, "currentTimeMillis")
        .because(
            "tests must control time. Fix: inject java.time.Clock and call"
                + " clock.instant() or clock.millis()")
        .check(CLASSES);
  }
}
