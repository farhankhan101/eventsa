"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboardNav";
import './CardStyles.css'; // Import custom CSS
import Nav from '@/components/main/nav.jsx'; // Ensure the path matches your project structure
import Footer from '@/components/main/footer';

export default function Explor() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch all users and events from localStorage
  useEffect(() => {
    // Retrieve all users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Extract events from each user and combine them
    const allEvents = users.flatMap(user => user.createdEvents || []);

    // Ensure all events from all users are stored in state
    setEvents(allEvents);
    setFilteredEvents(allEvents);  // Display all events initially

    // Fetch categories from localStorage and add 'All' at the beginning
    const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    const allCategories = [{ id: 'all', name: 'All' }, ...storedCategories];
    setCategories(allCategories);

    // Ensure "All" category is active by default
    setActiveCategory('All');
  }, []);

  // Unified event filtering function
  const filterEvents = () => {
    let filtered = events;

    // Apply category filter only if a specific category is selected
if (activeCategory !== 'All') {
  filtered = filtered.filter(event =>
    event.category && event.category.trim().toLowerCase() === activeCategory.trim().toLowerCase()
  );
}

    // Apply date range filter if both start and end dates are selected
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });
    }

    // Remove duplicates based on eventId
    const uniqueFilteredEvents = Array.from(new Set(filtered.map(e => e.eventId)))
      .map(id => filtered.find(e => e.eventId === id));

    setFilteredEvents(uniqueFilteredEvents);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Apply filters when category or date changes
  useEffect(() => {
    filterEvents();
  }, [activeCategory, startDate, endDate]);

  return (
    <>
      <Nav />
      <div className="container mx-auto">
        {/* <Header title="All Events" iconName="LogOut" /> */}
      </div>
      <div className="p-4">
        {/* Date Filter */}
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex space-x-4">
            <div>
              <label htmlFor="startDate" className="mr-2">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="mr-2">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-4 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.name)}
              className={`px-4 py-2 rounded-full font-semibold ${
                activeCategory === category.name
                  ? 'bg-black text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Event Listings */}
      {filteredEvents.length > 0 ? (
        <div className="ag-format-container">
          <div className="ag-courses_box">
            {filteredEvents.map((event, index) => (
              <div key={event.eventId} className="ag-courses_item relative">
                <a href="#" className="ag-courses-item_link relative">
                  {/* Event Image */}
                  <img
                    src={event.image}
                    alt={event.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 hover:opacity-100"
                  />
                  {/* Background Circle with Gradient */}
                  <div
                    className={`ag-courses-item_bg ${
                      index % 6 === 0
                        ? 'bg-blue-500'
                        : index % 6 === 1
                        ? 'bg-green-500'
                        : index % 6 === 2
                        ? 'bg-red-500'
                        : index % 6 === 3
                        ? 'bg-purple-500'
                        : index % 6 === 4
                        ? 'bg-pink-500'
                        : 'bg-indigo-500'
                    }`}
                  ></div>
                  {/* Event Category */}
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 text-white text-sm font-semibold rounded-full ${
                      event.category === 'Conference'
                        ? 'bg-yellow-500'
                        : event.category === 'Workshop'
                        ? 'bg-red-500'
                        : event.category === 'Meetup'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }`}
                    style={{ transform: 'rotate(-10deg)' }}
                  >
                    {event.category}
                  </div>
                  {/* Event Details */}
                  <div className="relative p-6 text-white z-10">
                    <h2 className="ag-courses-item_title text-2xl font-bold mb-4">{event.name}</h2>
                    <div className="ag-courses-item_date-box">
                      Start:
                      <span className="ag-courses-item_date">{event.date}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p><strong>Organization:</strong> {event.organizationName}</p>
                      <p><strong>Description:</strong> {event.description}</p>
                      <p><strong>Location:</strong> {event.location}</p>
                      <p><strong>Date:</strong> {event.date}</p>
                      <p><strong>Contact:</strong> {event.contactNumber}</p>
                      <p><strong>Member Limit:</strong> {event.memberLimit}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-105"
                      >
                        RSVP
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center min-h-screen"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)", // For Safari
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <h2 className="text-2xl font-semibold text-black mb-6">
            No Events Found
          </h2>
        </div>
      )}

      <Footer />
    </>
  );
}
