import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import policeOfficerImage from "../assets/img.jpg";

export default function Hero() {
  return (
    <div className="relative w-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-50 overflow-hidden">
      {/* Grid Background */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
        )} />
      
      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6 items-center">
          {/* Left Side - Image with Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center md:justify-start"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="relative w-64 h-80 md:w-80 md:h-96">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-yellow-400/30 rounded-3xl blur-2xl"></div>
                
                {/* Image container */}
                <div className="relative bg-white rounded-3xl shadow-2xl border-4 border-amber-200 p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={policeOfficerImage} 
                      alt="Mr. OP - Virtual Assistant" 
                      className="w-full h-full object-contain drop-shadow-2xl" 
                    />
                    
                    {/* Animated sparkles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-amber-400 rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${10 + (i % 3) * 30}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent animate-gradient">
                  Hello! I'm
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Mr. OP
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-700 mb-4 font-medium"
            >
              Your Virtual Assistant
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-4 mb-8"
            >
              <p className="text-lg text-gray-600 leading-relaxed">
                I'm <span className="font-semibold text-amber-700">Mr. OP</span>, your virtual agent powered by <span className="font-semibold text-blue-700">Odisha Police</span>. I'm here to help you access multiple services and support systems that will assist you in times of need.
              </p>
              
              {/* <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-200 shadow-lg">
                <p className="text-base text-gray-700 leading-relaxed">
                  <span className="font-bold text-amber-700">Services I can help you with:</span>
                </p>
                <ul className="mt-3 space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>File cyber fraud complaints and track case progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Detect and report phishing URLs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Report women safety and harassment incidents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Get real-time updates on your complaints</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Coordinate with police and banks seamlessly</span>
                  </li>
                </ul>
              </div> */}
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Get Started</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                to="/cyber-fraud-report"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-amber-300 text-amber-700 rounded-xl font-bold text-lg hover:bg-amber-50 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>Report Fraud</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </Link>
            </motion.div> */}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
