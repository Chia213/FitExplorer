import React from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaLock,
  FaUserShield,
  FaExclamationTriangle,
  FaGlobe,
  FaCookie,
  FaHistory,
  FaRegTrashAlt,
} from "react-icons/fa";

function PrivacyPolicy() {
  // Get current date for last updated
  const lastUpdated = "March 31, 2025";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <FaShieldAlt size={36} />
              <h1 className="text-3xl font-bold ml-3">Privacy Policy</h1>
            </div>
            <p className="text-center text-lg">
              Your privacy is important to us. This document explains how we
              collect, use, and protect your data.
            </p>
            <p className="text-center mt-2 text-sm">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Table of Contents */}
          <div className="p-8 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Contents
            </h2>
            <nav className="grid md:grid-cols-2 gap-2">
              {[
                { id: "information", name: "Information We Collect" },
                { id: "use", name: "How We Use Your Information" },
                { id: "share", name: "Information Sharing" },
                { id: "security", name: "Data Security" },
                { id: "cookies", name: "Cookies and Tracking" },
                { id: "rights", name: "Your Rights & Choices" },
                { id: "retention", name: "Data Retention" },
                { id: "international", name: "International Transfers" },
                { id: "changes", name: "Changes to This Policy" },
                { id: "contact", name: "Contact Us" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <section id="information" className="mb-10">
              <div className="flex items-center mb-4">
                <FaUserShield
                  className="text-blue-500 dark:text-blue-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Information We Collect
                </h2>
              </div>
              <div className="ml-9">
                <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                  Personal Information
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We collect the following types of personal information when
                  you create an account, use our services, or contact our
                  support team:
                </p>
                <ul className="list-disc ml-6 mb-4 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">
                    Contact information (name, email address)
                  </li>
                  <li className="mb-2">
                    Account credentials (username, password)
                  </li>
                  <li className="mb-2">
                    Profile information (age, gender, height, weight, profile
                    picture)
                  </li>
                  <li className="mb-2">Fitness goals and preferences</li>
                </ul>

                <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                  Fitness and Health Data
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  When you use FitExplorer to track your fitness journey, we
                  collect:
                </p>
                <ul className="list-disc ml-6 mb-4 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">Workout history and exercise records</li>
                  <li className="mb-2">
                    Performance metrics (sets, reps, weights, duration)
                  </li>
                  <li className="mb-2">
                    Body measurements and weight tracking data
                  </li>
                  <li className="mb-2">Notes and feedback about workouts</li>
                </ul>

                <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                  Device and Usage Information
                </h3>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We automatically collect certain information about your device
                  and how you interact with our platform:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">
                    Device type, operating system, and browser information
                  </li>
                  <li className="mb-2">
                    IP address and approximate location based on IP
                  </li>
                  <li className="mb-2">
                    Usage patterns and feature interactions
                  </li>
                  <li className="mb-2">Login dates and session durations</li>
                </ul>
              </div>
            </section>

            <section id="use" className="mb-10">
              <div className="flex items-center mb-4">
                <FaGlobe
                  className="text-green-500 dark:text-green-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  How We Use Your Information
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-3">
                    <span className="font-medium">
                      Providing and Improving Services:
                    </span>{" "}
                    To operate, maintain, and enhance the functionality of
                    FitExplorer, including creating personalized workout
                    recommendations, tracking your fitness progress, and
                    improving your user experience.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">Account Management:</span> To
                    create and manage your account, authenticate your identity
                    when you log in, and maintain your user profile.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">Communication:</span> To
                    communicate with you about your account, respond to your
                    inquiries, send service-related announcements, and provide
                    customer support.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">
                      Analytics and Optimization:
                    </span>{" "}
                    To analyze usage patterns, troubleshoot technical issues,
                    and optimize the performance and effectiveness of our
                    platform.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">Security:</span> To detect,
                    prevent, and address technical issues, fraudulent
                    activities, or violations of our terms of service.
                  </li>
                </ul>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mt-4">
                  <p className="text-yellow-800 dark:text-yellow-200 flex items-start">
                    <FaExclamationTriangle className="mr-2 mt-1 flex-shrink-0" />
                    <span>
                      We will never use your health and fitness data for
                      advertising purposes or sell it to third parties without
                      your explicit consent.
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section id="share" className="mb-10">
              <div className="flex items-center mb-4">
                <FaLock
                  className="text-purple-500 dark:text-purple-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Information Sharing
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We limit the sharing of your personal information to the
                  following circumstances:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-3">
                    <span className="font-medium">Service Providers:</span> We
                    may share information with trusted third-party service
                    providers who perform services on our behalf, such as
                    hosting, data analysis, payment processing, and customer
                    support. These providers are contractually obligated to use
                    the information only for the purposes of providing services
                    to us.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">With Your Consent:</span> We
                    may share your information with third parties when you
                    explicitly consent to such sharing, such as when you choose
                    to share your workout progress on social media.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">Legal Requirements:</span> We
                    may disclose your information if required to do so by law or
                    in response to valid requests by public authorities (e.g., a
                    court or government agency).
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">Business Transfers:</span> If
                    FitExplorer is involved in a merger, acquisition, or sale of
                    all or a portion of its assets, your information may be
                    transferred as part of that transaction. We will notify you
                    via email and/or a prominent notice on our website of any
                    change in ownership or uses of your personal information.
                  </li>
                </ul>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    We do not sell, rent, or lease your personal information to
                    third parties for their marketing purposes.
                  </p>
                </div>
              </div>
            </section>

            <section id="security" className="mb-10">
              <div className="flex items-center mb-4">
                <FaShieldAlt
                  className="text-red-500 dark:text-red-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Security
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We implement appropriate technical and organizational measures
                  to protect your personal information:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">
                    Encryption of sensitive data at rest and in transit
                    (HTTPS/TLS)
                  </li>
                  <li className="mb-2">
                    Regular security assessments and vulnerability scanning
                  </li>
                  <li className="mb-2">
                    Secure password hashing and authentication protocols
                  </li>
                  <li className="mb-2">
                    Limited access to personal information by authorized
                    personnel only
                  </li>
                  <li className="mb-2">
                    Data backup and disaster recovery procedures
                  </li>
                </ul>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  While we strive to use commercially acceptable means to
                  protect your personal information, no method of transmission
                  over the Internet or method of electronic storage is 100%
                  secure. We cannot guarantee its absolute security.
                </p>
              </div>
            </section>

            <section id="cookies" className="mb-10">
              <div className="flex items-center mb-4">
                <FaCookie
                  className="text-orange-500 dark:text-orange-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cookies and Tracking
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  FitExplorer uses cookies and similar tracking technologies to
                  enhance your experience on our platform:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-3">
                    <span className="font-medium">Essential Cookies:</span>{" "}
                    Required for the basic functionality of our platform, such
                    as authentication, security, and remembering your
                    preferences.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">Analytics Cookies:</span> Help
                    us understand how users interact with our platform, allowing
                    us to improve its features and performance.
                  </li>
                  <li className="mb-3">
                    <span className="font-medium">Functionality Cookies:</span>{" "}
                    Enable enhanced features, such as remembering your
                    preferences and settings.
                  </li>
                </ul>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  You can manage cookie preferences through your browser
                  settings. However, disabling certain cookies may limit
                  functionality.
                </p>
              </div>
            </section>

            <section id="rights" className="mb-10">
              <div className="flex items-center mb-4">
                <FaUserShield
                  className="text-teal-500 dark:text-teal-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Rights & Choices
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Depending on your location, you may have certain rights
                  regarding your personal information:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">
                    Access and receive a copy of the personal information we
                    hold about you
                  </li>
                  <li className="mb-2">
                    Request correction of inaccurate or incomplete personal
                    information
                  </li>
                  <li className="mb-2">
                    Request deletion of your personal information in certain
                    circumstances
                  </li>
                  <li className="mb-2">
                    Object to or restrict the processing of your personal
                    information
                  </li>
                  <li className="mb-2">
                    Data portability (receiving your data in a structured,
                    commonly used format)
                  </li>
                  <li className="mb-2">
                    Withdraw consent at any time for processing based on consent
                  </li>
                </ul>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  To exercise these rights, please contact us using the
                  information in the "Contact Us" section. We will respond to
                  your request within the timeframe required by applicable law.
                </p>
              </div>
            </section>

            <section id="retention" className="mb-10">
              <div className="flex items-center mb-4">
                <FaHistory
                  className="text-indigo-500 dark:text-indigo-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Retention
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We retain your personal information for as long as necessary
                  to fulfill the purposes outlined in this Privacy Policy,
                  unless a longer retention period is required or permitted by
                  law, such as for legal, tax, or regulatory reasons.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  When determining the appropriate retention period, we
                  consider:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">
                    The amount, nature, and sensitivity of the personal
                    information
                  </li>
                  <li className="mb-2">
                    The potential risk of harm from unauthorized use or
                    disclosure
                  </li>
                  <li className="mb-2">
                    The purposes for which we process the data
                  </li>
                  <li className="mb-2">
                    Whether we can achieve those purposes through other means
                  </li>
                </ul>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  When your account is deleted, we will securely destroy your
                  personal information or anonymize it so it can no longer be
                  associated with you.
                </p>
              </div>
            </section>

            <section id="international" className="mb-10">
              <div className="flex items-center mb-4">
                <FaGlobe
                  className="text-blue-500 dark:text-blue-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  International Transfers
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  FitExplorer operates globally, which means your information
                  may be transferred to, stored, and processed in countries
                  other than the one in which you reside. These countries may
                  have data protection laws that differ from those in your
                  country of residence.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  When we transfer your personal information internationally, we
                  take appropriate safeguards to ensure that your information
                  remains protected in accordance with this Privacy Policy and
                  applicable law, including:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">
                    Data transfer agreements incorporating standard contractual
                    clauses
                  </li>
                  <li className="mb-2">
                    Privacy Shield certification where applicable
                  </li>
                  <li className="mb-2">Vendor and partner assessments</li>
                </ul>
              </div>
            </section>

            <section id="changes" className="mb-10">
              <div className="flex items-center mb-4">
                <FaRegTrashAlt
                  className="text-gray-500 dark:text-gray-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Changes to This Policy
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons. The revised policy will be effective
                  immediately upon posting on our website.
                </p>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  We will notify you of any material changes by:
                </p>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">Posting a notice on our website</li>
                  <li className="mb-2">
                    Sending an email to the address associated with your account
                  </li>
                  <li className="mb-2">
                    Displaying a notification when you access our platform
                  </li>
                </ul>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  We encourage you to review this Privacy Policy periodically to
                  stay informed about our information practices.
                </p>
              </div>
            </section>

            <section id="contact" className="mb-10">
              <div className="flex items-center mb-4">
                <FaUserShield
                  className="text-green-500 dark:text-green-400 mr-3"
                  size={24}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Contact Us
                </h2>
              </div>
              <div className="ml-9">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or our privacy practices, please contact
                  us at:
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200">
                    FitExplorer Team
                  </p>
                  <p className="text-gray-800 dark:text-gray-200">
                    Email:{" "}
                    <a
                      href="mailto:privacy@fitexplorer.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      chiaranchber@gmail.com
                    </a>
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 mt-1">
                    Alternative Contact:{" "}
                    <a
                      href="mailto:chiranchber@gmail.com"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      chiranchber@gmail.com
                    </a>
                  </p>
                </div>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  We will respond to your inquiry within 30 days. Thank you for
                  your Patience!
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 dark:bg-gray-700 p-6 text-center">
            <Link
              to="/about"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to About Page
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} FitExplorer. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
