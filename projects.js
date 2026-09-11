/* ==========================================================================
   Projects: the single source for the home-page index, the sticky panel and
   each project page (work.html?p=<id>).

   Honesty rules this file follows:
   - Business figures (revenue, GMV, balances, spend) stay inside the company.
   - Every count here was taken from the codebase or a tool's own output.
   - The small illustrations are schematic, not data.

   Diagram coordinates live on a 998-wide grid (height per diagram); nodes
   are 178 × 66 and sit in columns at x = 20 / 280 / 540 / 800.
   Node kinds: data · service · guard · llm · ext · person.
   ========================================================================== */

window.PROJECTS = [
  /* ------------------------------------------------------------------ 01 */
  {
    id: "pnl-statement",
    title: "P&L Statement & Accounting",
    hook: "See how a month-end number ties out",
    kpi: { v: "26", l: "statement columns" },
    themes: ["Finance", "Reconciliation"],
    stack: ["PostgreSQL", "Next.js", "TypeScript", "Zoho Books API"],
    viz: "pnl",
    vizLabel: "buyer paid → net, per order",
    desc: "A per-order profit-and-loss statement finance can argue with line by line, and then prove: every cell opens the orders that sum to it, on order, delivery or invoice date.",
    stats: [
      { v: "26", l: "statement columns, 8 derived" },
      { v: "3", l: "date bases to bucket by" },
      { v: "23", l: "API routes behind it" }
    ],
    quote: "A total is only as good as the orders behind it.",
    lede: "Finance needed one monthly statement they could argue with line by line, and then prove. I built a per-order profit-and-loss statement where every cell opens the orders that sum to it.",
    context: [
      "Order values, delivery costs, returns, commissions and penalties lived in different tables with different dates. <strong>A month's number changed depending on who pulled it and which date they used</strong>, so month-end turned into a debate about definitions instead of the business.",
      "The fix wasn't a prettier chart. It was one statement, defined once, that anyone could open down to the order."
    ],
    diagram: {
      h: 370,
      nodes: [
        { id: "orders", k: "data", x: 20, y: 30, t: "Orders", s: "order lines · items · discounts", d: "Every order line with its items, prices and discounts: the base the statement is built from." },
        { id: "delivery", k: "data", x: 20, y: 152, t: "Delivery & RTO", s: "courier cost · return legs", d: "Courier delivery charges and return-to-origin legs, which change a month's P&L after the order is placed." },
        { id: "seller", k: "data", x: 20, y: 274, t: "Seller settlements", s: "commission · penalties", d: "What each seller is owed, minus commission and penalties." },
        { id: "basis", k: "guard", x: 280, y: 30, t: "Date basis", s: "order · delivery · invoice", d: "The same statement bucketed by order, delivery or invoice date, the three answers finance actually asks for. It's a parameter, not three copies of the query." },
        { id: "sql", k: "service", x: 280, y: 152, t: "Statement SQL", s: "26 columns · 8 derived, once", d: "One statement query: 26 columns, 8 of them derived. Each derivation is written once, in SQL, so no screen computes its own version." },
        { id: "ist", k: "guard", x: 280, y: 274, t: "IST session", s: "every connection, Asia/Kolkata", d: "Every database session runs in IST, so an order placed at 11:50 pm lands on the right day and in the right month." },
        { id: "zoho", k: "ext", x: 540, y: 30, t: "Zoho Books API", s: "P&L report · invoices", d: "A Zoho Books client (token refresh, P&L report, invoices), so the accounting books can sit beside the platform's own P&L." },
        { id: "ui", k: "service", x: 540, y: 152, t: "P&L statement", s: "month over month · CSV", d: "The month-over-month statement, with CSV export and a delivery-partner filter." },
        { id: "drill", k: "service", x: 540, y: 274, t: "Drill-down", s: "any cell → its orders", d: "Click any cell to get the orders that sum to it. If a total looks wrong, the rows that caused it are one click away." },
        { id: "finance", k: "person", x: 800, y: 152, t: "Finance", s: "signs off month-end", d: "The people who sign off month-end, who can now argue with a line and then prove it." }
      ],
      edges: [
        { f: "orders", t: "sql", to: -14 },
        { f: "delivery", t: "sql" },
        { f: "seller", t: "sql", to: 14 },
        { f: "basis", t: "sql", l: "param" },
        { f: "ist", t: "sql" },
        { f: "sql", t: "ui" },
        { f: "zoho", t: "ui", l: "beside" },
        { f: "ui", t: "drill", l: "click" },
        { f: "ui", t: "finance" }
      ]
    },
    build: [
      { t: "26 columns, eight derived, each derived once", d: "Discounts, what the buyer owes and paid, what the seller is owed, commission and penalties, delivery and RTO costs, down to net P&L. Eight columns are derived, and <strong>each derivation is written once, in SQL</strong>, so no screen can compute its own version." },
      { t: "Three answers to “which month?”", d: "A basis switch buckets the same statement by <strong>order date, delivery date or invoice date</strong>, the three answers finance actually asks for, without three copies of the query." },
      { t: "Every cell drills down", d: "Click any figure to get the orders behind it, with CSV export and a delivery-partner filter. If a total looks wrong, the rows that caused it are one click away." },
      { t: "IST on every connection", d: "Every database session runs in <code>Asia/Kolkata</code>. An order placed at 11:50 pm lands on the right day and in the right month, not the UTC one." },
      { t: "The books beside the platform", d: "A Zoho Books API client (token refresh, P&L report, invoices) so the accounting books can sit next to the platform's own P&L. Bulk “orders pushed” approvals record who approved and when, in the audit log." },
      { t: "Show the query", d: "The SQL behind each section is one click away: <code>&lt;/&gt;</code> shows the query, its parameters and a copy button, captured from the same call that fed the table." }
    ],
    numbers: [
      { v: "26", l: "statement columns", h: "8 of them derived. Counted from the statement definition in the code." },
      { v: "3", l: "date bases", h: "Order, delivery and invoice date, switched by one parameter." },
      { v: "23", l: "API routes", h: "Route files behind the P&L dashboard, counted September 2026." }
    ],
    note: "Revenue, margins and net P&L stay inside the company. What's public here is how the statement is built; the counts come from the codebase.",
    lessons: [
      "A total is only as good as the orders behind it.",
      "Write a derivation once. Every screen that recomputes it is a second opinion.",
      "Month-end arguments are usually about dates, not money."
    ]
  },

  /* ------------------------------------------------------------------ 02 */
  {
    id: "cod-remittance",
    title: "COD Remittance Reconciliation",
    hook: "See why re-running a sheet changes nothing",
    kpi: { v: "4,985", l: "orders backfilled" },
    themes: ["Finance", "Reconciliation", "Controls"],
    stack: ["Next.js", "PostgreSQL", "Excel parsing", "Transactions", "Audit log"],
    viz: "cod",
    vizLabel: "one sheet · a verdict per row",
    desc: "Couriers pay cash-on-delivery money back in batches, with a spreadsheet. Upload it, and every row is matched to an order and previewed with a verdict before anything is written.",
    stats: [
      { v: "5", l: "verdicts per row, in preview" },
      { v: "₹1", l: "tolerance before a mismatch" },
      { v: "2", l: "courier formats, auto-detected" }
    ],
    quote: "Preview first. Write once. Re-running changes nothing.",
    lede: "Couriers pay cash-on-delivery money back in batches, with a spreadsheet. I turned that spreadsheet into settled orders: matched, previewed, then written in one step that is safe to repeat.",
    context: [
      "Each courier sends a different sheet format. Matching thousands of rows to orders by hand meant <strong>settlement dates went missing, short payments went unnoticed</strong>, and nobody could say for sure which orders had actually been paid.",
      "So the tool had two jobs: read any sheet a courier sends, and never let a person write money they haven't seen first."
    ],
    diagram: {
      h: 370,
      nodes: [
        { id: "sheet", k: "ext", x: 20, y: 30, t: "Courier sheet", s: "Delhivery or Ekart, .xlsx", d: "Couriers send cash-on-delivery money back in batches, each with its own spreadsheet format." },
        { id: "parser", k: "service", x: 280, y: 30, t: "Parser", s: "format from column shape", d: "Parses the Excel file and recognises Delhivery or Ekart from its column shape, so nobody picks a template, and nobody picks the wrong one." },
        { id: "matcher", k: "service", x: 540, y: 30, t: "Matcher", s: "AWB first, order ID second", d: "Matches each row on the courier's AWB, falling back to the order ID. Re-sent parcels for one order have their amounts summed and keep the latest date." },
        { id: "preview", k: "guard", x: 800, y: 30, t: "Preview", s: "5 verdicts · nothing written", d: "Every row gets one of five verdicts (will update, already set, no match, no date, not delivered), and amounts off by more than ₹1 show as a mismatch. Nothing is written yet." },
        { id: "orders", k: "data", x: 540, y: 152, t: "Orders", s: "AWB · order ID · amount due", d: "The platform's orders: AWB, order ID and the amount that should have been collected." },
        { id: "operator", k: "person", x: 800, y: 152, t: "Operator", s: "reviews, then Apply", d: "A person reviews the preview and decides. The tool never settles money on its own." },
        { id: "audit", k: "data", x: 540, y: 274, t: "Audit log", s: "who ran which sheet", d: "Every apply is logged with who ran it." },
        { id: "apply", k: "guard", x: 800, y: 274, t: "Apply", s: "one transaction · idempotent", d: "One transaction. Rows that are already set stay as they are, so re-running the same sheet changes nothing." }
      ],
      edges: [
        { f: "sheet", t: "parser" },
        { f: "parser", t: "matcher" },
        { f: "orders", t: "matcher", l: "lookup" },
        { f: "matcher", t: "preview" },
        { f: "preview", t: "operator" },
        { f: "operator", t: "apply" },
        { f: "apply", t: "orders", l: "settle", fo: -12 },
        { f: "apply", t: "audit", l: "log", fo: 12 }
      ]
    },
    build: [
      { t: "The sheet tells you what it is", d: "The Excel file is parsed and recognised as <strong>Delhivery or Ekart from its column shape</strong>. Nobody picks a template, so nobody picks the wrong one." },
      { t: "AWB first, order ID second", d: "Rows match on the courier's AWB, falling back to the order ID, so a sheet carrying either key still reconciles." },
      { t: "Five verdicts before a single write", d: "<code>will update</code> · <code>already set</code> · <code>no match</code> · <code>no date</code> · <code>not delivered</code>. The operator sees exactly what Apply will do before it does it." },
      { t: "₹1 tolerance, then it's a mismatch", d: "Over- or under-collection shows as a difference; anything off by more than ₹1 counts as an amount mismatch. Re-sent parcels for the same order have their amounts summed and keep the latest date." },
      { t: "Idempotent by construction", d: "The write runs in <strong>one transaction</strong>. Rows that are already set stay as they are, so re-running the same sheet changes nothing, and a double-click is harmless." },
      { t: "Every apply leaves a name", d: "Each apply is audit-logged with who ran it, so “which sheet settled this order?” has an answer months later." }
    ],
    numbers: [
      { v: "4,985", l: "orders backfilled", h: "Settled through this tool, order by order, from courier sheets." },
      { v: "5", l: "verdicts per row", h: "will update · already set · no match · no date · not delivered." },
      { v: "₹1", l: "mismatch tolerance", h: "Anything off by more than ₹1 is flagged as an amount mismatch." }
    ],
    note: "4,985 is how many orders were settled through the tool, not money recovered. Its value is that nobody has to guess which orders were paid.",
    lessons: [
      "Preview first. Write once.",
      "If running it twice is dangerous, it isn't finished.",
      "A mismatch you can see beats a total that looks right."
    ]
  },

  /* ------------------------------------------------------------------ 03 */
  {
    id: "refund-fraud",
    title: "Refund & Claim-Fraud Controls",
    hook: "See how a flag waits for evidence",
    kpi: { v: "0–100", l: "buyer claim score" },
    themes: ["Controls", "Finance"],
    stack: ["PostgreSQL", "Next.js", "Slack webhooks", "CSV / Excel export"],
    viz: "fraud",
    vizLabel: "flag only after 6 orders + 3 claims",
    desc: "Support looks up an order, sees a LOW / MEDIUM / HIGH risk rating and the buyer's claim history, then approves a refund or a seller deduction. A companion view scores every buyer 0–100 on claim behaviour.",
    stats: [
      { v: "60/25/15", l: "score weights, published" },
      { v: "6 + 3", l: "orders and claims before a flag" },
      { v: "10 min", l: "to a Slack alert if unrefunded" }
    ],
    quote: "Flag the pattern, not the person. Evidence first.",
    lede: "Refunds are where money leaks quietly. I built the desk support uses to approve them, the tracker finance uses to chase them, and the score that shows who is abusing them.",
    context: [
      "Undelivered, damaged and partial-delivery claims were approved case by case, <strong>with no history in front of the approver</strong>. Paid orders that were later rejected or cancelled could sit unrefunded without anyone noticing.",
      "Both problems are silent. So the design goal was to put evidence in front of the person approving, and make the silence alert."
    ],
    diagram: {
      h: 370,
      nodes: [
        { id: "support", k: "person", x: 20, y: 30, t: "Support", s: "order number or AWB", d: "Support looks up the order by number or AWB when a buyer says it was undelivered, damaged or short." },
        { id: "desk", k: "service", x: 280, y: 30, t: "Refund desk", s: "risk rating + claim history", d: "Shows a LOW / MEDIUM / HIGH risk rating and the buyer's claim history, lets support correct the quantity actually delivered, then approve." },
        { id: "wallet", k: "data", x: 540, y: 30, t: "Wallet entries", s: "refund or seller deduction", d: "The approval lands as a buyer refund or a seller deduction, with the approver recorded on the entry." },
        { id: "history", k: "data", x: 20, y: 152, t: "Claim history", s: "orders · claims · outcomes", d: "Every buyer's orders and claims: the raw material for the score." },
        { id: "score", k: "guard", x: 280, y: 152, t: "Claim score", s: "0–100 · 60 / 25 / 15", d: "0–100: 60% claim rate, 25% number of claims, 15% completed orders, in four risk levels. Rules fire only after 6 orders and 3 claims." },
        { id: "method", k: "service", x: 540, y: 152, t: "Methodology page", s: "weights, published", d: "The weights are published, so anyone challenging a score can see exactly how it was computed." },
        { id: "paid", k: "data", x: 20, y: 274, t: "Paid, then rejected", s: "rejected or cancelled orders", d: "Orders the buyer paid for that were later rejected or cancelled: where refunds used to go missing." },
        { id: "tracker", k: "service", x: 280, y: 274, t: "Refund tracker", s: "refunded vs pending · median", d: "Refunded vs still pending, average and median refund time, CSV export." },
        { id: "slack", k: "ext", x: 540, y: 274, t: "Slack alert", s: "unrefunded after 10 min", d: "A Slack alert when an order is still unrefunded 10 minutes after rejection or cancellation." }
      ],
      edges: [
        { f: "support", t: "desk", l: "look up" },
        { f: "desk", t: "wallet", l: "approve" },
        { f: "history", t: "score" },
        { f: "score", t: "desk", l: "rating" },
        { f: "score", t: "method", l: "explained" },
        { f: "paid", t: "tracker" },
        { f: "tracker", t: "slack", l: "10 min" }
      ]
    },
    build: [
      { t: "A desk with the history in front of you", d: "Look up an order by number or AWB, see the risk rating and the buyer's claim history, <strong>correct the quantity actually delivered</strong>, then approve a buyer refund or a seller deduction. The approver is recorded on the entry." },
      { t: "A score anyone can check", d: "Every buyer gets 0–100: <strong>60% claim rate, 25% number of claims, 15% completed orders</strong>, in four risk levels, with seller and buyer drill-downs and a methodology page that publishes the weights." },
      { t: "Evidence before a flag", d: "Rules fire only after <strong>at least 6 orders and 3 claims</strong>, so a new buyer with one bad delivery isn't branded a fraud." },
      { t: "Nobody forgets a refund", d: "A tracker for paid orders later rejected or cancelled: refunded vs pending, average and median refund time, CSV export, and a <strong>Slack alert when an order is still unrefunded 10 minutes</strong> after rejection or cancellation." }
    ],
    numbers: [
      { v: "60/25/15", l: "score weights", h: "Claim rate, number of claims, completed orders. Published on the methodology page." },
      { v: "6 + 3", l: "evidence before a flag", h: "At least 6 orders and 3 claims before a rule can fire." },
      { v: "10 min", l: "to an unrefunded alert", h: "Paid orders still unrefunded 10 minutes after rejection or cancellation." }
    ],
    note: "None of these measure fraud caught; that would need a baseline I don't have. They describe the controls: what fires, when, and on what evidence.",
    lessons: [
      "Flag the pattern, not the person.",
      "Publish the weights, and a disputed score becomes a conversation.",
      "Money leaks quietly, so make the silence alert."
    ]
  },

  /* ------------------------------------------------------------------ 04 */
  {
    id: "ledger-pools",
    title: "Ledger Pools & Payout Approvals",
    hook: "See why money only moves in pairs",
    kpi: { v: "5", l: "funding pools" },
    themes: ["Finance", "Controls"],
    stack: ["PostgreSQL", "Transactions", "Next.js", "Audit log", "CSV export"],
    viz: "ledger",
    vizLabel: "both sides · one transaction",
    desc: "The platform funds coupons, commissions, delivery and returns from separate pools. This shows every rupee in and out of them by IST day, moves money between them safely, and approves payouts with a guard against double-processing.",
    stats: [
      { v: "5", l: "pools, coupon to master" },
      { v: "1", l: "transaction per transfer, both sides" },
      { v: "0", l: "processed payouts that can be flipped" }
    ],
    quote: "Money moves in pairs, or it doesn't move.",
    lede: "The platform funds coupons, commissions, delivery and returns out of separate pools. I built the view that shows every rupee in and out of them, and the controls that move money between them safely.",
    context: [
      "Pool balances were checked by hand, <strong>a transfer could be recorded on one side only</strong>, and a pool running dry was noticed only after something failed.",
      "On a money path, “usually right” isn't a standard. The guarantees had to live in the transaction, not in someone's care."
    ],
    diagram: {
      h: 370,
      nodes: [
        { id: "pools", k: "data", x: 20, y: 152, t: "Funding pools", s: "coupon · commission · delivery · RTO · master", d: "Five pools fund the platform's spend: coupons, commissions, delivery, returns (RTO) and a master pool." },
        { id: "daily", k: "service", x: 280, y: 30, t: "Daily ledger", s: "money in / out by IST day", d: "Every rupee in and out of each pool by IST day, drilling down to individual entries. IST-safe bucketing kept 3,787 ledger postings off the wrong date." },
        { id: "floor", k: "guard", x: 540, y: 30, t: "Minimum-balance alarm", s: "blinks red near the floor", d: "Each pool has a minimum. A pool about to hit it blinks red, before something downstream fails." },
        { id: "transfer", k: "guard", x: 280, y: 152, t: "Transfer", s: "both sides · one transaction", d: "Debits one pool and credits the other in one transaction, blocks double-submits and caps each transfer. Money moves in pairs, or it doesn't move." },
        { id: "ops", k: "person", x: 540, y: 152, t: "Finance ops", s: "moves money, capped", d: "Finance ops moves money between pools from the dashboard, within a per-transfer cap." },
        { id: "audit", k: "data", x: 800, y: 152, t: "Audit log", s: "who · what · which build", d: "Transfers and approvals are logged with who did it, what they did and which build of the code did it." },
        { id: "approver", k: "person", x: 20, y: 274, t: "Named approvers", s: "only they can approve", d: "Only named approvers can approve a payout." },
        { id: "payouts", k: "service", x: 280, y: 274, t: "Payout approvals", s: "approve or cancel, one at a time", d: "Approve or cancel payouts one at a time, with CSV export." },
        { id: "guard", k: "guard", x: 540, y: 274, t: "Processed-state guard", s: "a processed payout can't flip", d: "A payout that's already processed can't be flipped back, so nothing is paid twice." },
        { id: "rail", k: "ext", x: 800, y: 274, t: "Payout rail", s: "money leaves the platform", d: "Where approved money actually leaves the platform." }
      ],
      edges: [
        { f: "pools", t: "daily", fo: -18 },
        { f: "daily", t: "floor" },
        { f: "ops", t: "transfer", l: "request" },
        { f: "transfer", t: "pools", l: "both sides", to: 12 },
        { f: "ops", t: "audit", l: "logged" },
        { f: "approver", t: "payouts" },
        { f: "payouts", t: "guard" },
        { f: "guard", t: "rail", fo: 12 },
        { f: "guard", t: "audit", fo: -12 }
      ]
    },
    build: [
      { t: "Five pools, one view", d: "Coupon, commission, delivery, RTO and master, with daily money-in and money-out that drills down to individual entries, bucketed by IST day. <strong>IST-safe bucketing kept 3,787 ledger postings off the wrong date.</strong>" },
      { t: "Transfers post both sides or neither", d: "A transfer debits one pool and credits the other in <strong>one transaction</strong>, blocks double-submits and caps each transfer." },
      { t: "A floor you can see coming", d: "Each pool has a minimum. A pool about to hit it blinks red, before something downstream fails." },
      { t: "Approvals that can't be undone by accident", d: "Approve or cancel payouts one at a time. <strong>A payout that's already processed can't be flipped</strong>, and only named approvers can approve." },
      { t: "Who, what and which build", d: "Transfers and approvals are audit-logged with the user, the action and the build of the code that did it." }
    ],
    numbers: [
      { v: "5", l: "funding pools", h: "Coupon, commission, delivery, RTO and master." },
      { v: "1", l: "transaction per transfer", h: "Both sides post together, or neither does." },
      { v: "3,787", l: "postings on the right day", h: "Ledger postings that IST-safe day bucketing kept off the wrong date." }
    ],
    note: "No balances here: pool sizes are company figures. These numbers describe the guarantees, which is what matters on a money path.",
    lessons: [
      "Money moves in pairs, or it doesn't move.",
      "An alarm before the floor beats a post-mortem after it.",
      "“Who changed this?” should always have an answer."
    ]
  },

  /* ------------------------------------------------------------------ 05 */
  {
    id: "delivery-tat",
    title: "Order Dashboard & Delivery TAT",
    hook: "See why one stuck parcel can't hide",
    kpi: { v: "p90", l: "TAT, not averages" },
    themes: ["Ops"],
    stack: ["PostgreSQL", "Next.js", "Recharts", "react-simple-maps"],
    viz: "tat",
    vizLabel: "p50 · p90 · p25–p75 band",
    desc: "The dashboard the platform started with. Nine tabs over every order, from the monthly GMV goal gauge and India maps down to how many days a parcel took to arrive.",
    stats: [
      { v: "9", l: "tabs over every order" },
      { v: "6", l: "speed bands, 0–3 to 15+ days" },
      { v: "2", l: "delivery flows on one TAT panel" }
    ],
    quote: "One stuck parcel shouldn't hide inside an average.",
    lede: "The dashboard the platform started with: nine tabs over every order, from the monthly GMV goal down to how many days a parcel took to arrive.",
    context: [
      "Leadership wanted one answer each morning: <strong>are we on track this month?</strong> Ops wanted another: <strong>where are deliveries slow?</strong> Both lived in ad-hoc queries that nobody ran the same way twice.",
      "Averages made it worse. One parcel stuck for a month drags a healthy mean, or hides inside one."
    ],
    diagram: {
      h: 370,
      nodes: [
        { id: "orders", k: "data", x: 20, y: 30, t: "Orders", s: "status · timestamps · flow", d: "Every order with its status history and timestamps, across courier and same-day flows." },
        { id: "scope", k: "guard", x: 20, y: 152, t: "Flow scope", s: "one parameter, two flows", d: "Courier or same-day local delivery, chosen by one parameter. The same panel serves both flows instead of a copy." },
        { id: "scans", k: "ext", x: 20, y: 274, t: "Courier scans", s: "Delhivery · Ekart", d: "Delhivery and Ekart scan events, which say where a parcel actually was." },
        { id: "funnel", k: "service", x: 280, y: 30, t: "Status funnel", s: "Draft → … → Delivered", d: "Draft → Placed → Pending → In Progress → Dispatched → Delivered, by month, state and status, with completion and rejection rates." },
        { id: "pct", k: "service", x: 280, y: 152, t: "TAT percentiles", s: "p50 · p90 · p100", d: "p50 / p90 / p100 order-to-delivery time month over month, with the p25–p75 range shaded. A widening band means consistency is slipping." },
        { id: "stage", k: "service", x: 280, y: 274, t: "Stage split", s: "where the days go", d: "A stage-wise split of TAT and courier-journey time from scans, so a slow month points at the leg that lost the days." },
        { id: "goal", k: "service", x: 540, y: 30, t: "GMV goal", s: "gauge · target vs achieved", d: "The monthly GMV goal gauge and target-vs-achieved table leadership opens each morning, beside state and district maps." },
        { id: "bands", k: "guard", x: 540, y: 152, t: "Speed bands", s: "6 bands, each opens its orders", d: "Six speed bands (0–3, 4–5, 6–7, 8–10, 11–15 and 15+ days), each opening the orders inside it." },
        { id: "people", k: "person", x: 800, y: 91, t: "Ops & leadership", s: "one answer each morning", d: "Leadership asks “are we on track?”, ops asks “where are we slow?”. One dashboard answers both." }
      ],
      edges: [
        { f: "orders", t: "funnel" },
        { f: "orders", t: "pct", to: -14 },
        { f: "scope", t: "pct", l: "param", to: 8 },
        { f: "scans", t: "stage" },
        { f: "stage", t: "pct", l: "legs" },
        { f: "funnel", t: "goal" },
        { f: "pct", t: "bands" },
        { f: "goal", t: "people", to: -12 },
        { f: "bands", t: "people", to: 12 }
      ]
    },
    build: [
      { t: "One answer each morning", d: "A monthly GMV goal gauge and a target-vs-achieved table for leadership, beside India state, district and delivery-flow maps." },
      { t: "Percentiles, not averages", d: "<strong>p50 / p90 / p100</strong> order-to-delivery time month over month, with the p25–p75 range shaded. A widening band means consistency is slipping, even when the median looks fine." },
      { t: "Six bands, each with its list", d: "0–3, 4–5, 6–7, 8–10, 11–15 and 15+ days. <strong>Every band opens the orders inside it</strong>, so “slow” always comes with the shipments that were slow." },
      { t: "Where the time goes", d: "A stage-wise split, and courier-journey TAT from Delhivery and Ekart scans, show which leg lost the days." },
      { t: "One panel, two flows", d: "The same TAT panel serves third-party courier and same-day local deliveries, <strong>scoped by one parameter</strong> instead of a copy that drifts." }
    ],
    numbers: [
      { v: "9", l: "tabs", h: "Over every order, from the GMV goal to delivery TAT." },
      { v: "6", l: "speed bands", h: "0–3, 4–5, 6–7, 8–10, 11–15 and 15+ days, each drillable." },
      { v: "2", l: "delivery flows", h: "Courier and same-day, one TAT panel, one parameter." }
    ],
    note: "Delivery times themselves are company figures. The point is the shape: percentiles and bands that make a slow tail visible.",
    lessons: [
      "One stuck parcel shouldn't hide inside an average.",
      "“Slow” is a list of shipments, not an adjective.",
      "Reuse the panel; scope it with a parameter."
    ]
  },

  /* ------------------------------------------------------------------ 06 */
  {
    id: "meta-attribution",
    title: "Meta Campaign → First-Order Attribution",
    hook: "See spend judged on retailers who order",
    kpi: { v: "7", l: "stages, install to delivered" },
    themes: ["Growth"],
    stack: ["PostgreSQL", "Next.js", "Install referrer", "Meta Marketing API", "Caching"],
    viz: "attr",
    vizLabel: "install → delivered, per campaign",
    desc: "Marketing could see clicks and installs in Meta. They couldn't see which campaign produced retailers who actually ordered. This follows every campaign through seven stages, from install to delivered order.",
    stats: [
      { v: "7", l: "stages, install to delivered" },
      { v: "1", l: "query for every campaign" },
      { v: "30 min", l: "cache, so it stays fast" }
    ],
    quote: "Judge spend on retailers who order, not on installs.",
    lede: "Marketing could see clicks and installs in Meta. They couldn't see which campaign produced retailers who actually ordered. I built the view that follows each campaign all the way to a delivered order.",
    context: [
      "Ad platforms report their own conversions. The business question, <strong>which spend turns into ordering, repeat retailers</strong>, needed our own data joined to the campaign.",
      "It also needed one set of numbers the external performance-marketing agency and the business both accepted."
    ],
    diagram: {
      h: 380,
      nodes: [
        { id: "ads", k: "ext", x: 20, y: 30, t: "Meta Ads", s: "campaign · ad set · ad", d: "Campaigns, ad sets and ads running on Meta. Meta reports its own conversions; this view doesn't rely on them." },
        { id: "ref", k: "data", x: 280, y: 30, t: "Install referrer", s: "campaign ID on each install", d: "Each install carries its campaign ID in the referrer. The dashboard reads it and ties the install to the campaign." },
        { id: "buyers", k: "data", x: 280, y: 152, t: "Our buyers", s: "OTP · carts · orders", d: "Our own buyers: OTP sign-in, content and brand views, carts, orders and deliveries." },
        { id: "funnel", k: "service", x: 540, y: 91, t: "7-stage funnel", s: "install → delivered, drillable", d: "App Installed → OTP Verified → View Content → Brand View → Add to Cart → Purchased → Delivered. Each stage after install counts distinct, non-test buyers, and stages aren't forced to nest, so the funnel never invents drop-off." },
        { id: "cache", k: "guard", x: 540, y: 200, t: "One query, cached", s: "every campaign · 30 min", d: "Every campaign comes back in one query, cached for 30 minutes, so the page stays fast as campaigns multiply." },
        { id: "api", k: "ext", x: 280, y: 296, t: "Meta Marketing API", s: "spend · clicks · installs", d: "Spend, impressions, clicks and installs by campaign and ad set, from Meta's reporting API." },
        { id: "spend", k: "service", x: 540, y: 296, t: "Spend view", s: "CTR · CPD · CAC · ROAS", d: "Spend, CTR, cost per download, CAC and ROAS by campaign and ad set, next to the funnel." },
        { id: "agency", k: "person", x: 800, y: 172, t: "Marketing & agency", s: "one agreed set of numbers", d: "The performance-marketing agency and the business read one agreed set of numbers." }
      ],
      edges: [
        { f: "ads", t: "ref", l: "install" },
        { f: "ref", t: "funnel", to: -12 },
        { f: "buyers", t: "funnel", l: "join", to: 12 },
        { f: "cache", t: "funnel" },
        { f: "funnel", t: "agency", to: -12 },
        { f: "api", t: "spend" },
        { f: "spend", t: "agency", to: 12 }
      ]
    },
    build: [
      { t: "The campaign ID, from the install itself", d: "Each install's referrer carries the campaign ID. The dashboard reads it and joins it to our own buyers, so <strong>attribution is ours, not the ad platform's</strong>." },
      { t: "Seven stages, each drillable", d: "App Installed → OTP Verified → View Content → Brand View → Add to Cart → Purchased → Delivered, with every stage opening the buyers in it." },
      { t: "No invented drop-off", d: "Stages aren't forced to nest (a buyer can add to cart without a brand view), so the funnel doesn't show drop-off that didn't happen. Every stage after install counts <strong>distinct, non-test buyers</strong>." },
      { t: "Every campaign in one query", d: "One query returns every campaign, <strong>cached for 30 minutes</strong>, so the page stays fast as campaigns multiply." },
      { t: "Spend next to outcome", d: "Spend, CTR, cost per download, CAC and ROAS by campaign and ad set beside the funnel, plus an acquisition view (install → OTP sign-in → cart → first order) by state and brand." }
    ],
    numbers: [
      { v: "7", l: "funnel stages", h: "App install to delivered order, each drillable to buyers." },
      { v: "1", l: "query", h: "Every campaign in one round trip." },
      { v: "30 min", l: "cache", h: "So the page stays fast as campaigns multiply." }
    ],
    note: "No spend, CAC or ROAS figures here; those belong to the business. A same-day campaign can legitimately show zero matches until its installs carry the referrer. That's timing, not a bug.",
    lessons: [
      "Judge spend on retailers who order, not on installs.",
      "Don't let a funnel invent drop-off.",
      "The ad platform grades its own homework. Join your own data."
    ]
  },

  /* ------------------------------------------------------------------ 07 */
  {
    id: "loyalty-ai",
    title: "Loyalty Scheme Analytics + AI Analyst",
    hook: "See why the model gets no database",
    kpi: { v: "0", l: "database queries by the model" },
    themes: ["Growth", "AI"],
    stack: ["PostgreSQL", "Next.js", "Anthropic SDK", "Claude Haiku 4.5"],
    viz: "loyalty",
    vizLabel: "within 25% of the next tier",
    desc: "Tracks a tiered loyalty scheme end to end: who qualifies, who is within 25% of the next tier, and whether rewarded buyers keep ordering. A Claude-powered analyst answers questions in plain English from the dashboard's own numbers.",
    stats: [
      { v: "25%", l: "near-miss window to the next tier" },
      { v: "13", l: "API routes, 5 tabs" },
      { v: "0", l: "database queries by the model" }
    ],
    quote: "The model reads the dashboard. It doesn't get its own database.",
    lede: "A tiered loyalty scheme rewards retailers for hitting purchase targets. I built the dashboard that shows who's qualifying, who's almost there, and whether rewards actually build habits, plus an AI analyst that answers questions about it in plain English.",
    context: [
      "The scheme team could see who qualified, but not <strong>the buyers one push away from the next tier</strong>, or whether rewarded buyers kept ordering afterwards.",
      "They also wanted to ask questions without waiting for me. That's where the AI analyst comes in, with one hard rule about what it can touch."
    ],
    diagram: {
      h: 370,
      nodes: [
        { id: "orders", k: "data", x: 20, y: 91, t: "Orders", s: "purchases against targets", d: "Retailer purchases, measured against each tier's target." },
        { id: "qualify", k: "service", x: 280, y: 30, t: "Qualification", s: "tiers by purchase target", d: "Who qualifies for which tier of the scheme." },
        { id: "near", k: "service", x: 540, y: 30, t: "Near-miss list", s: "within 25% of the next tier", d: "Everyone within 25% of the next tier: the buyers one push away, ready for a nudge." },
        { id: "cohorts", k: "service", x: 280, y: 152, t: "Reward cohorts", s: "still ordering, month by month", d: "Retention after reward, month by month: did rewarded buyers keep ordering, or was it a one-off?" },
        { id: "numbers", k: "data", x: 540, y: 152, t: "Dashboard numbers", s: "pre-computed, on screen", d: "The dashboard's own pre-computed figures: the same numbers on screen." },
        { id: "guard", k: "guard", x: 800, y: 30, t: "No database access", s: "the model reads the screen", d: "The model never queries the database. It's handed the numbers the dashboard already computed." },
        { id: "ai", k: "llm", x: 800, y: 152, t: "AI analyst", s: "Claude Haiku 4.5", d: "Claude Haiku 4.5 answers questions in plain English, grounded in the dashboard's numbers, so every answer can be checked against the screen." },
        { id: "scheme", k: "service", x: 540, y: 274, t: "Scheme editor", s: "every gift edit logged", d: "Scheme creation inside the dashboard, with every gift edit logged." },
        { id: "team", k: "person", x: 800, y: 274, t: "Scheme team", s: "asks in plain English", d: "The scheme team asks questions in plain English, and creates schemes from the same dashboard." }
      ],
      edges: [
        { f: "orders", t: "qualify" },
        { f: "orders", t: "cohorts" },
        { f: "qualify", t: "near" },
        { f: "near", t: "numbers" },
        { f: "cohorts", t: "numbers" },
        { f: "numbers", t: "ai", l: "context" },
        { f: "guard", t: "ai" },
        { f: "team", t: "ai", l: "asks" },
        { f: "team", t: "scheme", l: "creates" }
      ]
    },
    build: [
      { t: "The buyers one push away", d: "Anyone <strong>within 25% of the next tier</strong>, listed and ready for a nudge. It's the most actionable list in the scheme." },
      { t: "Did the reward build a habit?", d: "Retention cohorts after reward, month by month, separate rewarded buyers who kept ordering from one-off orders." },
      { t: "Schemes created where they're measured", d: "Scheme creation lives inside the dashboard, with <strong>every gift edit logged</strong>." },
      { t: "An analyst that reads the screen", d: "Claude Haiku 4.5 answers questions in plain English, grounded in the dashboard's own pre-computed numbers. <strong>It never queries the database</strong>, so every answer can be checked against the screen." }
    ],
    numbers: [
      { v: "25%", l: "near-miss window", h: "Buyers within a quarter of the next tier's target." },
      { v: "13", l: "API routes", h: "Route files behind the scheme dashboard, counted September 2026." },
      { v: "0", l: "database queries by the model", h: "It reads the dashboard's pre-computed numbers." }
    ],
    note: "No scheme results here. The 0 is the number that matters engineering-wise: an AI answer you can check against the screen.",
    lessons: [
      "The model reads the dashboard. It doesn't get its own database.",
      "Near-miss is the most actionable list in a loyalty scheme.",
      "Measure the habit, not the reward."
    ]
  }
];

