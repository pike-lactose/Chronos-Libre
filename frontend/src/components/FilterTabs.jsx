export default function FilterTabs({ active, onChange }) {
  const tabs = [
    { key: "all", label: "All" },
    { key: "news", label: "News" },
    { key: "research", label: "Research" },
  ];

  return (
    <div className="filter-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={active === tab.key ? "active" : ""}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
