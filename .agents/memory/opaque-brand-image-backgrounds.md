---
name: Opaque brand-image backgrounds
description: Handling checkerboard previews baked into logo pixels rather than encoded as transparency.
---

Treat checkerboard pixels in a supplied logo as image content until the alpha channel proves otherwise. Exact-color keying may leave halos when the pattern is noisy; use a threshold only on neutral mid-tone pixels, and verify the result against both light and dark backgrounds so saturated brand colors, light tagline lettering, and dark outlines remain intact.

**Why:** A supplied RGB wordmark represented transparency with a noisy opaque checker pattern, not an alpha channel, and an initial narrow color key left speckles.

**How to apply:** Inspect alpha/channel data and sample background colors before compositing any generated mark. For neutral checker patterns, separate neutral mid-tones from colored logo art and compare the transparent output over both contrasting backgrounds.