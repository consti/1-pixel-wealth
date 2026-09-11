# 1 pixel wealth

A static, dependency-free visualization: one CSS pixel of colored area represents
$1,000. Open `index.html` directly, or serve the folder with any static file server.
No build step, API key, backend, or live data request is needed.

Published at [consti.github.io/1-pixel-wealth](https://consti.github.io/1-pixel-wealth/).
GitHub Pages serves the repository root from the `translation` default branch.
The `.nojekyll` file keeps publishing as plain static files. Updates to that
branch are published automatically.

The journey scrolls horizontally by default. The direction control switches to
vertical scrolling while preserving your place. Compare fortunes selects a new
person; jump controls navigate to comparison markers. Mouse wheels, trackpads,
touch swipes, arrow keys, Page Up/Down, Home and End are supported.

## Wealth snapshot

Source: [Forbes Real-Time Billionaires](https://www.forbes.com/real-time-billionaires/).
Verified September 11, 2026. Source timestamp: **September 11, 2026, 1:50 p.m. EDT**.
All estimates are in USD and come from the same snapshot.

| Person          |      Net worth |
| --------------- | -------------: |
| Elon Musk       | $922.7 billion |
| Larry Page      | $279.8 billion |
| Michael Dell    | $274.2 billion |
| Jeff Bezos      | $273.2 billion |
| Sergey Brin     | $257.5 billion |
| Mark Zuckerberg | $223.3 billion |
| Larry Ellison   | $197.9 billion |
| Jensen Huang    | $189.9 billion |

Estimates include assets, not just cash. The source changes over time; the page
intentionally displays a dated, fixed snapshot. To refresh, update all entries and
the timestamp in `wealth-data.js`, along with the initial HTML text, metadata,
source notes, no-JavaScript fallback, and this README.

## Scale

Area = net worth / 1,000. Each long block's length = area / its cross-axis
thickness. Thickness fits the viewport and is identical for the billion-dollar
benchmark and the selected fortune. Both scroll directions use the same formula.
Small examples also use area: $1M is 1,000 pixels, a square with sides √1,000.
Browser subpixel rounding is unavoidable. Comparison-dialog bars are explicitly
labeled as a compressed overview, not part of the literal pixel scale.

The footer measures money passed at the viewport's leading edge. Switching axes
or resizing preserves the current section and proportional progress through it.

## Original essay

Adapted from [Matt Korostoff’s 1 Pixel Wealth](https://mkorostoff.github.io/1-pixel-wealth/),
under the existing GPL-3.0 license. The original essay and historical figures are
preserved in `2020.html`; `de/` remains its German translation. These use the
original `main.css` and `main.js`. Serve the folder over HTTP to load the German
archive, which uses the original translation loader.

## Restored context and sticky storytelling

`wealth-context.js` holds the sourced context benchmarks. They retain their
reported dollar amounts and source years; we do not inflate older figures into
2026 dollars. The page compares annual income, lifetime earnings, annual costs,
and funding gaps with a stock of net worth, with those distinctions stated.

| Comparison                                   |                  Benchmark | Source period                                                                         |
| -------------------------------------------- | -------------------------: | ------------------------------------------------------------------------------------- |
| Median US household income                   |                    $83,730 | Census, 2024 income                                                                   |
| Lifetime earnings, bachelor's degree         |                      $2.8M | Georgetown CEW, 2021 study                                                            |
| Employer-sponsored family insurance premiums |               $26,993/year | KFF, 2025                                                                             |
| Illustrative Amazon pay                      |               $47,840/year | $23 × 40 × 52; Amazon's September 2025 announcement says average pay exceeds $23/hour |
| Projected malaria funding gap                |                      $5.4B | WHO: 2024 funding versus 2025 target                                                  |
| WFP assistance for 110 million people        |                       $13B | 2026 operational requirement                                                          |
| $10,000 household payments                   | 1% of the selected fortune | Hypothetical arithmetic                                                               |
| National US cancer-care spending             |                    $208.9B | NCI, 2020 dollars                                                                     |
| Annual water/sanitation spending gap         |              $131.4–140.8B | World Bank, 2024 report                                                               |
| Forbes 400 combined wealth                   |                      $6.6T | September 1, 2025 snapshot                                                            |
| Malaria + food + upper water benchmark       |                    $159.2B | Sum of the dated benchmarks above                                                     |

Every comparison links its primary source on the page. Shares, equivalents,
remaining wealth, and payment counts recalculate for the selected person. A cost
that exceeds a smaller fortune is explicitly labeled; percentage rings cap their
visual fill at 100%, while their numeric labels show the actual percentage.
The aggregate Forbes 400 benchmark includes a different date and is labeled as
such. Funding amounts are not promises of outcomes or costed implementation plans.

Narratives and milestone labels use `position: sticky` within finite windows of
the real wealth block. Labels pin and then release; the wealth and exact marker
boundaries continue moving. Windows avoid collisions with other markers and do
not add any area to the fortune. Money squares use the original $1,000-per-pixel
scale; rings and the 400-person dot grid are explicitly different visual units.

Use **Explore statistics**, the **Jump to** menu, or **Next statistic** to revisit
these sections. Narrow or short viewports allow the narrative itself to scroll
so that its source and navigation remain accessible.
