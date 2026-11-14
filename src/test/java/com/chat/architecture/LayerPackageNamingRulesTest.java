package com.chat.architecture;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class LayerPackageNamingRulesTest {

  private static final JavaClasses CLASSES = ProductionClasses.ALL;

  private static final Set<String> FORBIDDEN_PACKAGE_SEGMENTS =
      Set.of("usecase", "adapter", "port");

  private static final List<String> FORBIDDEN_CLASS_SUFFIXES =
      List.of("UseCase", "Facade", "Impl", "Adapter", "Port");

  @Test
  @DisplayName("should not use legacy web application or infrastructure layer package names")
  void shouldNotUseLegacyLayerPackageNames() {
    List<String> violations =
        CLASSES.stream()
            .filter(LayerPackageNamingRulesTest::isFeatureModuleClass)
            .filter(LayerPackageNamingRulesTest::usesLegacyLayerPackage)
            .map(JavaClass::getName)
            .toList();
    assertEquals(
        List.of(),
        violations,
        "Feature modules use controller / service / domain / infra / mapper packages."
            + " Fix: move web -> controller, application -> service,"
            + " infrastructure -> infra");
  }

  @Test
  @DisplayName("should not use use case adapter or port package names")
  void shouldNotUseUseCaseAdapterOrPortPackageNames() {
    List<String> violations =
        CLASSES.stream()
            .map(JavaClass::getPackageName)
            .filter(name -> name.startsWith("com.chat."))
            .filter(LayerPackageNamingRulesTest::hasForbiddenPackageSegment)
            .distinct()
            .toList();
    assertEquals(
        List.of(),
        violations,
        "Hexagonal port/adapter naming is not used here."
            + " Fix: put interfaces in <feature>/domain/repository, implementations in"
            + " <feature>/infra, orchestration in <feature>/service");
  }

  @Test
  @DisplayName("should not use vague class name suffixes")
  void shouldNotUseVagueClassNameSuffixes() {
    List<String> violations =
        CLASSES.stream()
            .filter(javaClass -> javaClass.getPackageName().startsWith("com.chat"))
            .filter(javaClass -> javaClass.getEnclosingClass().isEmpty())
            .filter(javaClass -> hasForbiddenSuffix(javaClass.getSimpleName()))
            .map(JavaClass::getName)
            .toList();
    assertEquals(
        List.of(),
        violations,
        "UseCase, Facade, Impl, Adapter and Port say nothing about the domain."
            + " Fix: name the class after its role, e.g. PolicyService, JpaUserRepository,"
            + " ScimOutboundGateway");
  }

  @Test
  @DisplayName("should not prefix interfaces with I")
  void shouldNotPrefixInterfacesWithI() {
    List<String> violations =
        CLASSES.stream()
            .filter(javaClass -> javaClass.getPackageName().startsWith("com.chat"))
            .filter(JavaClass::isInterface)
            .filter(javaClass -> javaClass.getSimpleName().matches("I[A-Z][a-z]\\w*"))
            .map(JavaClass::getName)
            .toList();
    assertEquals(
        List.of(),
        violations,
        "Interfaces carry the domain name. Fix: rename IUserRepository to"
            + " UserRepository and give the implementation a specific name");
  }

  private static boolean hasForbiddenPackageSegment(String packageName) {
    for (String segment : packageName.split("\\.")) {
      if (FORBIDDEN_PACKAGE_SEGMENTS.contains(segment)) {
        return true;
      }
    }
    return false;
  }

  private static boolean hasForbiddenSuffix(String simpleName) {
    return FORBIDDEN_CLASS_SUFFIXES.stream().anyMatch(simpleName::endsWith);
  }

  private static boolean isFeatureModuleClass(JavaClass javaClass) {
    String packageName = javaClass.getPackageName();
    return packageName.startsWith("com.chat.") && !packageName.startsWith("com.chat.common");
  }

  private static boolean usesLegacyLayerPackage(JavaClass javaClass) {
    String packageName = javaClass.getPackageName();
    return packageName.contains(".web.")
        || packageName.contains(".application.")
        || packageName.endsWith(".web")
        || packageName.endsWith(".application")
        || packageName.contains(".infrastructure.")
        || packageName.endsWith(".infrastructure");
  }
}
