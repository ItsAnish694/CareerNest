import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-lg font-semibold mb-2">CareerNest</p>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} CareerNest. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <a
            href="#privacy"
            className="text-gray-300 hover:text-white transition-colors"
            aria-label="Privacy Policy"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            className="text-gray-300 hover:text-white transition-colors"
            aria-label="Terms of Service"
          >
            Terms of Service
          </a>
          <a
            href="#contact"
            className="text-gray-300 hover:text-white transition-colors"
            aria-label="Contact Us"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
