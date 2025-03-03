function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">About FitExplorer</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
          FitExplorer is a fitness tracking app designed to help users log their
          workouts, track progress, and discover new exercises. Stay fit, stay
          strong!
        </p>
      </div>
    </div>
  );
}

export default About;