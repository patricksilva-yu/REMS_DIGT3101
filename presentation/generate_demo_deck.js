const path = require("path");
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "Team 2";
pptx.subject = "REMS presentation";
pptx.title = "Real Estate Management System (REMS)";
pptx.lang = "en-CA";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-CA",
};

const COLORS = {
  navy: "12343B",
  teal: "1F7A8C",
  mint: "42B4A6",
  sand: "F3F6F4",
  ink: "15313C",
  slate: "5F7480",
  white: "FFFFFF",
  danger: "A53A2B",
  warning: "D98522",
};

const deckDir = path.join(__dirname);
const outPath = path.join(deckDir, "REMS_Presentation_Team2.pptx");

function addSlideTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.6,
    y: 0.35,
    w: 7.8,
    h: 0.6,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 0.92,
      w: 7.2,
      h: 0.35,
      fontSize: 10.5,
      color: COLORS.slate,
      margin: 0,
    });
  }
}

function addCard(slide, x, y, w, h, title, body, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    line: { color: opts.lineColor || "D7E3E0", width: 1 },
    fill: { color: opts.fillColor || COLORS.white },
    shadow: { type: "outer", color: "9FB7B7", blur: 2, offset: 1, angle: 45, opacity: 0.15 },
  });

  slide.addText(title, {
    x: x + 0.18,
    y: y + 0.16,
    w: w - 0.36,
    h: 0.3,
    fontFace: "Aptos Display",
    fontSize: 14,
    bold: true,
    color: opts.titleColor || COLORS.ink,
    margin: 0,
  });

  slide.addText(body, {
    x: x + 0.18,
    y: y + 0.52,
    w: w - 0.36,
    h: h - 0.68,
    fontSize: 10.5,
    color: opts.bodyColor || COLORS.slate,
    breakLine: false,
    valign: "top",
    margin: 0,
  });
}

function addKpi(slide, x, y, w, label, value, accent) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 1.15,
    rectRadius: 0.08,
    line: { color: "C9DCDA", width: 1 },
    fill: { color: COLORS.white },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.14,
    y: y + 0.14,
    w: 0.08,
    h: 0.87,
    line: { color: accent, width: 0 },
    fill: { color: accent },
  });
  slide.addText(value, {
    x: x + 0.32,
    y: y + 0.18,
    w: w - 0.42,
    h: 0.34,
    fontFace: "Aptos Display",
    fontSize: 22,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  });
  slide.addText(label, {
    x: x + 0.32,
    y: y + 0.62,
    w: w - 0.42,
    h: 0.18,
    fontSize: 9.5,
    color: COLORS.slate,
    margin: 0,
  });
}

function addBulletList(slide, items, opts) {
  slide.addText(
    items.map((item, index) => ({
      text: item,
      options: { bullet: true, breakLine: index !== items.length - 1 },
    })),
    {
      x: opts.x,
      y: opts.y,
      w: opts.w,
      h: opts.h,
      fontSize: opts.fontSize || 12,
      color: opts.color || COLORS.ink,
      margin: 0,
      breakLine: false,
      paraSpaceAfterPt: 8,
    }
  );
}

function addImagePlaceholder(slide, x, y, w, h, label, notes) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.06,
    line: { color: "BDD0CD", width: 1.2, dash: "dash" },
    fill: { color: "F8FBFA" },
  });
  slide.addText(label, {
    x: x + 0.28,
    y: y + 0.28,
    w: w - 0.56,
    h: 0.35,
    fontFace: "Aptos Display",
    fontSize: 16,
    bold: true,
    color: COLORS.ink,
    align: "center",
    margin: 0,
  });
  slide.addText(notes, {
    x: x + 0.32,
    y: y + 0.88,
    w: w - 0.64,
    h: h - 1.16,
    fontSize: 11,
    color: COLORS.slate,
    align: "center",
    valign: "mid",
    margin: 0,
  });
}

