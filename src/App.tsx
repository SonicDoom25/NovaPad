import { useEffect } from "react";

import Editor from "./components/Editor";
import TabBar from "./components/TabBar";

import { useTabStore } from "./store/tabStore";

function App() {

  const {
    tabs,
    activeTabId,
    updateContent,
    addTab,
    initialize,
    restoreLastClosedTab
  } = useTabStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {

    const handleKey =
      (e: KeyboardEvent) => {

        if (
          e.ctrlKey &&
          e.shiftKey &&
          e.key === "T"
        ) {
          e.preventDefault();

          restoreLastClosedTab();
        }
      };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );

  }, [restoreLastClosedTab]);

  const activeTab =
    tabs.find(
      (tab) =>
        tab.id === activeTabId
    );

  if (!activeTab) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <h2>
          No tabs open
        </h2>

        <button
          onClick={addTab}
        >
          New Tab
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <TabBar />

      <div
        style={{
          flex: 1
        }}
      >
        <Editor
          content={
            activeTab.content
          }
          onChange={(value) =>
            updateContent(
              activeTab.id,
              value
            )
          }
        />
      </div>
    </div>
  );
}

export default App;