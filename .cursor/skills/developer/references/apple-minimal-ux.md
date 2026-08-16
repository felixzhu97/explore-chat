# Design Philosophy — Apple HIG + Minimal UI

UX and visual decisions for this product must follow **Apple Human Interface Guidelines** and a **minimal** aesthetic: clarity over decoration, fewer elements, purposeful motion.

## Official sources (required)

Primary hub:

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Design](https://developer.apple.com/design/)

Foundations (read the page that matches the change):

| Topic                 | Official doc                                                                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                | [Layout](https://developer.apple.com/design/human-interface-guidelines/layout)                                                                                                                |
| Typography            | [Typography](https://developer.apple.com/design/human-interface-guidelines/typography)                                                                                                        |
| Color                 | [Color](https://developer.apple.com/design/human-interface-guidelines/color)                                                                                                                  |
| Icons                 | [Icons](https://developer.apple.com/design/human-interface-guidelines/icons)                                                                                                                  |
| Materials / hierarchy | [Materials](https://developer.apple.com/design/human-interface-guidelines/materials)                                                                                                          |
| Motion                | [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)                                                                                                                |
| Feedback / progress   | [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) / [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) |
| Accessibility         | [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)                                                                                                  |
| Writing / content     | [Writing](https://developer.apple.com/design/human-interface-guidelines/writing)                                                                                                              |

Secondary pattern reference (not a substitute for HIG):

- [shadcn/ui — Apple](https://www.shadcn.io/design/apple)
- [shadcn/ui — OpenAI](https://www.shadcn.io/design/openai)

When citing UX in commits/PRs, prefer the specific HIG page above (see also [dependency-docs UX table](dependency-docs.md)).

## Design philosophy

| Principle         | Meaning                               | Practice                                                  |
| ----------------- | ------------------------------------- | --------------------------------------------------------- |
| **Clarity**       | Content and actions are obvious       | One primary action per view; remove unused chrome         |
| **Deference**     | UI supports content, does not compete | Quiet backgrounds; typography and spacing carry hierarchy |
| **Depth**         | Hierarchy without clutter             | Subtle layers/elevation only when they aid understanding  |
| **Feedback**      | Every action has a clear response     | Loading, success, error — immediate and calm              |
| **Consistency**   | Same patterns for same jobs           | Reuse existing components; match platform expectations    |
| **Accessibility** | Usable by everyone                    | Contrast, hit targets, labels, keyboard / screen reader   |

Apple framing: technology should feel **invisible**; simplicity is sophistication.

## Minimal style (this product)

**Do**

- Prefer whitespace and type hierarchy over boxes, borders, and heavy shadows
- One clear visual focus per screen / section
- Short labels; plain language (align copy with Domain Glossary Preferred Terms where shown to users via i18n)
- Motion only to explain state change (HIG Motion) — short, purposeful
- Default to system-like neutrals; one accent for primary actions

**Don't**

- Decorative gradients, glow stacks, emoji ornament, badge spam
- Card-in-card nesting, dense icon rows, competing CTAs
- Custom chrome that fights the platform (fake skeuomorphism, noisy glassmorphism)
- Adding UI “just in case” — if it does not serve a user goal, omit it

## UI implementation checklist

- [ ] Decision checked against the relevant **Apple HIG** page (link in PR/notes when non-obvious)
- [ ] Minimal: removing an element would not hurt understanding or task completion
- [ ] Feedback for async/error states exists and is non-blocking where possible
- [ ] Accessibility: contrast, focus, labels (HIG Accessibility)
- [ ] Angular UI details: [angular-developer](../../angular-developer/SKILL.md)
