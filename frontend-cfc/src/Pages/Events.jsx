import React, { useState, useCallback } from 'react';
import Banner from '../Components/UI/Banner';
import SEO from '../Components/Common/SEO';
import CurrentEvent from '../Components/PageComponents/Events/CurrentEvent';
import EventFilter from '../Components/PageComponents/Events/EventFilter';

function Events() {
  const [queryParams, setQueryParams] = useState({});

  const handleFilterChange = useCallback((newParams) => {
    setQueryParams(newParams);
  }, []);

  return (
    <div>
      <SEO
        title="Events & Workshops"
        description="Stay updated with upcoming workshops, hackathons, and technical events organized by Code for Change Nepal."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Events", path: "/events" }]}
      />
      <Banner/>
      <CurrentEvent filterParams={queryParams} filterBar={<EventFilter onFilterChange={handleFilterChange} />} />
    </div>
  );
}

export default Events;
