# Calculator review — September 16, 2026

## Added

Six service-business calculators, using the existing themes and calculator shells:

- House cleaning
- Carpet cleaning
- Dryer vent cleaning
- Pool cleaning
- Trash bin cleaning
- Solar panel cleaning

Each page includes an editable owner-time allowance, cash retained by the owner, profit after that allowance, break-even volume, startup recovery, a worked example, and dated price-source links. Published service prices support only the ticket/fee examples. Workload, time, overhead, equipment budgets and most variable costs are explicitly hypothetical, not verified market averages. New pages are linked from the homepage, local-service and mobile-service categories, related pages, and sitemap.

## Corrections

- Shared ratios show N/A rather than zero when the denominator is nonpositive; losses remain visible.
- Equipment recovery includes recurring costs and uses 52/12 weeks per month.
- Food-truck recovery is labeled required profit, not sales.
- Pest-control recovery uses editable profit per customer rather than full customer revenue. Other trade-startup recovery assumptions are editable.
- Bounce-house event recovery includes insurance consistently with monthly recovery.
- AI voice, chatbot and automation agency break-even uses fixed costs divided by recurring per-client contribution, excluding setup revenue.
- Lawn monthly and seasonal totals follow the selected weekly, biweekly or one-time schedule. Zero hours and zero jobs are no longer silently forced positive.
- B2B stump rental scenarios default the separate equipment loan to zero; costs are clearly additive.
- Washer/dryer rental operating profit is separate from investment in additional sets; cash after growth is also displayed.
- Drone editing time now has an editable cost rate; close rate determines required leads.
- Previously unused golf, RC session and grill-repeat fields now produce workload outputs.
- Mobile grooming distinguishes cash invested from loan payments and defaults to a cash purchase.
- Appliance repair contribution is no longer labeled full billed revenue; diagnostic-credit treatment is explained.
- Mailbox HOA revenue has a corresponding editable direct-cost allowance.
- Domain-flipping impossible fee scenarios and paint estimation with zero coverage show N/A.
- API monetary outputs retain cents.
- Shared validation rejects blank/negative inputs and out-of-range percentage inputs; correcting the input restores results. Forms do not submit/reload on Enter.
- Calculator labels are at least 14px with reduced letter spacing.

## Verification

- `node tests/formulas.cjs`: all 54 shared configurations and 412+ numerical assertions passed, including zero work, losses, owner cash vs. labor allowance, and monthly pool billing.
- Temporary JSDOM verification: all 86 HTML pages loaded; 73 calculator pages passed runtime/input checks; 1,069 local link/asset references resolved. Additional regressions checked inline AI break-even, lawn schedules and zero paint coverage.
- Sitemap contains 86 unique URLs.
- These checks establish tested arithmetic and page behavior, not future demand, local pricing, accounting completeness or earnings accuracy for every business.