// Slide 1
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 7.5,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy, width: 0 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.65,
    y: 0.82,
    w: 4.75,
    h: 4.95,
    rectRadius: 0.12,
    line: { color: "2E5B65", width: 1 },
    fill: { color: "1A4650" },
  });
  slide.addText("REMS", {
    x: 0.95,
    y: 1.1,
    w: 5.7,
    h: 0.7,
    fontFace: "Aptos Display",
    fontSize: 30,
    bold: true,
    color: COLORS.white,
    margin: 0,
  });
  slide.addText("Real Estate Management System", {
    x: 0.95,
    y: 1.82,
    w: 5.7,
    h: 0.4,
    fontSize: 16,
    color: "CDE6E0",
    margin: 0,
  });
  slide.addText("DIGT 3101 Project Presentation", {
    x: 0.95,
    y: 2.35,
    w: 4.8,
    h: 0.3,
    fontSize: 11,
    color: COLORS.mint,
    bold: true,
    margin: 0,
  });
  addCard(
    slide,
    0.95,
    3.05,
    4.1,
    1.25,
    "Project overview",
    "A REMS for managing properties, tenants, leases, payments, and maintenance in one system.",
    { fillColor: "24515B", lineColor: "2F6D78", titleColor: COLORS.white, bodyColor: "D8ECE8" }
  );
  addCard(
    slide,
    0.95,
    4.48,
    4.1,
    0.95,
    "Team 2",
    "Alicia Loi, Caitlin Chee Kirkpatrick, Patrick Silva",
    { fillColor: "24515B", lineColor: "2F6D78", titleColor: COLORS.white, bodyColor: "D8ECE8" }
  );

  slide.addText("A web-based system for day-to-day real estate operations", {
    x: 6.3,
    y: 1.18,
    w: 5.8,
    h: 0.8,
    fontFace: "Aptos Display",
    fontSize: 22,
    bold: true,
    color: COLORS.white,
    margin: 0,
  });
  slide.addText(
    "This presentation covers the problem, the implemented solution, the live workflow demo, and the main limitations and next steps.",
    {
      x: 6.3,
      y: 2.15,
      w: 5.8,
      h: 0.75,
      fontSize: 13,
      color: "D8ECE8",
      margin: 0,
    }
  );
  addKpi(slide, 6.3, 3.42, 1.85, "Live core pages", "6", COLORS.mint);
  addKpi(slide, 8.32, 3.42, 1.85, "API routes", "7", COLORS.teal);
  addKpi(slide, 10.34, 3.42, 1.85, "Local DB", "SQLite", COLORS.warning);
  addCard(
    slide,
    6.3,
    4.98,
    5.9,
    1.1,
    "Presentation focus",
    "We will demonstrate the core workflows, explain design choices, and be clear about future work.",
    { fillColor: "EFF6F4", lineColor: "D0E1DE", titleColor: COLORS.ink, bodyColor: COLORS.slate }
  );
}

// Slide 2
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.sand };
  addSlideTitle(slide, "System Scope", "Core business areas the REMS currently supports");

  addCard(
    slide,
    0.6,
    1.35,
    3.9,
    1.55,
    "Property portfolio",
    "Properties, units, and occupancy data are now persisted.",
    { fillColor: "FFFFFF", lineColor: "D3E3E1" }
  );
  addCard(
    slide,
    4.72,
    1.35,
    3.9,
    1.55,
    "Tenant and lease flow",
    "Tenant creation feeds live lease creation and unit status updates.",
    { fillColor: "FFFFFF", lineColor: "D3E3E1" }
  );
  addCard(
    slide,
    8.84,
    1.35,
    3.9,
    1.55,
    "Operations tracking",
    "Payments and maintenance requests are stored and reload correctly.",
    { fillColor: "FFFFFF", lineColor: "D3E3E1" }
  );

  addCard(
    slide,
    0.6,
    3.25,
    5.55,
    3.4,
    "What is now real",
    "The dashboard and core workflows now read from the backend instead of mock-only local state."
  );
  addBulletList(slide, [
    "Create property and unit",
    "Create tenant",
    "Create lease and update occupancy",
    "Record payment",
    "Submit and update maintenance",
  ], { x: 0.92, y: 4.1, w: 4.95, h: 2.05, fontSize: 11.5 });
  addImagePlaceholder(
    slide,
    6.45,
    3.25,
    6.25,
    3.4,
    "Image Placeholder",
    "Insert your domain model or use case diagram here."
  );
}