/* ==========================================================================
   Schematic illustrations (220 × 116). currentColor = the row's ink.
   ========================================================================== */

window.VIZ = {
  pnl: () => `
    <svg viewBox="0 0 220 116" aria-hidden="true">
      <line class="v-line" x1="14" y1="98" x2="206" y2="98" opacity=".5"/>
      <rect class="v-accs" x="22" y="18" width="20" height="80" rx="2"/>
      <rect class="v-acc" x="22" y="18" width="20" height="80" rx="2"/>
      <rect class="v-line" x="54" y="18" width="20" height="44" rx="2"/>
      <rect class="v-line" x="86" y="62" width="20" height="9" rx="2"/>
      <rect class="v-line" x="118" y="71" width="20" height="7" rx="2"/>
      <rect class="v-line" x="150" y="78" width="20" height="5" rx="2"/>
      <rect class="v-accf" x="182" y="83" width="20" height="15" rx="2"/>
      <path class="v-dash" d="M42 18h12M74 62h12M106 71h12M138 78h12M170 83h12" opacity=".7"/>
      <text class="v-t" x="32" y="12" text-anchor="middle">paid</text>
      <text class="v-ta" x="192" y="77" text-anchor="middle">net</text>
    </svg>`,

  cod: () => `
    <svg viewBox="0 0 220 116" aria-hidden="true">
      <rect class="v-line" x="16" y="10" width="88" height="92" rx="4"/>
      <rect class="v-soft" x="16" y="10" width="88" height="14" rx="4"/>
      ${[34, 50, 66, 82].map((y, i) => `
        <rect class="v-fill" x="24" y="${y - 2}" width="${[42, 34, 46, 30][i]}" height="3" rx="1.5" opacity=".45"/>
        <rect class="v-fill" x="76" y="${y - 2}" width="18" height="3" rx="1.5" opacity=".3"/>`).join("")}
      <path class="v-line" d="M104 33 C128 33 128 30 146 30" opacity=".6"/>
      <path class="v-line" d="M104 49 C128 49 128 48 146 48" opacity=".6"/>
      <path class="v-line" d="M104 65 C128 65 128 66 146 66" opacity=".6"/>
      <path class="v-line" d="M104 81 C128 81 128 84 146 84" opacity=".6"/>
      <circle class="v-accf" cx="150" cy="30" r="3.4"/>
      <circle class="v-fill" cx="150" cy="48" r="3.4" opacity=".5"/>
      <circle class="v-warn" cx="150" cy="66" r="3.4"/>
      <circle class="v-accf" cx="150" cy="84" r="3.4"/>
      <text class="v-ta" x="159" y="33">update</text>
      <text class="v-t" x="159" y="51">already set</text>
      <text class="v-t" x="159" y="69" style="fill:var(--warn)">no match</text>
      <text class="v-ta" x="159" y="87">update</text>
    </svg>`,

  fraud: () => {
    const calm = [[26, 88], [34, 80], [44, 92], [56, 84], [66, 90], [74, 76], [86, 86], [96, 72], [104, 88], [118, 80], [128, 90], [140, 70], [150, 84], [164, 78], [176, 88], [188, 74], [198, 86], [122, 64], [160, 60], [84, 62]];
    const hot = [[134, 32], [172, 24], [194, 40]];
    const young = [[30, 30], [44, 22]];
    return `
    <svg viewBox="0 0 220 116" aria-hidden="true">
      <line class="v-line" x1="14" y1="100" x2="206" y2="100" opacity=".5"/>
      <line class="v-line" x1="14" y1="100" x2="14" y2="10" opacity=".5"/>
      <line class="v-dash" x1="62" y1="48" x2="206" y2="48" style="stroke:var(--warn)"/>
      <line class="v-dash" x1="62" y1="100" x2="62" y2="12" opacity=".6"/>
      ${calm.map(([x, y]) => `<circle class="v-fill" cx="${x}" cy="${y}" r="2.3" opacity=".55"/>`).join("")}
      ${young.map(([x, y]) => `<circle class="v-line" cx="${x}" cy="${y}" r="3" opacity=".8"/>`).join("")}
      ${hot.map(([x, y]) => `<circle class="v-warn" cx="${x}" cy="${y}" r="3.6"/>`).join("")}
      <text class="v-t" x="66" y="16">6 orders</text>
      <text class="v-t" x="150" y="58" style="fill:var(--warn)">flag line</text>
    </svg>`;
  },

  ledger: () => {
    const rows = [["coupon", 0.7, 0.2], ["comm.", 0.5, 0.18], ["deliv.", 0.62, 0.22], ["rto", 0.2, 0.16], ["master", 0.9, 0.25]];
    return `
    <svg viewBox="0 0 220 116" aria-hidden="true">
      ${rows.map(([n, v, min], i) => {
        const y = 16 + i * 19, x0 = 50, w = 132;
        const low = v - min < 0.08;
        return `
        <text class="v-t" x="44" y="${y + 3}" text-anchor="end">${n}</text>
        <rect class="v-fill" x="${x0}" y="${y - 3}" width="${w}" height="6" rx="3" opacity=".12"/>
        <rect class="${low ? "v-warn" : "v-accf"}" x="${x0}" y="${y - 3}" width="${(w * v).toFixed(1)}" height="6" rx="3" opacity="${low ? 1 : 0.85}"/>
        <line class="v-line" x1="${(x0 + w * min).toFixed(1)}" y1="${y - 6}" x2="${(x0 + w * min).toFixed(1)}" y2="${y + 6}"/>`;
      }).join("")}
      <path class="v-acc" d="M192 92 C210 92 210 16 192 16"/>
      <path class="v-accf" d="M192 12 l-6 4 6 4z M192 88 l-6 4 6 4z"/>
    </svg>`;
  },

  tat: () => {
    const xs = [18, 44, 70, 96, 122, 148, 174, 200];
    const p25 = [74, 72, 76, 70, 72, 68, 66, 64];
    const p75 = [54, 50, 56, 48, 46, 44, 38, 36];
    const p50 = [64, 61, 66, 59, 58, 56, 52, 50];
    const p90 = [34, 30, 38, 26, 28, 22, 20, 16];
    const line = (arr) => xs.map((x, i) => `${i ? "L" : "M"}${x} ${arr[i]}`).join(" ");
    const band = xs.map((x, i) => `${i ? "L" : "M"}${x} ${p75[i]}`).join(" ") + " " + xs.slice().reverse().map((x, i) => `L${x} ${p25[p25.length - 1 - i]}`).join(" ") + " Z";
    return `
    <svg viewBox="0 0 220 116" aria-hidden="true">
      <line class="v-line" x1="12" y1="96" x2="206" y2="96" opacity=".5"/>
      <path class="v-accs" d="${band}"/>
      <path class="v-acc" d="${line(p50)}"/>
      <path class="v-dash" d="${line(p90)}"/>
      ${xs.map((x, i) => `<rect class="v-fill" x="${x - 3}" y="${100}" width="6" height="${[8, 6, 5, 3, 2, 1.5, 1, 1][i]}" opacity=".4"/>`).join("")}
      <text class="v-t" x="206" y="12" text-anchor="end">p90</text>
      <text class="v-ta" x="206" y="44" text-anchor="end">p50</text>
    </svg>`;
  },

  attr: () => {
    const w = [184, 140, 112, 92, 70, 50, 40];
    return `
    <svg viewBox="0 0 220 116" aria-hidden="true">
      ${w.map((ww, i) => `<rect class="${i === 0 || i === 6 ? "v-accf" : "v-fill"}" x="${(110 - ww / 2).toFixed(1)}" y="${8 + i * 14.5}" width="${ww}" height="9" rx="2" opacity="${i === 0 || i === 6 ? 0.9 : 0.28 + i * 0.04}"/>`).join("")}
      <text class="v-t" x="14" y="15">install</text>
      <text class="v-ta" x="206" y="102" text-anchor="end">delivered</text>
    </svg>`;
  },

  loyalty: () => `
    <svg viewBox="0 0 220 116" aria-hidden="true">
      <rect class="v-accs" x="122" y="46" width="28" height="54"/>
      <path class="v-line" d="M14 100 H70 V74 H150 V46 H206"/>
      <line class="v-dash" x1="150" y1="46" x2="150" y2="104" style="stroke:var(--accent)"/>
      ${[[30, 92], [44, 86], [58, 94], [84, 66], [96, 70], [108, 64], [170, 40], [186, 36]].map(([x, y]) => `<circle class="v-fill" cx="${x}" cy="${y}" r="2.4" opacity=".5"/>`).join("")}
      ${[[128, 58], [136, 66], [143, 54], [131, 76]].map(([x, y]) => `<circle class="v-accf" cx="${x}" cy="${y}" r="2.8"/>`).join("")}
      <rect class="v-line" x="16" y="12" width="46" height="20" rx="6"/>
      <path class="v-line" d="M26 32 l-2 7 8-7"/>
      <text class="v-t" x="39" y="25" text-anchor="middle">ask</text>
      <text class="v-ta" x="136" y="112" text-anchor="middle">near-miss</text>
    </svg>`
};
