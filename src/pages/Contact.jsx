import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact({ onOpenContact, setActiveNav }) {
  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "offworldmediaafrica@gmail.com",
      link: "mailto:offworldmediaafrica@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone/WhatsApp",
      value: "+254-716-132-272",
      link: "tel:+254716132272",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "9VG4+RJG Water Sports Grounds, Off Prison Road, Kilifi",
      link: "https://maps.app.goo.gl/WPtjh9RXR55yWS2S9",
    },
  ];

  return (
    <section className="py-4 sm:py-6 lg:py-8 bg-[#2F364D] relative">
      {/* Soft background glow - Responsive */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 sm:-top-20 left-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-blue-700/10 blur-[80px] sm:blur-[100px] lg:blur-[130px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 sm:right-1/3 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-blue-500/10 blur-[70px] sm:blur-[90px] lg:blur-[110px] rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Main Container */}
        <div
          className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl
                      p-4 sm:p-6 lg:p-8 mx-2 sm:mx-4 lg:mx-auto"
        >
          {/* LEFT SECTION - Contact Info */}
          <div className="flex flex-col order-2 lg:order-1">
            <div className="mb-8 sm:mb-10 lg:mb-12">
              {/* Title - Responsive */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 text-center lg:text-left">
                Get In Touch With Us
              </h2>

              {/* Contact Info Cards - Responsive Spacing */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 mb-6 sm:mb-8 lg:mb-10">
                {contactInfo.map((info, idx) => {
                  const Icon = info.icon;
                  return (
                    <motion.a
                      key={idx}
                      href={info.link}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="
                        group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 
                        bg-white/10 backdrop-blur-xl 
                        hover:bg-white/15 
                        rounded-xl sm:rounded-2xl transition-all duration-300 
                        border border-white/10 hover:border-blue-300/20
                        shadow-lg shadow-black/20
                        w-full
                      "
                    >
                      {/* Icon Container - Responsive */}
                      <div
                        className="
                        flex-shrink-0 inline-flex items-center justify-center 
                        w-10 h-10 sm:w-12 sm:h-12
                        bg-white/10 backdrop-blur-lg 
                        rounded-lg sm:rounded-xl 
                        border border-white/20
                        group-hover:bg-blue-500/20
                        transition-all duration-300
                      "
                      >
                        <Icon
                          size={20}
                          className="sm:w-6 sm:h-6 w-5 h-5 text-blue-200"
                        />
                      </div>

                      {/* Text Content - Responsive */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-blue-200/70 mb-1">
                          {info.label}
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-blue-100 group-hover:text-white transition-colors duration-300 break-words">
                          {info.value}
                        </p>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION — MAP - Responsive */}
          <div className="lg:h-full lg:flex order-1 lg:order-2 mb-4 sm:mb-6 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="
                bg-white/5 backdrop-blur-xl 
                rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl w-full
                border border-white/10
                h-64 sm:h-72 md:h-80 lg:h-full min-h-64
              "
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.844733880548!2d39.85400177497316!3d-3.6229327963511464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x183fdd77b5e306bd%3A0x29d1cd979d54b312!2sWater%20Sports%20Ground!5e0!3m2!1sen!2ske!4v1762695133112!5m2!1sen!2ske"
                className="w-full h-full rounded-xl sm:rounded-2xl lg:rounded3xl"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kilifi Water Sports Ground"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
