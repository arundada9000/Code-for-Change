import { useState, useEffect } from "react";
import API from "../Services/api";

const useFetch = (url, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setData(initialData); // Reset data when URL changes to avoid stale data
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await API.get(url);
        setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, [url]);

  return { data, loading, error };
 
};


export default useFetch;
