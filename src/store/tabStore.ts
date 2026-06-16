import { create } from "zustand";
import { Tab } from "../types/Tab";

import {
  saveSession,
  loadSession
} from "../services/SessionManager";

const firstTabId = crypto.randomUUID();

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
create<TabStore>((set, get) => ({

  tabs: [
    {
      id: firstTabId,
      title: "Untitled 1",
      content: "",
      pinned: false,
      dirty: false
    }
  ],

  activeTabId: firstTabId,

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
                state.tabs.length + 1
              }`,
            content: "",
            pinned: false,
            dirty: false
          }
        ],
        activeTabId: id
      };
    });

    const current = get();

    saveSession({
      tabs: current.tabs,
      activeTabId:
        current.activeTabId
    });
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

    saveSession({
      tabs: remaining,
      activeTabId:
        nextActiveId
    });
  },

  restoreLastClosedTab: () => {

    const state = get();

    const last =
      state.recentlyClosed[0];

    if (!last) {
      return;
    }

    set({

      tabs: [
        ...state.tabs,
        last
      ],

      recentlyClosed:
        state.recentlyClosed.slice(1),

      activeTabId:
        last.id
    });

    const current = get();

    saveSession({
      tabs: current.tabs,
      activeTabId:
        current.activeTabId
    });
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

      const current =
        get();

      saveSession({
        tabs: current.tabs,
        activeTabId:
          current.activeTabId
      });
    },

  setActiveTab:
    (id) => {

      set({
        activeTabId: id
      });

      const current =
        get();

      saveSession({
        tabs: current.tabs,
        activeTabId:
          current.activeTabId
      });
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

}));