// Slide 3
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addSlideTitle(slide, "Architecture And Implementation", "How the prototype was upgraded into a more credible demo system");

  addKpi(slide, 0.6, 1.25, 2.2, "Persistence layer", "Prisma + SQLite", COLORS.teal);
  addKpi(slide, 2.95, 1.25, 2.2, "UI data source", "Server-loaded", COLORS.mint);
  addKpi(slide, 5.3, 1.25, 2.2, "Reset command", "db:seed", COLORS.warning);

  addCard(
    slide,
    0.6,
    2.7,
    4.45,
    2.55,
    "Backend structure",
    "We added a Prisma schema, seed data, API routes, and server-loaded pages for the main demo screens."
  );
  addBulletList(slide, [
    "SQLite database with seeded data",
    "API routes for core REMS entities",
    "Server-driven dashboard and workflow pages",
  ], { x: 0.88, y: 3.4, w: 3.9, h: 1.5, fontSize: 10.8 });

  addCard(
    slide,
    0.6,
    5.55,
    4.45,
    1.15,
    "Important limitation",
    "Authentication, role enforcement, testing automation, and settings persistence are still future work."
  );
  addImagePlaceholder(
    slide,
    5.35,
    1.45,
    7.25,
    5.25,
    "Image Placeholder",
    "Insert your architecture or component diagram here."
  );
}

// Slide 4
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.sand };
  addSlideTitle(slide, "Live Demo Plan", "The sequence we can follow to keep the presentation stable and easy to understand");

  addCard(slide, 0.6, 1.35, 2.32, 1.3, "1. Dashboard", "Start with the real backend summary to establish system state.");
  addCard(slide, 3.0, 1.35, 2.32, 1.3, "2. Properties", "Create a property or unit and show inventory updates.");
  addCard(slide, 5.4, 1.35, 2.32, 1.3, "3. Tenants", "Create a tenant profile that can be used later.");
  addCard(slide, 7.8, 1.35, 2.32, 1.3, "4. Leases", "Create a lease and show unit occupancy changing.");
  addCard(slide, 10.2, 1.35, 2.32, 1.3, "5. Payments", "Record a payment against an active lease.");
  addCard(slide, 4.2, 2.95, 4.9, 1.3, "6. Maintenance", "Submit a request and move it through an update status action.");

  slide.addText("Why this order works", {
    x: 0.6,
    y: 4.75,
    w: 2.2,
    h: 0.3,
    fontFace: "Aptos Display",
    fontSize: 15,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  });
  addBulletList(slide, [
    "Every action has a visible result",
    "Later screens reuse data created earlier",
    "We avoid unimplemented pages in the live path",
    "The demo tells one coherent business story",
  ], { x: 0.6, y: 5.12, w: 4.5, h: 1.6, fontSize: 11.2 });
  addImagePlaceholder(
    slide,
    6.0,
    4.55,
    6.65,
    2.0,
    "Image Placeholder",
    "Insert a workflow, sequence diagram, or demo screenshot here."
  );
}

// Slide 5
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };
  addSlideTitle(slide, "What Is Implemented Vs Future Work", "Being explicit here helps with question handling and team mastery");

  addCard(
    slide,
    0.6,
    1.35,
    5.9,
    4.75,
    "Implemented now",
    "These are the features we can confidently demonstrate live.",
    { fillColor: "F7FBFA", lineColor: "CFE2DF" }
  );
  addBulletList(slide, [
    "Backend-driven dashboard",
    "Persisted property and unit management",
    "Persisted tenant management",
    "Persisted lease creation with unit occupancy update",
    "Persisted payment recording",
    "Persisted maintenance request creation and status update",
  ], { x: 0.92, y: 2.05, w: 5.1, h: 3.35, fontSize: 11.2 });

  addCard(
    slide,
    6.85,
    1.35,
    5.9,
    4.75,
    "Still future work",
    "These gaps do not break the core demo, but they should be described as next steps.",
    { fillColor: "FFF8F4", lineColor: "E6D2C5" }
  );
  addBulletList(slide, [
    "Authentication and role-based access control",
    "Production-grade validation and error messaging everywhere",
    "Automated tests and coverage evidence",
    "Settings persistence",
    "Hosted deployment and multi-user production setup",
  ], { x: 7.17, y: 2.05, w: 5.1, h: 3.35, fontSize: 11.2, color: COLORS.ink });

  addCard(
    slide,
    2.95,
    6.25,
    7.4,
    0.75,
    "Presentation stance",
    "Demo the implemented workflows confidently and position the rest as roadmap work.",
    { fillColor: "EEF5F4", lineColor: "C7D9D6" }
  );
}

