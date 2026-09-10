import { useState, useCallback, useRef, useEffect } from "react";

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState("");
  const timer = useRef(null);

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      setValue(val);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => onSearch(val || "technology"), 300);
    },
    [onSearch]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search papers and news..."
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
