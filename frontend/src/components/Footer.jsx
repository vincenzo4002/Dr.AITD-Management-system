import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="font-sans bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">About A.I.T.D.</h3>
            <p className="text-sm leading-relaxed mb-4 text-gray-300">
              Dr. Ambedkar Institute of Technology for Divyangjan (A.I.T.D.) was established in 1997 at Kanpur, U.P., India by Government of Uttar Pradesh under World Bank assisted project.
              A.I.T.D. imparts technical education through B.Tech. and Diploma courses. The entire facility is barrier-free, where normal and disabled students study together.
            </p>
            <div className="w-16 h-1 bg-primary/50 rounded-full"></div>
          </div>

          {/* Quick Resources */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Quick Resources</h3>
            <ul className="space-y-2">
              {[
                { label: 'Download Prospectus', icon: '📄' },
                { label: 'Academic Calendar', icon: '📅' },
                { label: 'Attendance Portal', icon: '✅' },
                { label: 'Exam Results', icon: '📊' },
                { label: 'Scholarship Info', icon: '🎓' },
              ].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-sm font-medium transition-colors text-gray-300 hover:text-primary flex items-center gap-2">
                    <span>{item.icon}</span> {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="mt-1 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300">
                  Awadhpuri, Khyora, Lakhanpur, Kanpur - 208024, Uttar Pradesh, India
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300">
                  +91 1234567890
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300">
                  +91 8726321083
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300">
                  admin@college.edu
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-gray-300">
                  admissions@college.edu
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Connect With Us</h3>
            <p className="text-sm mb-4 font-medium text-gray-300">
              Follow us on social media for updates and news
            </p>
            <div className="flex space-x-4">
              {[FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTwitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-3 rounded-full transition-all transform hover:scale-110 shadow-lg bg-primary hover:bg-primary-hover text-white"
                >
                  <Icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-semibold text-gray-400 text-center md:text-left">
              © 2025 Dr AITD Management system. All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Sitemap'].map((item) => (
                <a key={item} href="#" className="text-sm font-medium transition-colors text-gray-400 hover:text-primary">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
