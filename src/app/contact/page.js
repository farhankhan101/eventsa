"use client";

import React from 'react';
import Nav from '@/components/main/nav.jsx'; // Ensure the path matches your project structure
import Footer from '@/components/main/footer';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  'your-name': Yup.string().required('Full Name is required'),
  'your-email': Yup.string().email('Invalid email address').required('Email address is required'),
  phone: Yup.string().required('Phone number is required'),
  cnic: Yup.string().required('CNIC is required'),
  city: Yup.string().required('City is required'),
  area: Yup.string().required('Area/Location is required'),
  'your-message': Yup.string().required('Message is required'),
});

const Contact = () => {
  // Initial values for the form
  const initialValues = {
    'your-name': '',
    'your-email': '',
    area: '',
    city: '',
    cnic: '',
    phone: '',
    'your-message': '',
  };

  // Form submission handler
  const handleSubmit = (values, { resetForm }) => {
    console.log('Form Data:', values);
    resetForm(); // Reset the form after successful submission
  };

  return (
    <>
      <Nav />
      <div className='w-100 p-0 m-4'>
        <div className="w-100 container-fluid mt-8">
          <div className="my-8 grid gap-8 lg:my-16 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4 rounded-xl bg-white p-8 shadow-md">
              <h2 className="mb-8 text-2xl font-bold">Contact Form</h2>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="grid gap-8 lg:grid-cols-2 lg:gap-x-16">
                    <div>
                      <Field
                        as={InputText}
                        name="your-name"
                        className='border-2 p-2 w-full'
                        placeholder="Full Name"
                      />
                      {errors['your-name'] && touched['your-name'] && (
                        <div className="text-red-500 text-sm">{errors['your-name']}</div>
                      )}
                    </div>
                    <div>
                      <Field
                        as={InputText}
                        name="your-email"
                        type="email"
                        className='border-2 p-2 w-full'
                        placeholder="Email address"
                      />
                      {errors['your-email'] && touched['your-email'] && (
                        <div className="text-red-500 text-sm">{errors['your-email']}</div>
                      )}
                    </div>
                    <div>
                      <Field
                        as={InputText}
                        name="phone"
                        className='border-2 p-2 w-full'
                        placeholder="Phone Number"
                      />
                      {errors.phone && touched.phone && (
                        <div className="text-red-500 text-sm">{errors.phone}</div>
                      )}
                    </div>
                    <div>
                      <Field
                        as={InputText}
                        name="cnic"
                        className='border-2 p-2 w-full'
                        placeholder="CNIC (xxxxx-xxxxxxxx-x)"
                      />
                      {errors.cnic && touched.cnic && (
                        <div className="text-red-500 text-sm">{errors.cnic}</div>
                      )}
                    </div>
                    <div>
                      <Field
                        as={InputText}
                        name="city"
                        className='border-2 p-2 w-full'
                        placeholder="City"
                      />
                      {errors.city && touched.city && (
                        <div className="text-red-500 text-sm">{errors.city}</div>
                      )}
                    </div>
                    <div>
                      <Field
                        as={InputText}
                        name="area"
                        className='border-2 p-2 w-full'
                        placeholder="Area/Location"
                      />
                      {errors.area && touched.area && (
                        <div className="text-red-500 text-sm">{errors.area}</div>
                      )}
                    </div>
                    <div className="col-span-full">
                      <Field
                        as={InputTextarea}
                        name="your-message"
                        className="border-2 p-2 w-full"
                        placeholder="Tell us what’s on your mind"
                        rows={5}
                      />
                      {errors['your-message'] && touched['your-message'] && (
                        <div className="text-red-500 text-sm">{errors['your-message']}</div>
                      )}
                    </div>
                    <div className="col-span-full text-center">
                      <Button type="submit" className='bg-blue-600 text-white p-2 rounded'>
                        Submit
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
            <div>
              <div className="mb-8 space-y-4 rounded-xl bg-white p-8 shadow-md">
                <h4 className="font-semibold">Call us</h4>
                <p className="text-secondary-500">{"right.phone_number"}</p>
                <h4 className="font-semibold">Send us an email</h4>
                <p className="break-all text-secondary-500">{"right.email"}</p>
              </div>
              <div className="space-y-4 rounded-xl bg-white p-8 shadow-md">
                <h4 className="font-semibold">Complaint Unit</h4>
                <p className="text-gray-700">{"right.complaint_info"}</p>
                <h5 className="font-semibold">Tel</h5>
                <p>{"right.complaint_tel"}</p>
                <div className="flex justify-between">
                  <div>
                    <h5 className="font-semibold">Ext</h5>
                    <p>{"right.complaint_ext"}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold">Fax</h5>
                    <p>{"right.complaint_fax"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        <Footer />
    </>
  );
}

export default Contact;
