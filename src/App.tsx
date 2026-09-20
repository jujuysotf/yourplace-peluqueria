import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioGallery } from './components/PortfolioGallery';
import { AboutSection } from './components/AboutSection';
import { Testimonials } from './components/Testimonials';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Service, PortfolioItem, Booking } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState<Booking | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleOpenBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setBookingModalOpen(true);
  };

  const handleSelectService = (service: Service) => {
    handleOpenBooking(service.id);
  };

  const handleBookLook = (_item: PortfolioItem) => {
    // Open booking modal
    handleOpenBooking();
  };

  const handleBookingConfirmed = (booking: Booking) => {
    setLastConfirmedBooking(booking);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 6000);
  };

  const handleScrollToServices = () => {
    const el = document.getElementById('servicios');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#181818] font-sans selection:bg-[#E8B4B8] selection:text-[#111111]">
      
      {/* Toast Notification when a booking is created */}
      {showToast && lastConfirmedBooking && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#181818] text-white p-4 rounded-2xl shadow-2xl border border-[#E8B4B8] flex items-center gap-3.5 max-w-md animate-fadeIn">
          <div className="p-2 rounded-xl bg-[#E8B4B8] text-[#181818] shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="text-xs">
            <div className="font-bold text-white text-sm">
              ¡Turno #{lastConfirmedBooking.referenceCode} agendado!
            </div>
            <div className="text-[#E5D7D8]">
              {lastConfirmedBooking.serviceName} con {lastConfirmedBooking.stylistName} el {lastConfirmedBooking.date} a las {lastConfirmedBooking.time} hs.
            </div>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-xs text-[#AAA] hover:text-white ml-auto"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          onExploreServices={handleScrollToServices}
        />

        {/* Services & Rates Section */}
        <ServicesSection onSelectService={handleSelectService} />

        {/* Portfolio Gallery with Lightbox */}
        <PortfolioGallery onBookLook={handleBookLook} />

        {/* About Jessica Lescano Section */}
        <AboutSection onOpenBooking={() => handleOpenBooking()} />

        {/* Client Reviews */}
        <Testimonials />

        {/* Contact Form & Studio Location */}
        <ContactSection />
      </main>

      {/* Global Footer */}
      <Footer
        onOpenBooking={handleOpenBooking}
      />

      {/* Interactive Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialServiceId={selectedServiceId}
        onBookingConfirmed={handleBookingConfirmed}
      />

      {/* Floating WhatsApp Bubble */}
      <FloatingWhatsApp />
    </div>
  );
}
