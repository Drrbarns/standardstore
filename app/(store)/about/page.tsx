'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';

type ValueCard = {
  icon: string;
  title: string;
  body: string;
};

type JourneyStep = {
  label: string;
  title: string;
  body: string;
};

export default function AboutPage() {
  usePageTitle('Our Story');
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'Sarah Lawson Imports';

  const valueCards: ValueCard[] = [
    {
      icon: 'ri-verified-badge-line',
      title: 'Authenticity guaranteed',
      body: 'Every product is handpicked and inspected by Sarah herself. We document the sourcing journey so you know exactly what you are buying.',
    },
    {
      icon: 'ri-money-dollar-circle-line',
      title: 'Unbeatable value',
      body: 'Direct from the factory to you. We cut out the middleman to offer premium quality at wholesale prices.',
    },
    {
      icon: 'ri-truck-line',
      title: 'Reliable delivery',
      body: 'From Accra to any location in Ghana, we deliver with care, reliable updates, and smooth support.',
    },
  ];

  const journeySteps: JourneyStep[] = [
    {
      label: '01',
      title: 'Source selection',
      body: 'Sarah travels directly to China, navigating factories and markets to hand-select quality products for the store.',
    },
    {
      label: '02',
      title: 'Quality inspection',
      body: 'Every item is personally inspected. If it doesn\'t meet her standards, it doesn\'t make it to the store.',
    },
    {
      label: '03',
      title: 'Delivered to you',
      body: 'Products are shipped, stored, and dispatched with care for local and nationwide delivery across Ghana.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="border-b border-emerald-700/10 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <AnimatedSection className="lg:col-span-6" animation="fade-up">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-800">
                About {siteName}
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
                More than just an influencer.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-700 max-w-xl">
                {siteName} was born from a commitment to give everyone access to premium quality
                products at honest prices — sourced directly, inspected personally, delivered reliably.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-800 border border-emerald-700/20">
                  <i className="ri-map-pin-line mr-2" /> Accra, Ghana
                </span>
                <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-800 border border-emerald-700/20">
                  <i className="ri-truck-line mr-2" /> Nationwide delivery
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full bg-emerald-700 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
                >
                  Explore collection
                  <i className="ri-arrow-right-up-line ml-2" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-emerald-700/35 bg-white px-7 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  Contact our team
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-6" animation="fade-left">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] border border-emerald-700/15 bg-emerald-700/10">
                  <Image
                    src="/sarah-lawson.jpeg"
                    alt="Sarah Lawson - Founder"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="relative overflow-hidden rounded-2xl aspect-[4/5] border border-emerald-700/15 bg-emerald-700/10 mt-8">
                  <Image
                    src="/sarah-lawson.jpeg"
                    alt="Sarah Lawson Imports"
                    fill
                    className="object-cover object-bottom"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <AnimatedSection className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-700">
              What makes us different
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Built on quality, trusted by thousands.
            </h2>
          </div>

          <AnimatedGrid className="mt-8 grid gap-4 md:grid-cols-3" staggerDelay={120}>
            {valueCards.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-emerald-700/15 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
                  <i className={`${item.icon} text-xl`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            ))}
          </AnimatedGrid>
        </div>
      </AnimatedSection>

      {/* Journey */}
      <section className="bg-emerald-50/45 py-14 sm:py-16 border-y border-emerald-700/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-800">
              Our process
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
              How every product reaches your hands.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {journeySteps.map((step) => (
              <div
                key={step.label}
                className="rounded-2xl border border-emerald-700/15 bg-white p-6"
              >
                <span className="text-xs font-bold tracking-[0.22em] uppercase text-emerald-700">
                  Step {step.label}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-emerald-900 border border-emerald-800 px-6 py-10 sm:px-10 sm:py-12 text-white text-center">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-200">
              Ready to experience the difference?
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold">
              Premium quality at unbeatable prices.
            </h2>
            <p className="mt-3 text-emerald-100 max-w-2xl mx-auto">
              Join thousands of happy customers who trust {siteName} for their lifestyle needs.
              Shop kitchen essentials, electronics, fashion, and more.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center rounded-full bg-white text-emerald-900 px-7 py-3 text-sm font-semibold hover:bg-emerald-50 transition-colors"
              >
                Start shopping
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-7 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
