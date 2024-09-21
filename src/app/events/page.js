  "use client";

import Header from "@/components/dashboardNav";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import './CardStyles.css'; // Import custom CSS
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditIcon, PlusIcon, Trash } from "lucide-react";

// Validation schema for form
const eventValidationSchema = Yup.object({
  name: Yup.string().required("Event Name is required"),
  organizationName: Yup.string().required("Organization name is required"),
  description: Yup.string().required("Description is required"),
  memberLimit: Yup.number()
    .positive("Member limit must be a positive number")
    .required("Member Limit is required"),
  location: Yup.string().required("Location is required"),
  date: Yup.string().required("Date is required"),
  contactNumber: Yup.string().required("Contact Number is required"),
  image: Yup.mixed().required("Image is required"),
});

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function Events() {
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [showCategoryField, setShowCategoryField] = useState(false);
  const handleToggleChange = () => {
    setShowCategoryField(!showCategoryField);
  };
  const [categories, setCategories] = useState([
    { id: '1', name: 'Conference' },
    { id: '2', name: 'Workshop' },
    { id: '3', name: 'Meetup' },
  ]);
  const [newCategory, setNewCategory] = useState('');
  useEffect(() => {
    // Load categories from local storage when the component mounts
    const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    setCategories(storedCategories);
  }, []);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const loggedInUser = users.find((user) => user.login);

    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setEvents(loggedInUser.createdEvents || []);
      setMembersList(users.filter((user) => user.email !== loggedInUser.email));
    }
  }, []);
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const imageBase64 = await convertToBase64(values.image);

      const newEvent = {
        ...values,
        createdBy: currentUser.username,
        image: imageBase64,
        eventId: events.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        invites: [],
        attendees:[],
      };

      const updatedEvents = [...events, newEvent];
      const updatedUser = { ...currentUser, createdEvents: updatedEvents };

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const updatedUsers = users.map((user) =>
        user.email === currentUser.email ? updatedUser : user
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      setEvents(updatedEvents);
      Swal.fire({
        title: "Event Created!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred while creating the event.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
    setIsCreateDialogOpen(false);
  };

  const handleEdit = async (values, { setSubmitting }) => {
    try {
      const imageBase64 = values.image
        ? await convertToBase64(values.image)
        : selectedEvent.image;
  
      const updatedEvents = events.map((event) => {
        if (event.eventId === selectedEvent.eventId) {
          return {
            ...event,
            name: values.name,
            organizationName: values.organizationName,
            description: values.description,
            memberLimit: values.memberLimit,
            location: values.location,
            date: values.date,
            contactNumber: values.contactNumber,
            image: imageBase64,
            updatedAt: new Date(),
          };
        } else {
          return event;
        }
      });
  
      const updatedUser = { ...currentUser, createdEvents: updatedEvents };
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const updatedUsers = users.map((user) =>
        user.email === currentUser.email ? updatedUser : user
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
  
      setEvents(updatedEvents);
      Swal.fire({
        title: "Event Updated!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error updating event:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while updating the event.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
    setSubmitting(false);
    setIsEditDialogOpen(false);
  };
  
  const handleDelete = (selectedEvent) => {
    if (!selectedEvent) {
      Swal.fire({
        title: "Error!",
        text: "No event selected.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    } else {
      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          if (!selectedEvent.eventId) {
            Swal.fire({
              title: "Error!",
              text: "Invalid event ID.",
              icon: "error",
              confirmButtonText: "OK",
            });
            return;
          }
  
          // Remove the event from createdEvents
          const updatedEvents = events.filter(
            (event) => event.eventId !== selectedEvent.eventId
          );
  
          // Remove the event ID from currentUser's RSVPs
          const updatedRSVPs = currentUser.rsvps.filter(
            (rsvp) => rsvp.eventId !== selectedEvent.eventId
          );
  
          // Update currentUser with the new events and RSVPs
          const updatedUser = {
            ...currentUser,
            createdEvents: updatedEvents,
            rsvps: updatedRSVPs,
          };
  
          // Update the users list in localStorage
          const users = JSON.parse(localStorage.getItem("users")) || [];
          const updatedUsers = users.map((user) =>
            user.email === currentUser.email ? updatedUser : user
          );
  
          localStorage.setItem("users", JSON.stringify(updatedUsers));
  
          // Update the events in the UI
          setEvents(updatedEvents);
          setSelectedEvent(null);
  
          Swal.fire({
            title: "Event Deleted!",
            icon: "success",
            confirmButtonText: "OK",
          });
        }
      });
    }
  };
  

  const handleInviteClick = (event) => {
    setSelectedEvent(event);
    setInviteDialogOpen(true);
  };

  const handleInvite = (inviteeEmail) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const invitee = users.find((user) => user.email === inviteeEmail);

    if (!invitee) {
      console.error("Invitee not found.");
      return;
    }

    if (!events || !Array.isArray(events)) {
      console.error("Events array is not defined or is not an array");
      return;
    }

    if (!selectedEvent || !selectedEvent.eventId) {
      console.error("Selected event is not defined or missing eventId");
      return;
    }

    if (invitee.invites.some((invitedEvent) => invitedEvent.eventId === selectedEvent.eventId)) {
      console.log("Event already exists in the invitee's invites");
      alert("This event is already invited to the invitee.");
      return;
    }

    const updatedInvitee = {
      ...invitee,
      invites: [
        ...(invitee.invites || []),
        {
          ...selectedEvent,
          inviterBy: currentUser.username
        }
      ]
    };

    const updatedUsers = users.map((user) =>
      user.email === inviteeEmail ? updatedInvitee : user
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const updatedEvents = events.map((event) => {
      if (event.eventId === selectedEvent.eventId) {
        const currentInvites = Array.isArray(event.invites) ? event.invites : [];

        if (!currentInvites.some((invite) => invite.email === invitee.email)) {
          const updatedInvites = [
            ...currentInvites,
            {
              ...invitee,
              inviterId: currentUser.id
            }
          ];
          return { ...event, invites: updatedInvites };
        }
      }
      return event;
    });
    
    const updatedUser = {
      ...currentUser,
      createdEvents: updatedEvents,
    };

    const updatedCurrentUsers = updatedUsers.map((user) =>
      user.email === currentUser.email ? updatedUser : user
    );

    localStorage.setItem("users", JSON.stringify(updatedCurrentUsers));

    setEvents(updatedEvents);
    setInviteDialogOpen(false);

    console.log("Event invited successfully to:", inviteeEmail);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.some(cat => cat.name === newCategory)) {
      const newCategoryObject = { id: Date.now().toString(), name: newCategory };
      const updatedCategories = [...categories, newCategoryObject];
      
      // Update local state
      setCategories(updatedCategories);
      
      // Save updated categories to local storage
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      
      // Clear input
      setNewCategory('');
    }
  };

//   const handleRSVP = (eventId) => {
//     if (!currentUser) {
//         console.error("Current user not found.");
//         return;
//     }

//     // Combine all events that the user can RSVP to (createdEvents + invites)
//     const allEvents = [...currentUser.createdEvents, ...currentUser.invites];

//     if (!allEvents || !Array.isArray(allEvents)) {
//         console.error("Events array is not defined or is not an array.");
//         return;
//     }

//     // Find the event with the specified eventId
//     const event = allEvents.find((e) => e.eventId === eventId);

//     if (!event) {
//         console.error("Event not found.");
//         return;
//     }

//     // Check if the event has reached its member limit
//     if (event.attendees && event.attendees.length >= event.memberLimit) {
//         Swal.fire({
//             title: "Event Full",
//             text: "This event has reached its member limit.",
//             icon: "warning",
//             confirmButtonText: "OK",
//         });
//         return;
//     }

//     // Check if the event is already in the user's RSVPed events list
//     const isEventAlreadyRSVPed = currentUser.rsvps && currentUser.rsvps.some((e) => e.eventId === eventId);

//     if (isEventAlreadyRSVPed) {
//         Swal.fire({
//             title: "Already RSVPed",
//             text: "You have already RSVPed to this event.",
//             icon: "info",
//             confirmButtonText: "OK",
//         });
//         return;
//     }

//     // Update the current user's RSVP list
//     const updatedUser = {
//         ...currentUser,
//         rsvps: [
//             ...(currentUser.rsvps || []),
//             { eventId } // Add the event ID to the user's RSVPs
//         ]
//     };

//     // Update the event's attendees list
//     const updatedEvents = allEvents.map((e) => {
//         if (e.eventId === eventId) {
//             return {
//                 ...e,
//                 memberLimit : e.memberLimit -1
//             };
//         }
//         return e;
//     });

//     // Update the current user's createdEvents with the updated event list
//     const updatedCurrentUser = {
//         ...updatedUser,
//         createdEvents: updatedEvents.filter(event => currentUser.createdEvents.some(createdEvent => createdEvent.eventId === event.eventId))
//     };

//     // Update the users list in localStorage
//     const users = JSON.parse(localStorage.getItem("users")) || [];
//     const updatedUsers = users.map((user) =>
//         user.email === currentUser.email ? updatedCurrentUser : user
//     );
//     localStorage.setItem("users", JSON.stringify(updatedUsers));

//     // Update the state
//     setCurrentUser(updatedCurrentUser);
//     setEvents(updatedEvents.filter(event => updatedCurrentUser.createdEvents.some(createdEvent => createdEvent.eventId === event.eventId)));

//     Swal.fire({
//         title: "RSVP Successful!",
//         text: "You have successfully reserved your spot.",
//         icon: "success",
//         confirmButtonText: "OK",
//     });
// };

  
    return (
      <>
        {/* Create Event Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="dialog-content max-h-[80vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#000000 #ffffff', borderRadius: '2px' }}>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new event.
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{
                name: '',
                organizationName: '',
                category: '',
                description: '',
                memberLimit: '',
                location: '',
                date: '',
                contactNumber: '',
                image: null,
              }}
              validationSchema={eventValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Event Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                      Organization Name
                    </label>
                    <Field
                      type="text"
                      name="organizationName"
                      id="organizationName"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Event Category
                    </label>
                    <Field
                      as="select"
                      name="category"
                      id="category"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </Field>
                    <div className="space-y-4">
                      <label className="inline-flex items-center cursor-pointer mt-4">
                        <span className="mr-2 text-sm">Add Custom Category</span>
                        <input
                          type="checkbox"
                          checked={showCategoryField}
                          onChange={handleToggleChange}
                          className="sr-only"
                        />
                        <div className="relative">
                          <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors ${showCategoryField ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showCategoryField ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </div>
                        </div>
                      </label>
                      {showCategoryField && (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Add new category"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          >
                            Add Category
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Field
                      type="text"
                      name="description"
                      id="description"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="memberLimit" className="block text-sm font-medium text-gray-700">
                      Member Limit
                    </label>
                    <Field
                      type="number"
                      name="memberLimit"
                      id="memberLimit"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <Field
                      type="text"
                      name="location"
                      id="location"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <Field
                      type="date"
                      name="date"
                      id="date"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <Field
                      type="text"
                      name="contactNumber"
                      id="contactNumber"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      Event Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      id="image"
                      onChange={(event) => setFieldValue('image', event.currentTarget.files[0])}
                      className="mt-1 block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="mt-4">
                    Create Event
                  </Button>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>


        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="dialog-content max-h-[80vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#000000 #ffffff', borderRadius: '2px' }}>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the details of the selected event.
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <Formik
                initialValues={{
                  name: selectedEvent.name || '',
                  organizationName: selectedEvent.organizationName || '',
                  category: selectedEvent.category || '',
                  description: selectedEvent.description || '',
                  memberLimit: selectedEvent.memberLimit || '',
                  location: selectedEvent.location || '',
                  date: selectedEvent.date || '',
                  contactNumber: selectedEvent.contactNumber || '',
                  image: null, // keep this null to preserve existing image unless changed
                }}
                validationSchema={eventValidationSchema}
                onSubmit={handleEdit}
              >
                {({ isSubmitting, setFieldValue, values }) => (
                  <Form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Event Name
                      </label>
                      <Field
                        type="text"
                        name="name"
                        id="name"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                        Organization Name
                      </label>
                      <Field
                        type="text"
                        name="organizationName"
                        id="organizationName"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Event Category
                      </label>
                      <Field
                        as="select"
                        name="category"
                        id="category"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </Field>
                      <div className="space-y-4">
                        <label className="inline-flex items-center cursor-pointer mt-4">
                          <span className="mr-2 text-sm">Add Custom Category</span>
                          <input
                            type="checkbox"
                            checked={showCategoryField}
                            onChange={handleToggleChange}
                            className="sr-only"
                          />
                          <div className="relative">
                            <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors ${showCategoryField ? 'bg-blue-500' : 'bg-gray-300'}`}>
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${showCategoryField ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </div>
                          </div>
                        </label>
                        {showCategoryField && (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Add new category"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                              Add Category
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Field
                        type="text"
                        name="description"
                        id="description"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="memberLimit" className="block text-sm font-medium text-gray-700">
                        Member Limit
                      </label>
                      <Field
                        type="number"
                        name="memberLimit"
                        id="memberLimit"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <Field
                        type="text"
                        name="location"
                        id="location"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <Field
                        type="date"
                        name="date"
                        id="date"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                        Contact Number
                      </label>
                      <Field
                        type="text"
                        name="contactNumber"
                        id="contactNumber"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Event Image
                      </label>
                      <input
                        type="file"
                        name="image"
                        id="image"
                        onChange={(event) => setFieldValue('image', event.currentTarget.files[0])}
                        className="mt-1 block w-full text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="mt-4">
                      Update Event
                    </Button>
                  </Form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>


          {/* Invite Members Dialog */}
          <Dialog open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Members</DialogTitle>
                <DialogDescription>
                  Select members to invite to this event.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {membersList.map((member) => (
                  <Button
                    key={member.id}
                    onClick={() => handleInvite(member.email)}
                    className="w-full text-left"
                  >
                    {member.username}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Main content */}
          <Header title="My Events" iconName="LogOut" />
          <div className="p-4">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="mb-4 bg-green-600 hover:bg-green-700">
              <PlusIcon className="mr-2 w-5 h-5" /> Create New Event
            </Button>

            {events.length > 0 ? (
          <div className="ag-format-container">
            <div className="ag-courses_box">
              {events.map((event, index) => (
                <div key={event.eventId || index} className="ag-courses_item relative">
                  <a href="#" className="ag-courses-item_link relative">
                    {/* Event Image */}
                    <Image
                      width={100}
                      height={100}
                      src={event.image}
                      alt={event.name}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 hover:opacity-100"
                      priority // Ensures image is loaded quickly
                    />
                    <div className="relative flex justify-end text-white z-10">
                      <button
                        onClick={() => handleDelete(event)}
                        className="z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-transform transform hover:scale-105"
                      >
                        <Trash />
                      </button>
                    </div>
                    
                    {/* Background Circle with Gradient */}
                    <div
                      className={`ag-courses-item_bg ${
                        index % 6 === 0 ? 'bg-blue-500' :
                        index % 6 === 1 ? 'bg-green-500' :
                        index % 6 === 2 ? 'bg-red-500' :
                        index % 6 === 3 ? 'bg-purple-500' :
                        index % 6 === 4 ? 'bg-pink-500' :
                        'bg-indigo-500'
                      }`}
                    ></div>

                    {/* Event Category */}
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 text-white text-sm font-semibold rounded-full ${
                        event.category === 'Workshop' ? 'bg-yellow-500' :
                        event.category === 'Seminar' ? 'bg-red-500' :
                        event.category === 'Networking' ? 'bg-blue-500' :
                        'bg-gray-500'
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
                        <span className="ag-courses-item_date">
                          {event.date}
                        </span>
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
                          onClick={() => handleEditClick(event)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-105"
                        >
                          Edit
                        </button>
                        {/* <button
                          onClick={() => handleRSVP(event.eventId)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-105"
                        >
                          RSVP
                        </button> */}
                        <button
                          onClick={() => handleInviteClick(event)}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-105"
                        >
                          Invite
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
      </div>
    </>
  );
};