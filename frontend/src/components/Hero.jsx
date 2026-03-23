import { cn } from "@/lib/utils";
import React from "react";
import { motion as Motion } from "framer-motion";
import policeOfficerImage from "../assets/img.jpg";

export default function Hero() {
  return (
    <div className="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 sm:min-h-[600px]">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
        )}
      />

      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-6">
          <Motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 flex justify-center md:order-1 md:justify-start"
          >
            <Motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="relative h-64 w-52 sm:h-80 sm:w-64 md:h-96 md:w-80">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/30 to-yellow-400/30 blur-2xl"></div>
                <div className="relative rounded-3xl border-4 border-amber-200 bg-white p-4 shadow-2xl transition-transform duration-300 hover:scale-105 sm:p-6">
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-amber-50">
                    <img
                      src={policeOfficerImage}
                      alt="Mr. OP - Virtual Assistant"
                      className="h-full w-full object-contain drop-shadow-2xl"
                    />

                    {[...Array(6)].map((_, i) => (
                      <Motion.div
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-amber-400"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Motion.div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="order-1 text-center md:order-2 md:text-left"
          >
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="mb-5 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="animate-gradient bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  Hello! I'm
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Mr. OP
                </span>
              </h1>
            </Motion.div>

            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-4 text-lg font-medium text-gray-700 sm:text-xl md:text-2xl"
            >
              Your Virtual Assistant
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-8 space-y-4"
            >
              <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
                I'm <span className="font-semibold text-amber-700">Mr. OP</span>, your virtual agent powered by <span className="font-semibold text-blue-700">Odisha Police</span>. I'm here to help you access multiple services and support systems that will assist you in times of need.
              </p>
            </Motion.div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
