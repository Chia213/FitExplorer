import React from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaUserShield, FaExclamationTriangle, FaBalanceScale, FaUserCheck, FaCreditCard, FaBan, FaGavel } from "react-icons/fa";
import { motion } from "framer-motion";

function TermsOfService() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const sections = [
    {
      icon: <FaUserCheck className="text-blue-500 dark:text-blue-400" size={24} />,
      title: "1. User Agreement",
      content: "By accessing or using FitExplorer, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. Your use of the service is also subject to our Privacy Policy, which can be found at our Privacy Policy page."
    },
    {
      icon: <FaUserShield className="text-purple-500 dark:text-purple-400" size={24} />,
      title: "2. Account Registration",
      content: "To use certain features of FitExplorer, you may be required to register for an account. You agree to provide accurate and complete information during the registration process and to update such information to keep it accurate and current. You are responsible for safeguarding your password and for all activities that occur under your account."
    },
    {
      icon: <FaShieldAlt className="text-green-500 dark:text-green-400" size={24} />,
      title: "3. Privacy",
      content: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using FitExplorer, you consent to our collection and use of personal data as outlined in our Privacy Policy."
    },
    {
      icon: <FaCreditCard className="text-amber-500 dark:text-amber-400" size={24} />,
      title: "4. Payments and Subscriptions",
      content: "FitExplorer may offer paid services or features. By subscribing to a paid service, you agree to pay the specified fees. We may change our fees at any time, but will provide notice of the changes before they take effect. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period."
    },
    {
      icon: <FaBalanceScale className="text-indigo-500 dark:text-indigo-400" size={24} />,
      title: "5. Acceptable Use",
      content: "You agree not to use FitExplorer for any unlawful purposes or to conduct any unlawful activity. You may not engage in any activity that interferes with or disrupts the service or servers and networks connected to the service. You agree not to post or transmit any material that is abusive, harassing, tortious, defamatory, or invasive of another's privacy."
    },
    {
      icon: <FaExclamationTriangle className="text-rose-500 dark:text-rose-400" size={24} />,
      title: "6. Health Disclaimer",
      content: "FitExplorer provides fitness and nutrition information for educational purposes only. The content is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or before beginning any new exercise or nutrition program."
    },
    {
      icon: <FaBan className="text-orange-500 dark:text-orange-400" size={24} />,
      title: "7. Termination",
      content: "We may terminate or suspend your account and access to FitExplorer immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination, your right to use the service will immediately cease."
    },
    {
      icon: <FaGavel className="text-teal-500 dark:text-teal-400" size={24} />,
      title: "8. Governing Law",
      content: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FitExplorer is established, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white py-16">
        <div 
          className="absolute inset-0 bg-black/10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="container mx-auto text-center relative z-10 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Terms of Service
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-4 text-blue-50">
              Our commitment to transparency and fairness
            </p>
            <p className="text-sm text-blue-100">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto"
        >
          {/* Introduction Section */}
          <motion.div 
            variants={cardVariants}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              Welcome to FitExplorer
            </h2>
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                These Terms of Service govern your use of the FitExplorer platform, including our website, mobile application, and all related services. Please read these terms carefully before using FitExplorer.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
              </p>
            </div>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div 
                key={index}
                variants={cardVariants}
                className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0"
              >
                <div className="flex items-center mb-4">
                  <div className="mr-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 pl-16">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Additional Legal Information */}
          <motion.div variants={cardVariants} className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Additional Information
            </h3>
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <p>
                <strong>Modifications:</strong> We reserve the right to modify these Terms at any time. We will provide notice of any material changes through the service or by other means. Your continued use of FitExplorer after such modifications will constitute your acknowledgment of the modified Terms.
              </p>
              <p>
                <strong>Contact Information:</strong> If you have any questions about these Terms, please contact us at <a href="mailto:fitexplorer.fitnessapp@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">fitexplorer.fitnessapp@gmail.com</a>.
              </p>
            </div>
          </motion.div>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Thank you for choosing FitExplorer
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <a
                href="mailto:fitexplorer.fitnessapp@gmail.com"
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 px-4 rounded-lg text-gray-800 dark:text-gray-200 font-medium transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Support: fitexplorer.fitnessapp@gmail.com
              </a>
            </div>
            <div className="flex justify-center gap-4">
              <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
              <span className="text-gray-400">•</span>
              <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline">About Us</Link>
              <span className="text-gray-400">•</span>
              <Link to="/faq" className="text-blue-600 dark:text-blue-400 hover:underline">FAQ</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TermsOfService; 