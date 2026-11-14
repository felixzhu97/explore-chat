package com.chat.architecture;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.domain.JavaField;
import jakarta.persistence.Id;
import jakarta.persistence.Version;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class DomainEntityMappingRulesTest {

  private static final JavaClasses CLASSES = ProductionClasses.ALL;

  @Test
  @DisplayName("should not declare Id on feature domain models outside kernel packages")
  void shouldNotDeclareIdOnFeatureDomainModelsOutsideKernelPackages() {
    List<String> violations =
        CLASSES.stream()
            .filter(DomainEntityMappingRulesTest::isFeatureDomainModel)
            .flatMap(javaClass -> javaClass.getFields().stream())
            .filter(field -> field.isAnnotatedWith(Id.class))
            .map(JavaField::getFullName)
            .toList();
    assertEquals(
        List.of(),
        violations,
        "@Id is declared once on the base.domain base classes."
            + " Fix: extend AbstractEntity or AbstractImmutable and remove the field");
  }

  @Test
  @DisplayName("should not declare Version on feature domain models outside kernel packages")
  void shouldNotDeclareVersionOnFeatureDomainModelsOutsideKernelPackages() {
    List<String> violations =
        CLASSES.stream()
            .filter(DomainEntityMappingRulesTest::isFeatureDomainModel)
            .flatMap(javaClass -> javaClass.getFields().stream())
            .filter(field -> field.isAnnotatedWith(Version.class))
            .map(JavaField::getFullName)
            .toList();
    assertEquals(
        List.of(),
        violations,
        "@Version is declared once on the base.domain base classes."
            + " Fix: extend AbstractEntity or AbstractImmutable and remove the field");
  }

  private static boolean isFeatureDomainModel(JavaClass javaClass) {
    String packageName = javaClass.getPackageName();
    return packageName.contains(".domain")
        && !packageName.startsWith("com.chat.base.domain");
  }
}
