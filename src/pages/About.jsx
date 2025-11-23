import React from "react";
import { useState, useEffect } from "react";
import { Flag, Visibility } from "@mui/icons-material";

export default function About() {
  const values = [
    {
      title: "Vision",
      description:
        "To be a transformative force in global media, revealing the essence of life and capturing the heartbeat through photography, film, music and digital broadcasting.",
      icon: Visibility,
    },
    {
      title: "Mission",
      description:
        "To create powerful visuals and authentic sounds that inspire, resonate and move both hearts and minds.",
      icon: Flag,
    },
  ];

  return (
    <section className="pt-2 bg-[#2F364D] text-[#1A1C23] py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div
          className="relative mx-auto px-4 sm:px-5 lg:px-6 py-6 sm:py-8 lg:py-10 
                      grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center
                      bg-[#4c5375] backdrop-blur-2xl border border-[#4c5375] shadow-xl lg:shadow-2xl rounded-2xl lg:rounded-3xl
                      mx-3 sm:mx-4 lg:mx-auto"
        >
          {/* LEFT — Content Card */}
          <div className="bg-white backdrop-blur-xl rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#D5D8E0] shadow-xl order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 lg:mb-6 text-[#1A1C23]">
              About Offworld Media
            </h2>
            <p className="text-[#2F364D] leading-relaxed text-sm sm:text-base lg:text-lg mb-4 sm:mb-5 lg:mb-6">
              Founded in 2022, our studio has grown from a small team of
              passionate media personnel to a full-service creative staff with
              over 3+ years of industry expertise.
            </p>

            <div className="space-y-4 sm:space-y-5">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4">
                    <Icon
                      className="text-[#5A6DFF] mt-0.5 sm:mt-1"
                      style={{ fontSize: "1.5rem" }}
                      sx={{
                        fontSize: {
                          xs: "1.5rem",
                          sm: "1.75rem",
                          lg: "1.75rem",
                        },
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1C23] text-base sm:text-lg lg:text-xl mb-1 sm:mb-2">
                        {value.title}
                      </p>
                      <p className="text-[#2F364D] text-sm sm:text-base leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Image */}
          <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border border-[#D5D8E0] order-1 lg:order-2 mb-4 lg:mb-0">
            <img
              src="/Logo.webp"
              alt="Studio team"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
