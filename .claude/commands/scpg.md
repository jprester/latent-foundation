---
description: Generate a new SCPG story for the Latent Foundation site
argument-hint: [rough theme, optional class hint]
---

Generate a new SCPG-format story for the Latent Foundation site.

User input: $ARGUMENTS

Interpret the input loosely:
- If empty, the ideator picks both theme and class freely.
- If a theme is given but no class, the ideator chooses the class that best fits.
- If a class hint is included (Safe / Euclid / Keter / Apollyon), honor it.

Use the `generate-scpg` skill — it owns all format, frontmatter, file-naming, and thumbnail conventions. Follow it exactly. Do not invent your own pipeline.
