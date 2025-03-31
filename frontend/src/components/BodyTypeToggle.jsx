import React from "react";

const BodyTypeToggle = ({ bodyType, onToggle }) => {
  return (
    <div className="flex items-center justify-center">
      <label
        htmlFor="body-type-toggle"
        className="flex items-center cursor-pointer"
      >
        <div className="relative">
          {/* Toggle Input */}
          <input
            type="checkbox"
            id="body-type-toggle"
            className="sr-only"
            checked={bodyType === "female"}
            onChange={onToggle}
          />

          {/* Track */}
          <div
            className={`
              w-16 h-8 rounded-full shadow-inner
              ${bodyType === "female" ? "bg-pink-500" : "bg-blue-500"}
              transition-colors duration-300 ease-in-out
            `}
          ></div>

          {/* Slider */}
          <div
            className={`
              absolute top-1 left-1 w-6 h-6 rounded-full shadow 
              transform transition-transform duration-300 ease-in-out
              ${
                bodyType === "female" ? "translate-x-full bg-white" : "bg-white"
              }
            `}
          ></div>
        </div>

        {/* Label */}
        <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium">
          {bodyType === "female" ? "Female" : "Male"}
        </span>
      </label>
    </div>
  );
};

export default BodyTypeToggle;
