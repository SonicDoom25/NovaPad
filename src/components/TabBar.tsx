import { useTabStore }
from "../store/tabStore";

export default function TabBar() {

  const {
    tabs,
    activeTabId,
    setActiveTab,
    addTab,
    closeTab
  } = useTabStore();

  return (
    <div
      style={{
        display: "flex",
        background: "#222",
        color: "white",
        padding: "5px",
        gap: "5px"
      }}
    >
      {tabs.map(tab => (

        <div
          key={tab.id}
          style={{
            display: "flex"
          }}
        >
          <button
            onClick={() =>
              setActiveTab(
                tab.id
              )
            }

            style={{
              background:
                activeTabId ===
                tab.id
                  ? "#444"
                  : "#333",

              color: "white"
            }}
          >
            {tab.title}
            {tab.dirty
              ? " *"
              : ""}
          </button>

          <button
            onClick={() =>
              closeTab(
                tab.id
              )
            }
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={addTab}
      >
        +
      </button>
    </div>
  );
}