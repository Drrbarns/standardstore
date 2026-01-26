"use client";

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formElement = e.target as HTMLFormElement;
      const formDataToSend = new URLSearchParams();
      
      Array.from(formElement.elements).forEach((element) => {
        const input = element as HTMLInputElement;
        if (input.name && input.value) {
          formDataToSend.append(input.name, input.value);
        }
      });

      const response = await fetch('https://readdy.ai/api/form/d5nn0pkl56fkiit4nqng', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString(),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: 'ri-phone-line',
      title: 'Call Us',
      value: '+233 24 123 4567',
      link: 'tel:+233241234567',
      description: 'Mon-Fri, 8am-6pm GMT'
    },
    {
      icon: 'ri-mail-line',
      title: 'Email Us',
      value: 'hello@premiumstore.com',
      link: 'mailto:hello@premiumstore.com',
      description: 'We respond within 24 hours'
    },
    {
      icon: 'ri-whatsapp-line',
      title: 'WhatsApp',
      value: '+233 24 123 4567',
      link: 'https://wa.me/233241234567',
      description: 'Chat with us instantly'
    },
    {
      icon: 'ri-map-pin-line',
      title: 'Visit Us',
      value: 'East Legon, Accra',
      link: 'https://maps.google.com',
      description: 'Mon-Sat, 9am-6pm'
    }
  ];

  const faqs = [
    {
      question: 'What are your delivery times?',
      answer: 'Standard delivery takes 2-5 business days. Express delivery is available for next-day service in Accra.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we ship within Ghana only. We plan to expand to neighbouring countries soon.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept mobile money (MTN, Vodafone, AirtelTigo), credit/debit cards, and cash on delivery.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Get In Touch</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have a question or need assistance? Our friendly team is here to help. Reach out through any of our contact channels.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              target={method.link.startsWith('http') ? '_blank' : '_self'}
              rel={method.link.startsWith('http') ? 'noopener noreferrer' : ''}
              className="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <i className={`${method.icon} text-2xl text-emerald-700`}></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-emerald-700 font-medium mb-1">{method.value}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">
              Fill out the form below and we'll get back to you as soon as possible. For urgent matters, please call or WhatsApp us directly.
            </p>

            <form id="contactForm" onSubmit={handleSubmit} data-readdy-form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="+233 24 123 4567"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Order inquiry, product question, etc."
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  maxLength={500}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                  placeholder="Tell us how we can help you..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 characters</p>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                  <i className="ri-check-line mr-2"></i>
                  Message sent successfully! We'll respond within 24 hours.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  <i className="ri-error-warning-line mr-2"></i>
                  Failed to send message. Please try again or contact us directly.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-700 text-white py-4 rounded-xl font-medium hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Answers</h2>
            <p className="text-gray-600 mb-8">
              Find answers to common questions before reaching out
            </p>

            <div className="space-y-4 mb-12">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-gray-50 rounded-xl overflow-hidden">
                  <summary className="px-6 py-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
                    {faq.question}
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>

            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 rounded-2xl text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <i className="ri-customer-service-2-line text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold mb-3">Need Immediate Help?</h3>
              <p className="text-emerald-100 mb-6 leading-relaxed">
                Our customer support team is available Monday to Friday, 8am-6pm GMT. For urgent matters, reach out via WhatsApp.
              </p>
              <a
                href="https://wa.me/233241234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-full font-medium hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                <i className="ri-whatsapp-line text-xl"></i>
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-8 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.8373073654486!2d-0.1461!3d5.6037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzYnMTMuMyJOIDDCsDA4JzQ2LjAiVw!5e0!3m2!1sen!2sgh!4v1234567890"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Store</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Prefer to shop in person? Visit our flagship store in East Legon, Accra. Our knowledgeable staff will be happy to assist you with product selection and answer any questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <i className="ri-map-pin-2-line text-emerald-700"></i>
                <span>East Legon, Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-time-line text-emerald-700"></i>
                <span>Mon-Sat: 9am-6pm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
