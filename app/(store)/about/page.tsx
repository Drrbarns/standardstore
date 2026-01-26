"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story');

  const values = [
    {
      icon: 'ri-leaf-line',
      title: 'Sustainability',
      description: 'We source responsibly and partner with eco-conscious brands to minimise our environmental footprint.'
    },
    {
      icon: 'ri-hand-heart-line',
      title: 'Quality First',
      description: 'Every product is carefully curated and tested to ensure it meets our premium standards.'
    },
    {
      icon: 'ri-group-line',
      title: 'Community',
      description: 'We believe in building lasting relationships with our customers and supporting local artisans.'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Transparency',
      description: 'Honest communication, fair pricing, and ethical practices guide everything we do.'
    }
  ];

  const team = [
    {
      name: 'Kwame Mensah',
      role: 'Founder & CEO',
      image: 'https://readdy.ai/api/search-image?query=Professional%20African%20businessman%20in%20modern%20office%20wearing%20business%20casual%20attire%20confident%20smile%20natural%20lighting%20clean%20minimal%20background%20corporate%20portrait%20style&width=400&height=500&seq=team1&orientation=portrait',
      bio: 'With over 15 years in retail and ecommerce, Kwame founded our company to bring premium products to Ghana.'
    },
    {
      name: 'Ama Osei',
      role: 'Head of Operations',
      image: 'https://readdy.ai/api/search-image?query=Professional%20African%20businesswoman%20in%20elegant%20blazer%20warm%20smile%20modern%20office%20setting%20natural%20lighting%20clean%20background%20confident%20corporate%20portrait&width=400&height=500&seq=team2&orientation=portrait',
      bio: 'Ama ensures every order is fulfilled perfectly and our customers receive exceptional service.'
    },
    {
      name: 'Yaw Darko',
      role: 'Product Curator',
      image: 'https://readdy.ai/api/search-image?query=Professional%20African%20man%20creative%20director%20stylish%20casual%20outfit%20friendly%20expression%20modern%20workspace%20natural%20light%20clean%20minimal%20background%20portrait&width=400&height=500&seq=team3&orientation=portrait',
      bio: 'Yaw travels the world discovering unique, high-quality products for our discerning customers.'
    },
    {
      name: 'Efua Asante',
      role: 'Customer Experience',
      image: 'https://readdy.ai/api/search-image?query=Professional%20African%20businesswoman%20customer%20service%20friendly%20smile%20modern%20office%20professional%20attire%20natural%20lighting%20clean%20background%20corporate%20portrait%20style&width=400&height=500&seq=team4&orientation=portrait',
      bio: 'Efua leads our support team, ensuring every customer interaction exceeds expectations.'
    }
  ];

  const milestones = [
    { year: '2018', event: 'Company founded with a vision to revolutionise online shopping in Ghana' },
    { year: '2019', event: 'Launched our first collection with 50 carefully curated products' },
    { year: '2020', event: 'Reached 10,000 happy customers and expanded our warehouse' },
    { year: '2021', event: 'Introduced same-day delivery in Accra and opened our second fulfilment centre' },
    { year: '2022', event: 'Partnered with 100+ premium brands and launched our loyalty programme' },
    { year: '2023', event: 'Expanded nationwide delivery and won Best Ecommerce Platform award' },
    { year: '2024', event: 'Serving 100,000+ customers with 500+ premium products' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Redefining Premium Shopping in Ghana
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're more than just an online store. We're a curated marketplace bringing the world's finest products to your doorstep, backed by exceptional service and genuine care.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex border-b border-gray-200 mb-12">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'story'
                ? 'text-emerald-700 border-b-2 border-emerald-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Our Story
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'mission'
                ? 'text-emerald-700 border-b-2 border-emerald-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mission & Vision
          </button>
        </div>

        {activeTab === 'story' && (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How It All Began</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  In 2018, our founder Kwame Mensah returned to Ghana after years working in international retail. He saw a gap in the market: Ghanaians wanted access to premium products but faced limited options, poor service, and unreliable delivery.
                </p>
                <p>
                  Armed with a vision and a small team of passionate individuals, we launched with a simple promise: to bring the best products from around the world to Ghana, with service that rivals the finest retailers globally.
                </p>
                <p>
                  Today, we serve over 100,000 customers nationwide, offering 500+ carefully curated products. But our mission remains unchanged: to delight every customer, every time.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://readdy.ai/api/search-image?query=Modern%20African%20retail%20warehouse%20with%20organised%20shelves%20packages%20being%20prepared%20employees%20working%20bright%20clean%20professional%20environment%20natural%20lighting%20wide%20angle%20view&width=800&height=600&seq=about1&orientation=landscape"
                alt="Our warehouse"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-emerald-50 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center mb-6">
                <i className="ri-compass-3-line text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide Ghanaians with seamless access to premium products from around the world, delivered with exceptional service, transparent pricing, and a commitment to sustainability. We exist to make premium shopping accessible, reliable, and delightful.
              </p>
            </div>
            <div className="bg-amber-50 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mb-6">
                <i className="ri-eye-line text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become Africa's most trusted premium ecommerce platform, setting new standards for quality, service, and customer experience. We envision a future where every African has access to the world's best products, delivered to their doorstep with care.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">Principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <i className={`${value.icon} text-2xl text-emerald-700`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-600">The passionate people behind your shopping experience</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-6 shadow-lg">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-emerald-700 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-xl text-emerald-100">Key milestones that shaped our story</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-emerald-500/30"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                      <p className="text-emerald-300 font-medium mb-2">{milestone.year}</p>
                      <p className="text-white leading-relaxed">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-emerald-400 rounded-full ring-4 ring-emerald-700 z-10"></div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-emerald-700 mb-2">100K+</div>
            <p className="text-gray-600 font-medium">Happy Customers</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-emerald-700 mb-2">500+</div>
            <p className="text-gray-600 font-medium">Premium Products</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-emerald-700 mb-2">99.2%</div>
            <p className="text-gray-600 font-medium">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-emerald-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Our Journey</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Every order you place supports our mission to bring premium products and exceptional service to Ghana. Thank you for being part of our story.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-emerald-700 text-white px-8 py-4 rounded-full font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            Start Shopping
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
