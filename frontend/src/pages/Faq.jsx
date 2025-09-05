import { useState } from "react";
import { FaQuestionCircle, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";

const FAQ = () => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ data
  const faqData = [
    {
      category: "General",
      questions: [
        {
          id: 1,
          question: "What is FitExplorer?",
          answer: "FitExplorer is a comprehensive fitness tracking application that helps you plan your workouts, track your progress, and achieve your fitness goals. With features like workout logging, routine creation, progress tracking, and more, FitExplorer is your all-in-one fitness companion."
        },
        {
          id: 2,
          question: "Is FitExplorer free to use?",
          answer: "Yes, FitExplorer is currently free to use with all core features. We may introduce premium features in the future, but the current functionality will remain free."
        },
        {
          id: 3,
          question: "How do I create an account?",
          answer: "To create an account, click on the 'Sign Up' button in the top navigation bar. You'll need to provide a username, email address, and password. You can also sign up using your Google account for faster registration."
        },
        {
          id: 4,
          question: "Can I use FitExplorer on my mobile device?",
          answer: "Yes, FitExplorer is fully responsive and can be used on desktop, tablet, and mobile devices. Simply access the website on your mobile browser for a mobile-optimized experience."
        }
      ]
    },
    {
      category: "Workouts & Exercises",
      questions: [
        {
          id: 5,
          question: "How do I log a workout?",
          answer: "To log a workout, navigate to the 'Workout Log' page from the navigation menu. Click on 'New Workout', enter the workout details including exercises, sets, reps, and weights, then save your workout."
        },
        {
          id: 6,
          question: "Can I create custom exercises?",
          answer: "Yes, you can create custom exercises if you can't find what you need in our exercise database. When logging a workout, click on 'Add Exercise' and then 'Create Custom Exercise' to add your own exercise with a name and category."
        },
        {
          id: 7,
          question: "What is the Workout Generator?",
          answer: "The Workout Generator is an AI-powered feature that creates personalized workout plans based on your fitness level, available equipment, and goals. It helps you discover new exercises and keeps your routine fresh and challenging."
        },
        {
          id: 8,
          question: "How do I create a routine?",
          answer: "To create a routine, go to the 'Routines' page, click 'New Routine', give it a name, and add exercises. Routines are reusable workout templates that save you time when logging similar workouts."
        }
      ]
    },
    {
      category: "Progress Tracking",
      questions: [
        {
          id: 9,
          question: "How can I track my progress?",
          answer: "Navigate to the 'Progress Tracker' page to view graphs and statistics about your workout history, strength gains, body measurements, and more. You can filter by date ranges and exercise types to get detailed insights."
        },
        {
          id: 10,
          question: "Can I track my body measurements?",
          answer: "Yes, you can track your body weight when logging workouts. This data is used to generate progress graphs in the Progress Tracker page."
        },
        {
          id: 11,
          question: "How do I set fitness goals?",
          answer: "You can set a goal weight in your profile settings. We're currently working on expanding our goal-setting features to include lifting targets, workout frequency goals, and more."
        }
      ]
    },
    {
      category: "Account & Settings",
      questions: [
        {
          id: 12,
          question: "How do I change my password?",
          answer: "Go to your Profile page and click on 'Change Password'. You'll need to enter your current password and then your new password twice to confirm the change."
        },
        {
          id: 13,
          question: "Can I change my username or email?",
          answer: "You can change your username from the Profile page by clicking 'Edit Username'. Email addresses cannot be changed at this time for security reasons."
        },
        {
          id: 14,
          question: "How do I delete my account?",
          answer: "To delete your account, go to your Profile page and scroll to the bottom. Click on 'Delete Account' and follow the confirmation steps. Please note that account deletion is permanent and all your data will be removed."
        },
        {
          id: 15,
          question: "How do I enable email notifications?",
          answer: "Go to your Profile page, find the Preferences section, and toggle on 'Email Notifications'. You can select the frequency of summary emails (weekly or monthly)."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          id: 16,
          question: "I found a bug. How do I report it?",
          answer: "We appreciate bug reports! Please contact us at support@fitexplorer.com with as much detail as possible about the issue you're experiencing, including steps to reproduce it."
        },
        {
          id: 17,
          question: "Is my data secure?",
          answer: "Yes, we take data security seriously. All personal data is encrypted, and we never share your information with third parties without your consent. See our Privacy Policy for more details."
        },
        {
          id: 18,
          question: "How do I request a new feature?",
          answer: "We love hearing from our users! Send your feature requests to feedback@fitexplorer.com. We regularly review suggestions and incorporate them into our development roadmap."
        }
      ]
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Filter questions based on search query
  const filteredFAQs = faqData.map(category => {
    const filteredQuestions = category.questions.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      ...category,
      questions: filteredQuestions
    };
  }).filter(category => category.questions.length > 0);

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <FaQuestionCircle className="mr-3 text-blue-500" /> Frequently Asked Questions
        </h1>
        
        {/* Search bar */}
        <div className="mb-8 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filteredFAQs.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FaQuestionCircle className="text-gray-400 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-500 dark:text-gray-400">
              We couldn't find any FAQs matching your search. Try different keywords or browse all questions below.
            </p>
          </div>
        ) : (
          filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
                {category.category}
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {category.questions.map((item, index) => {
                  const currentIndex = `${categoryIndex}-${index}`;
                  const isActive = activeIndex === currentIndex;
                  
                  return (
                    <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <button
                        onClick={() => toggleAccordion(currentIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        aria-expanded={isActive}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                        {isActive ? (
                          <FaChevronUp className="text-blue-500 flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isActive ? "max-h-screen p-6" : "max-h-0"
                        }`}
                      >
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        
        {/* Contact section */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="mb-4">If you couldn't find the answer to your question, feel free to contact us directly.</p>
          <a
            href="mailto:support@fitexplorer.com"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;