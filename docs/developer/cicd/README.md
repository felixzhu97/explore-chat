# CI/CD

ExploreChat 使用 GitHub Actions。

## 现状

| Workflow | 文件                                                                        | 说明                                          |
| -------- | --------------------------------------------------------------------------- | --------------------------------------------- |
| CI       | [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml)             | install → build packages → check-types → lint |
| Coverage | [`.github/workflows/coverage.yml`](../../../.github/workflows/coverage.yml) | 覆盖率                                        |
| CodeQL   | —                                                                           | **计划中**（见 `cicd-codeql.puml`）           |

## 图

| 文件                                       | 说明            |
| ------------------------------------------ | --------------- |
| [cicd-workflow.puml](./cicd-workflow.puml) | 工作流总览      |
| [cicd-codeql.puml](./cicd-codeql.puml)     | CodeQL 计划占位 |

```bash
plantuml docs/developer/cicd/*.puml
```

导出 PNG 可放在 `png/`。
