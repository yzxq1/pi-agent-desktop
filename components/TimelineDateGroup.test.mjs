import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test("TimelineDateGroup component source adheres to contracts", () => {
  const file = join(process.cwd(), "components", "TimelineDateGroup.tsx");
  const content = readFileSync(file, "utf8");

  // Check structure and accessibility attributes
  assert.match(content, /className="sidebar-timeline-date-group"/);
  assert.match(content, /className="sidebar-timeline-date-header"/);
  assert.match(content, /aria-expanded=/);
  assert.match(content, /toggleCollapsed/);
  assert.match(content, /sidebar-timeline-date-arrow/);
  assert.match(content, /sidebar-timeline-date-count/);
});
