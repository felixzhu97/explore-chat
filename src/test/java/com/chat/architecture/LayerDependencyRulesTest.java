package com.chat.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.library.freeze.FreezingArchRule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

class LayerDependencyRulesTest {

  private static final JavaClasses CLASSES = ProductionClasses.ALL;

  @Test
  @DisplayName("should keep domain free of outer layers when a feature is built")
  void shouldKeepDomainFreeOfOuterLayers() {
    noClasses()
        .that()
        .resideInAPackage("com.chat..domain..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage(
            "com.chat..controller..",
            "com.chat..service..",
            "com.chat..infra..",
            "com.chat..mapper..")
        .because(
            "domain is the core every other layer depends on and must stay testable alone."
                + " Fix: declare an interface in <feature>/domain/repository and implement it"
                + " in <feature>/infra, or move the logic up into <feature>/service")
        .check(CLASSES);
  }

  @Test
  @DisplayName("should not reach controllers when service or infra code runs")
  void shouldNotReachControllersFromServiceOrInfra() {
    // Existing violations are frozen in src/test/resources/archunit_store; new ones fail.
    FreezingArchRule.freeze(
            noClasses()
                .that()
                .resideInAnyPackage("com.chat..service..", "com.chat..infra..")
                .should()
                .dependOnClassesThat()
                .resideInAPackage("com.chat..controller..")
                .because(
                    "controllers are the outermost layer and their DTOs are an HTTP contract."
                        + " Fix: pass domain types or a service-level record instead of"
                        + " controller DTOs, and map in <feature>/mapper or the controller"))
        .check(CLASSES);
  }

  @Test
  @DisplayName("should not register domain types as Spring beans")
  void shouldNotRegisterDomainTypesAsSpringBeans() {
    noClasses()
        .that()
        .resideInAPackage("com.chat..domain..")
        .should()
        .beAnnotatedWith(Service.class)
        .orShould()
        .beAnnotatedWith(Component.class)
        .because(
            "domain objects are plain models; wiring belongs to the application layer."
                + " Fix: move the bean to <feature>/service, or to <feature>/infra if it"
                + " implements a domain repository")
        .check(CLASSES);
  }

  @Test
  @DisplayName("should keep feature modules free of dependency cycles")
  void shouldKeepFeatureModulesFreeOfDependencyCycles() {
    // Existing violations are frozen in src/test/resources/archunit_store; new ones fail.
    FreezingArchRule.freeze(
            slices()
                .matching("com.chat.(*)..")
                .should()
                .beFreeOfCycles()
                .because(
                    "a cycle means neither module can change or be tested alone."
                        + " Fix: move the shared type to com.chat.common, or publish a domain event"
                        + " instead of calling back"))
        .check(CLASSES);
  }

  @Test
  @DisplayName("should keep domain free of Spring when a model is defined")
  void shouldKeepDomainFreeOfSpring() {
    noClasses()
        .that()
        .resideInAPackage("com.chat..domain..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage("org.springframework..")
        .because(
            "domain models must be testable without a Spring context."
                + " Fix: keep annotations to Jakarta Persistence and Validation, and move"
                + " Spring-aware code to <feature>/service or <feature>/infra")
        .check(CLASSES);
  }
}
