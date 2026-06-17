import { create } from "zustand";
import { Tab } from "../types/Tab";

import {
  saveSession,
  loadSession
} from "../services/SessionManager";

function getNextUntitledNumber(
  tabs: Tab[]
): number {
  const numbers = tabs.map(tab => {
    const match =
      tab.title.match(
        /^Untitled (\d+)$/
      );

    return match
      ? Number(match[1])
      : 0;
  });

  return (
    Math.max(
      0,
      ...numbers
    ) + 1
  );
}

const firstTabId =
  crypto.randomUUID();

interface TabStore {
  tabs: Tab[];
  activeTabId: string;

  recentlyClosed: Tab[];

  addTab: () => void;
  closeTab: (id: string) => void;
  restoreLastClosedTab: () => void;

  updateContent: (
    id: string,
    content: string
  ) => void;

  setActiveTab: (
    id: string
  ) => void;

  initialize: () => Promise<void>;
}

export const useTabStore =
create<TabStore>((set, get) => {

  const persist = () => {
    const current = get();

    saveSession({
      tabs: current.tabs,
      activeTabId:
        current.activeTabId
    });
  };

  return {

    tabs: [
      {
        id: firstTabId,
        title: "Untitled 1",
        content: "",
        pinned: false,
        dirty: false
      }
    ],

    activeTabId:
      firstTabId,

    recentlyClosed: [],

    addTab: () => {

      set((state) => {

        const id =
          crypto.randomUUID();

        return {
          tabs: [
            ...state.tabs,
            {
              id,
              title:
                `Untitled ${
                  getNextUntitledNumber(
                    state.tabs
                  )
                }`,
              content: "",
              pinned: false,
              dirty: false
            }
          ],

          activeTabId: id
        };
      });

      persist();
    },

    closeTab: (id) => {

      const state = get();

      const tab =
        state.tabs.find(
          t => t.id === id
        );

      if (!tab) {
        return;
      }

      if (
        tab.dirty &&
        !window.confirm(
          `Discard changes in ${tab.title}?`
        )
      ) {
        return;
      }

      const remaining =
        state.tabs.filter(
          t => t.id !== id
        );

      const nextActiveId =
        remaining.length
          ? remaining[
              remaining.length - 1
            ].id
          : "";

      set({
        tabs: remaining,

        recentlyClosed: [
          tab,
          ...state.recentlyClosed
        ],

        activeTabId:
          nextActiveId
      });

      persist();
    },

    restoreLastClosedTab: () => {

      const state = get();

      const last =
        state.recentlyClosed[0];

      if (!last) {
        return;
      }

      const restoredTab = {
        ...last
      };

      const titleExists =
        state.tabs.some(
          t =>
            t.title ===
            restoredTab.title
        );

      if (
        titleExists &&
        /^Untitled \d+$/.test(
          restoredTab.title
        )
      ) {

        restoredTab.title =
          `Untitled ${
            getNextUntitledNumber(
              state.tabs
            )
          }`;
      }

      set({
        tabs: [
          ...state.tabs,
          restoredTab
        ],

        recentlyClosed:
          state.recentlyClosed.slice(1),

        activeTabId:
          restoredTab.id
      });

      persist();
    },

    updateContent:
      (id, content) => {

        set((state) => ({
          tabs:
            state.tabs.map(tab =>
              tab.id === id
                ? {
                    ...tab,
                    content,
                    dirty: true
                  }
                : tab
            )
        }));

        persist();
      },

    setActiveTab:
      (id) => {

        set({
          activeTabId: id
        });

        persist();
      },

    initialize: async () => {

      const session =
        await loadSession();

      if (!session) {
        return;
      }

      set({
        tabs:
          session.tabs,

        activeTabId:
          session.activeTabId
      });
    }
  };
});