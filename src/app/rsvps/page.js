"use client";
import Header from "@/components/dashboardNav";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust path if necessary
import { SquarePlus } from "lucide-react"; // Import the icon
import { TicketCheck } from "lucide-react";

export default function Events() {
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    // Retrieve the event details from localStorage
    const storedEvent = localStorage.getItem("users");
    if (storedEvent) {
      setEventDetails(JSON.parse(storedEvent));
    }
  }, []);

  console.log(eventDetails, "Event Details");

  if (!eventDetails) {
    return <div>Loading......</div>;
  }

  // Access the first element of eventDetails
  const event = eventDetails[0];

  // Check if rsvps exist
  const rsvps = event.rsvps;

  console.log(rsvps, "RSVPs Details");

  return (
    <>
      <Header title="My Events" iconName="LogOut" />

      {/* Full-screen glassy container */}
      {rsvps && rsvps.length > 0 ? (
        <ul className="w-full flex flex-row flex-wrap gap-4 justify-evenly">
          {rsvps.map((rsvp, index) => (
            <li
              key={index}
              className="w-[45%] min-h-[40%] mb-4 p-4 shadow-black shadow-lg rounded-xl bg-black text-white hover:bg-opacity-90 transition-all duration-500 transform hover:scale-105 hover:shadow-xl animate-fadeInUp"
            >
              <div className="text-2xl font-semibold mb-4 bg-white rounded-lg p-3 text-black  transition-colors duration-300 hover:bg-gray-300 hover:text-black flex flex-row items-center justify-between">

              <h3>
                {rsvp.name}
              </h3>

                <TicketCheck size={35}/>
              </div>
              <div className="border border-white p-4 rounded-xl h-[220px]">
                <p className="mb-2">
                  <strong>Category :</strong>
                  <span className="text-sm opacity-80"> {rsvp.category}</span>
                </p>
                <p className="mb-2">
                  <strong>Location :</strong>
                  <span className="text-sm opacity-80"> {rsvp.location}</span>
                </p>
                <p className="mb-2">
                  <strong>Date :</strong>
                  <span className="text-sm opacity-80"> {rsvp.date}</span>
                </p>
                <p className="mb-2">
                  <strong>Description :</strong>
                  <span className="text-sm opacity-80">
                    {" "}
                    {rsvp.description}
                  </span>
                </p>
                <p className="mb-2">
                  <strong>Organized by :</strong>
                  <span className="text-sm opacity-80">
                    {" "}
                    {rsvp.organizationName}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      ):(
      <div 
        className="flex items-center justify-center min-h-screen" 
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)', // For Safari
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
          <h2 className="text-2xl font-semibold text-black mb-6">No RSVPs Found</h2>
      </div>
      )}
    </>
  );
}
