import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../Hooks/useDebounce';

const DebouncedSearchInput = ({
  value: externalValue,
  onSearch,
  delay = 400,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(externalValue || "");
  const debouncedLocalValue = useDebounce(localValue, delay);

  const onSearchRef = React.useRef(onSearch);
  
  // Keep the ref up to date without triggering re-renders
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Sync external value to local state (e.g., when "Clear Filters" is clicked)
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== localValue) {
      setLocalValue(externalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue]);

  const isMounted = React.useRef(false);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (onSearchRef.current) {
      onSearchRef.current(debouncedLocalValue);
    }
  }, [debouncedLocalValue]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      {...props}
    />
  );
};

export default DebouncedSearchInput;
