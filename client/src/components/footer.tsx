import { Link } from "wouter";
import { CalendarCheckIcon, GithubIcon, TwitterIcon } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarCheckIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gray-800">Habitize</span>
            </div>
            <p className="text-gray-500 max-w-md mb-4">
              A simple yet powerful habit tracking app to help you build and maintain positive routines in your daily life.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">GitHub</span>
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Features
            </h3>
            <ul className="space-y-3">
              <li>
                <div 
                  onClick={() => window.location.href = "/"} 
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Dashboard
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/stats"} 
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Statistics
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/achievements"} 
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Achievements
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <div 
                  onClick={() => window.location.href = "/profile"} 
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Profile
                </div>
              </li>
              <li>
                <div 
                  onClick={() => window.location.href = "/settings"} 
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Settings
                </div>
              </li>
              <li>
                <div 
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => window.location.href = "/help"}
                >
                  Help & Support
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Habitize. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <div 
              className="text-sm text-gray-400 hover:text-gray-500 cursor-pointer"
              onClick={() => window.location.href = "/privacy"}
            >
              Privacy Policy
            </div>
            <div 
              className="text-sm text-gray-400 hover:text-gray-500 cursor-pointer"
              onClick={() => window.location.href = "/terms"}
            >
              Terms of Service
            </div>
            <div 
              className="text-sm text-gray-400 hover:text-gray-500 cursor-pointer"
              onClick={() => window.location.href = "/cookies"}
            >
              Cookie Policy
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}