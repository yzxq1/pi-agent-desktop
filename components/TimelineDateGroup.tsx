"use client";

import { memo, useState, useCallback } from "react";
import type { SessionFamily } from "@/lib/session-family";
import type { SessionInfo } from "@/lib/types";
import { getProjectDisplayName } from "@/lib/project-display";

interface Props {
  dateKey: string;
  label: string;
  families: SessionFamily[];
  timelineRootNodes: Map<string, any>;
  projectDisplayNames: Map<string, string>;
  activeProjectRoots: string[];
  selectedSessionId: string | null;
  runningSessionIds: Set<string>;
  unreadSessionIds: Set<string>;
  initiallyCollapsed?: boolean;
  onSelectSession: (session: SessionInfo, isRestore?: boolean, entryId?: string, blockIndex?: number) => void;
  onRenamed: () => void;
  onSessionDeleted: (id: string) => void;
  renderSessionFamilyItem: (
    node: any,
    familySessions: SessionInfo[],
    projectName: string,
    key: string
  ) => React.ReactNode;
}

export const TimelineDateGroup = memo(function TimelineDateGroup({
  dateKey,
  label,
  families,
  timelineRootNodes,
  projectDisplayNames,
  activeProjectRoots,
  initiallyCollapsed = false,
  renderSessionFamilyItem,
}: Props) {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="sidebar-timeline-date-group" data-date={dateKey}>
      <div
        className="sidebar-timeline-date-header"
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={toggleCollapsed}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCollapsed();
          }
        }}
      >
        <span className={`sidebar-timeline-date-arrow${!collapsed ? " is-expanded" : ""}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
        <span className="sidebar-timeline-date-title">{label}</span>
        <span className="sidebar-timeline-date-count">{families.length}</span>
      </div>

      {!collapsed && (
        <div className="sidebar-timeline-date-items">
          {families.map((family) => {
            const node = timelineRootNodes.get(family.root.id);
            if (!node) return null;
            const projectRoot = family.root.projectRoot ?? family.root.cwd;
            const projectName =
              projectDisplayNames.get(projectRoot) ??
              getProjectDisplayName(projectRoot, activeProjectRoots);
            const familySessions = [family.root, ...family.subagents];

            return renderSessionFamilyItem(node, familySessions, projectName, family.root.id);
          })}
        </div>
      )}
    </div>
  );
});
