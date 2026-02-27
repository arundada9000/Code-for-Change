import React, { useState, useEffect } from 'react';
import Banner from '../Components/UI/Banner';
import Breadcrumbs from '../Components/UI/Breadcrumbs';
import SEO from '../Components/Common/SEO';
import CurrentEvent from '../Components/PageComponents/Events/CurrentEvent';
import Event from '../Components/PageComponents/Events/Event';
import API from '../Services/api';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/events");
        setEvents(data.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <SEO 
        title="Events & Workshops"
        description="Stay updated with upcoming workshops, hackathons, and technical events organized by Code for Change Nepal."
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Events", path: "/events" }]}
      />
      <Banner/>
      {/* <div className="max-w-7xl mx-auto px-5 mt-8">
        <Breadcrumbs crumbs={[{ name: "Events", path: "/events" }]} />
      </div> */}
      <CurrentEvent/>
      {/* <Event events={events} loading={loading} /> */}
    </div>
  )
}

export default Events