// Slide 6
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.sand };
  addSlideTitle(slide, "Testing And Quality Evidence", "How we validated the demo flows even without a full automated test suite yet");

  addKpi(slide, 0.6, 1.35, 2.3, "Production build", "Passed", COLORS.mint);
  addKpi(slide, 3.05, 1.35, 2.3, "Live API checks", "Passed", COLORS.teal);
  addKpi(slide, 5.5, 1.35, 2.3, "Seed reset", "Repeatable", COLORS.warning);
  addKpi(slide, 7.95, 1.35, 2.3, "Core workflow pages", "6", COLORS.mint);

  addCard(
    slide,
    0.6,
    2.95,
    4.1,
    3.15,
    "Verification used",
    "We built the app, exercised live API routes, confirmed backend responses, and reseeded the database for a stable baseline."
  );
  addBulletList(slide, [
    "Webpack production build completed successfully",
    "Create and update flows were tested against the running app",
    "Seed command restores known demo data",
    "The demo path is now consistent across reruns",
  ], { x: 0.9, y: 3.55, w: 3.55, h: 2.1, fontSize: 10.8 });

  addCard(
    slide,
    4.95,
    2.95,
    7.7,
    3.15,
    "Manual test checklist we can mention",
    "Use one clean story: dashboard, property/unit, tenant, lease, payment, then maintenance."
  );
  addBulletList(slide, [
    "npm run db:seed",
    "npm run dev",
    "Check /api routes for the same records shown in the UI",
    "Use the same story order every time for reliability",
  ], { x: 5.25, y: 3.62, w: 7.05, h: 1.9, fontSize: 10.8 });
}

// Slide 7
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addText("REMS is now demo-ready in the core workflow areas", {
    x: 0.8,
    y: 0.95,
    w: 8.7,
    h: 0.65,
    fontFace: "Aptos Display",
    fontSize: 27,
    bold: true,
    color: COLORS.white,
    margin: 0,
  });
  slide.addText(
    "The strongest takeaway is that the main property, tenant, lease, payment, maintenance, and dashboard flow is now backed by a real local database.",
    {
      x: 0.82,
      y: 1.78,
      w: 7.7,
      h: 0.8,
      fontSize: 13.2,
      color: "D8ECE8",
      margin: 0,
    }
  );
  addCard(
    slide,
    0.82,
    3.25,
    4.1,
    1.05,
    "Final positioning",
    "A functional academic prototype with real persistence in the key demo flows.",
    { fillColor: "1A4650", lineColor: "2E5B65", titleColor: COLORS.white, bodyColor: "D8ECE8" }
  );
  addCard(
    slide,
    0.82,
    4.48,
    4.1,
    1.05,
    "Honest limitation",
    "Settings, auth, and automated tests are still next-step work rather than completed scope.",
    { fillColor: "1A4650", lineColor: "2E5B65", titleColor: COLORS.white, bodyColor: "D8ECE8" }
  );
  addCard(
    slide,
    0.82,
    5.71,
    4.1,
    1.05,
    "If asked",
    "We can explain exactly what became backend-driven and how we validated those changes.",
    { fillColor: "1A4650", lineColor: "2E5B65", titleColor: COLORS.white, bodyColor: "D8ECE8" }
  );
  addImagePlaceholder(
    slide,
    5.55,
    1.25,
    6.9,
    5.7,
    "Image Placeholder",
    "Insert your final polished screenshot, team photo, or summary graphic here."
  );
}

pptx.writeFile({ fileName: outPath });
