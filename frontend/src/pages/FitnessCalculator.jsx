import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { FaCalculator, FaWeight, FaRuler, FaHeart, FaFire, FaDumbbell } from "react-icons/fa";
import "../styles/fitness-calculator-mobile.css";

const FitnessCalculator = () => {
  const { theme } = useTheme();
  const [activeCalculator, setActiveCalculator] = useState("bmi");
  const [formData, setFormData] = useState({
    // BMI calculator
    weight: "",
    height: "",
    weightUnit: "kg",
    heightUnit: "cm",
    
    // Body fat calculator
    gender: "male",
    age: "",
    neck: "",
    waist: "",
    hip: "", // only for females
    
    // TDEE calculator
    activityLevel: "moderate",
    goal: "maintain",
    
    // 1RM calculator
    liftWeight: "",
    reps: "",
    exercise: "bench",
  });
  
  const [results, setResults] = useState({
    bmi: null,
    bodyFat: null,
    tdee: null,
    oneRepMax: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculators = [
    { id: "bmi", name: "BMI Calculator", icon: <FaWeight /> },
    { id: "bodyFat", name: "Body Fat", icon: <FaRuler /> },
    { id: "tdee", name: "TDEE", icon: <FaFire /> },
    { id: "oneRepMax", name: "1RM Calculator", icon: <FaDumbbell /> },
  ];

  // BMI calculation
  const calculateBMI = () => {
    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    
    // Convert to standard units (kg and meters)
    if (formData.weightUnit === "lbs") {
      weight = weight * 0.453592; // Convert pounds to kg
    }
    
    if (formData.heightUnit === "cm") {
      height = height / 100; // Convert cm to meters
    } else if (formData.heightUnit === "ft") {
      height = height * 0.3048; // Convert feet to meters
    }
    
    if (weight > 0 && height > 0) {
      const bmiValue = weight / (height * height);
      let category = "";
      
      if (bmiValue < 18.5) {
        category = "Underweight";
      } else if (bmiValue < 25) {
        category = "Healthy";
      } else if (bmiValue < 30) {
        category = "Overweight";
      } else {
        category = "Obese";
      }
      
      setResults({
        ...results,
        bmi: {
          value: bmiValue.toFixed(1),
          category
        }
      });
    }
  };

  // Body fat calculation
  const calculateBodyFat = () => {
    const gender = formData.gender;
    const age = parseFloat(formData.age);
    const neck = parseFloat(formData.neck);
    const waist = parseFloat(formData.waist);
    const hip = parseFloat(formData.hip);
    
    if (gender === "male" && neck > 0 && waist > 0) {
      // U.S. Navy formula for men
      const bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(formData.height)) - 450;
      
      setResults({
        ...results,
        bodyFat: {
          value: bodyFatPercentage.toFixed(1),
          category: getBodyFatCategory(bodyFatPercentage, gender)
        }
      });
    } else if (gender === "female" && neck > 0 && waist > 0 && hip > 0) {
      // U.S. Navy formula for women
      const bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(formData.height)) - 450;
      
      setResults({
        ...results,
        bodyFat: {
          value: bodyFatPercentage.toFixed(1),
          category: getBodyFatCategory(bodyFatPercentage, gender)
        }
      });
    }
  };

  // Helper function for body fat categories
  const getBodyFatCategory = (percentage, gender) => {
    if (gender === "male") {
      if (percentage < 6) return "Essential fat";
      if (percentage < 14) return "Athletic";
      if (percentage < 18) return "Fitness";
      if (percentage < 25) return "Average";
      return "Obese";
    } else {
      if (percentage < 16) return "Essential fat";
      if (percentage < 21) return "Athletic";
      if (percentage < 25) return "Fitness";
      if (percentage < 32) return "Average";
      return "Obese";
    }
  };

  // TDEE calculation
  const calculateTDEE = () => {
    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    const age = parseFloat(formData.age);
    const gender = formData.gender;
    
    // Convert to standard units
    if (formData.weightUnit === "lbs") {
      weight = weight * 0.453592; // Convert pounds to kg
    }
    
    if (formData.heightUnit === "cm") {
      height = height; // Keep as cm for Harris-Benedict formula
    } else if (formData.heightUnit === "ft") {
      height = height * 30.48; // Convert feet to cm
    }
    
    if (weight > 0 && height > 0 && age > 0) {
      // Calculate BMR using Harris-Benedict equation
      let bmr;
      if (gender === "male") {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      
      // Activity factor
      let activityFactor;
      switch (formData.activityLevel) {
        case "sedentary":
          activityFactor = 1.2;
          break;
        case "light":
          activityFactor = 1.375;
          break;
        case "moderate":
          activityFactor = 1.55;
          break;
        case "active":
          activityFactor = 1.725;
          break;
        case "veryActive":
          activityFactor = 1.9;
          break;
        default:
          activityFactor = 1.55;
      }
      
      let tdee = bmr * activityFactor;
      
      // Adjust for goal
      let goalTdee;
      switch (formData.goal) {
        case "lose":
          goalTdee = tdee - 500; // Caloric deficit for weight loss
          break;
        case "gain":
          goalTdee = tdee + 500; // Caloric surplus for weight gain
          break;
        default:
          goalTdee = tdee; // Maintenance
      }
      
      setResults({
        ...results,
        tdee: {
          bmr: Math.round(bmr),
          maintenance: Math.round(tdee),
          goal: Math.round(goalTdee)
        }
      });
    }
  };

  // 1RM calculation
  const calculateOneRepMax = () => {
    const weight = parseFloat(formData.liftWeight);
    const reps = parseInt(formData.reps);
    
    if (weight > 0 && reps > 0 && reps <= 12) {
      // Brzycki formula: 1RM = weight × (36 / (37 - reps))
      const oneRepMax = weight * (36 / (37 - reps));
      
      // Calculate percentages for different rep ranges
      const percentages = {
        '1RM': oneRepMax,
        '2RM': oneRepMax * 0.97,
        '3RM': oneRepMax * 0.94,
        '5RM': oneRepMax * 0.87,
        '8RM': oneRepMax * 0.8,
        '10RM': oneRepMax * 0.75,
        '12RM': oneRepMax * 0.7
      };
      
      setResults({
        ...results,
        oneRepMax: {
          max: Math.round(oneRepMax),
          percentages: Object.entries(percentages).reduce((acc, [key, value]) => {
            acc[key] = Math.round(value);
            return acc;
          }, {})
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    switch (activeCalculator) {
      case "bmi":
        calculateBMI();
        break;
      case "bodyFat":
        calculateBodyFat();
        break;
      case "tdee":
        calculateTDEE();
        break;
      case "oneRepMax":
        calculateOneRepMax();
        break;
      default:
        break;
    }
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "bmi":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Body Mass Index (BMI) Calculator</h2>
            <p className="mb-4 text-muted-foreground">
              BMI is a measure of body fat based on height and weight that applies to adult men and women.
            </p>
            
            <form onSubmit={handleSubmit} className="form-mobile">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Weight</label>
                  <div className="input-with-unit-mobile">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="Enter weight"
                      className="flex-grow p-2 border-0 rounded-l bg-background text-foreground placeholder-muted-foreground"
                      required
                    />
                    <select
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleInputChange}
                      className="p-2 border-0 rounded-r bg-muted text-foreground"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Height</label>
                  <div className="input-with-unit-mobile">
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="Enter height"
                      className="flex-grow p-2 border-0 rounded-l bg-background text-foreground placeholder-muted-foreground"
                      required
                    />
                    <select
                      name="heightUnit"
                      value={formData.heightUnit}
                      onChange={handleInputChange}
                      className="p-2 border-0 rounded-r bg-muted text-foreground"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn-calculate-mobile"
              >
                Calculate BMI
              </button>
            </form>
            
            {results.bmi && (
              <div className="results-mobile">
                <div className="results-header-mobile">
                  <h3 className="results-title-mobile">Your BMI Result</h3>
                  <div className="results-value-mobile">
                    {results.bmi.value}
                  </div>
                  <div className={`results-category-mobile ${
                    results.bmi.category === "Healthy" 
                      ? "text-accent" 
                      : results.bmi.category === "Underweight" || results.bmi.category === "Overweight"
                      ? "text-warning"
                      : "text-destructive"
                  }`}>
                    {results.bmi.category}
                  </div>
                </div>
                
                <div className="bmi-categories-mobile">
                  <div className="title">BMI Categories:</div>
                  <ul>
                    <li>Under 18.5: Underweight</li>
                    <li>18.5 - 24.9: Healthy</li>
                    <li>25 - 29.9: Overweight</li>
                    <li>30 or higher: Obese</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
        
      case "bodyFat":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Body Fat Percentage Calculator</h2>
            <p className="mb-4 text-muted-foreground">
              Estimate your body fat percentage using the U.S. Navy method, which requires circumference measurements.
            </p>
            
            <form onSubmit={handleSubmit} className="form-mobile">
              <div className="grid grid-cols-1 gap-4">
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Gender</label>
                  <div className="radio-group-mobile">
                    <label className="radio-option-mobile">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleInputChange}
                      />
                      Male
                    </label>
                    <label className="radio-option-mobile">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleInputChange}
                      />
                      Female
                    </label>
                  </div>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="Enter height in cm"
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                    required
                  />
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age in years"
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                    required
                  />
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Neck Circumference (cm)</label>
                  <input
                    type="number"
                    name="neck"
                    value={formData.neck}
                    onChange={handleInputChange}
                    placeholder="Measure at the narrowest point"
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                    required
                  />
                  <div className="helper-text-mobile">
                    Measure around the narrowest part of your neck, just below the Adam's apple
                  </div>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Waist Circumference (cm)</label>
                  <input
                    type="number"
                    name="waist"
                    value={formData.waist}
                    onChange={handleInputChange}
                    placeholder="Measure at the navel"
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                    required
                  />
                  <div className="helper-text-mobile">
                    Measure around your waist at the level of your navel, after exhaling
                  </div>
                </div>
                
                {formData.gender === "female" && (
                  <div className="form-group-mobile">
                    <label className="block text-sm font-medium mb-1 text-foreground">Hip Circumference (cm)</label>
                    <input
                      type="number"
                      name="hip"
                      value={formData.hip}
                      onChange={handleInputChange}
                      placeholder="Measure at the widest point"
                      className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                      required
                    />
                    <div className="helper-text-mobile">
                      Measure around the widest part of your hips
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="btn-calculate-mobile"
              >
                Calculate Body Fat
              </button>
            </form>
            
            {results.bodyFat && (
              <div className="results-mobile">
                <div className="results-header-mobile">
                  <h3 className="results-title-mobile">Your Body Fat Percentage</h3>
                  <div className="results-value-mobile">
                    {results.bodyFat.value}%
                  </div>
                  <div className={`results-category-mobile ${
                    results.bodyFat.category === "Athletic" || results.bodyFat.category === "Fitness"
                      ? "text-accent" 
                      : results.bodyFat.category === "Average"
                      ? "text-warning"
                      : "text-destructive"
                  }`}>
                    Category: {results.bodyFat.category}
                  </div>
                </div>
                
                <div className="bodyfat-categories-mobile">
                  <div className="title">Body Fat Categories ({formData.gender === "male" ? "Men" : "Women"}):</div>
                  {formData.gender === "male" ? (
                    <ul>
                      <li>2-5%: Essential fat</li>
                      <li>6-13%: Athletic</li>
                      <li>14-17%: Fitness</li>
                      <li>18-24%: Average</li>
                      <li>25%+: Obese</li>
                    </ul>
                  ) : (
                    <ul>
                      <li>10-15%: Essential fat</li>
                      <li>16-20%: Athletic</li>
                      <li>21-24%: Fitness</li>
                      <li>25-31%: Average</li>
                      <li>32%+: Obese</li>
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        
      case "tdee":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Total Daily Energy Expenditure (TDEE) Calculator</h2>
            <p className="mb-4 text-muted-foreground">
              TDEE is an estimation of how many calories you burn per day when exercise is taken into account.
            </p>
            
            <form onSubmit={handleSubmit} className="form-mobile">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Weight</label>
                  <div className="input-with-unit-mobile">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="Enter weight"
                      className="flex-grow p-2 border-0 rounded-l bg-background text-foreground placeholder-muted-foreground"
                      required
                    />
                    <select
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleInputChange}
                      className="p-2 border-0 rounded-r bg-muted text-foreground"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Height</label>
                  <div className="input-with-unit-mobile">
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="Enter height"
                      className="flex-grow p-2 border-0 rounded-l bg-background text-foreground placeholder-muted-foreground"
                      required
                    />
                    <select
                      name="heightUnit"
                      value={formData.heightUnit}
                      onChange={handleInputChange}
                      className="p-2 border-0 rounded-r bg-muted text-foreground"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age in years"
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                    required
                  />
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Gender</label>
                  <div className="radio-group-mobile">
                    <label className="radio-option-mobile">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleInputChange}
                      />
                      Male
                    </label>
                    <label className="radio-option-mobile">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleInputChange}
                      />
                      Female
                    </label>
                  </div>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                  >
                    <option value="sedentary">Sedentary (office job, little exercise)</option>
                    <option value="light">Light Activity (1-2 days of exercise)</option>
                    <option value="moderate">Moderate Activity (3-5 days of exercise)</option>
                    <option value="active">Very Active (6-7 days of exercise)</option>
                    <option value="veryActive">Extremely Active (physical job + training)</option>
                  </select>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Goal</label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn-calculate-mobile"
              >
                Calculate TDEE
              </button>
            </form>
            
            {results.tdee && (
              <div className="results-mobile">
                <div className="results-header-mobile">
                  <h3 className="results-title-mobile">Your Daily Calorie Needs</h3>
                </div>
                
                <div className="tdee-grid-mobile">
                  <div className="tdee-card-mobile">
                    <div className="label">BMR</div>
                    <div className="value">{results.tdee.bmr} kcal</div>
                    <div className="description">Calories at complete rest</div>
                  </div>
                  
                  <div className="tdee-card-mobile">
                    <div className="label">Maintenance</div>
                    <div className="value">{results.tdee.maintenance} kcal</div>
                    <div className="description">Calories to maintain weight</div>
                  </div>
                  
                  <div className="tdee-card-mobile">
                    <div className="label">
                      {formData.goal === "lose" ? "Weight Loss" : formData.goal === "gain" ? "Weight Gain" : "Maintenance"}
                    </div>
                    <div className="value" style={{color: 'var(--primary)'}}>
                      {results.tdee.goal} kcal
                    </div>
                    <div className="description">Recommended daily intake</div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-left">
                  <p>These calculations provide an estimate based on the Harris-Benedict equation. Individual needs may vary.</p>
                  {formData.goal === "lose" && (
                    <p className="mt-2">For weight loss, we've created a moderate 500 calorie deficit. This should result in about 1 pound of weight loss per week.</p>
                  )}
                  {formData.goal === "gain" && (
                    <p className="mt-2">For weight gain, we've added a 500 calorie surplus. This should result in about 1 pound of weight gain per week.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        
      case "oneRepMax":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">One-Rep Max (1RM) Calculator</h2>
            <p className="mb-4 text-muted-foreground">
              Calculate your one-rep max and see how much weight you should lift for different rep ranges.
            </p>
            
            <form onSubmit={handleSubmit} className="form-mobile">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Exercise</label>
                  <select
                    name="exercise"
                    value={formData.exercise}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                  >
                    <option value="bench">Bench Press</option>
                    <option value="squat">Squat</option>
                    <option value="deadlift">Deadlift</option>
                    <option value="overhead">Overhead Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Weight Lifted</label>
                  <div className="input-with-unit-mobile">
                    <input
                      type="number"
                      name="liftWeight"
                      value={formData.liftWeight}
                      onChange={handleInputChange}
                      placeholder="Enter weight"
                      className="flex-grow p-2 border-0 rounded-l bg-background text-foreground placeholder-muted-foreground"
                      required
                    />
                    <select
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleInputChange}
                      className="p-2 border-0 rounded-r bg-muted text-foreground"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group-mobile">
                  <label className="block text-sm font-medium mb-1 text-foreground">Reps Performed</label>
                  <input
                    type="number"
                    name="reps"
                    value={formData.reps}
                    onChange={handleInputChange}
                    placeholder="Enter number of reps"
                    min="1"
                    max="12"
                    className="w-full p-2 border border-border rounded bg-background text-foreground placeholder-muted-foreground"
                    required
                  />
                  <div className="helper-text-mobile">
                    Enter between 1-12 reps for accurate calculations
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn-calculate-mobile"
              >
                Calculate 1RM
              </button>
            </form>
            
            {results.oneRepMax && (
              <div className="results-mobile">
                <div className="results-header-mobile">
                  <h3 className="results-title-mobile">Your One-Rep Max ({formData.exercise})</h3>
                  <div className="results-value-mobile">
                    {results.oneRepMax.max} {formData.weightUnit}
                  </div>
                </div>
                
                <h4 className="font-medium mb-2 text-center">Estimated max weight at different rep ranges:</h4>
                <div className="onerm-grid-mobile">
                  {Object.entries(results.oneRepMax.percentages).map(([reps, weight]) => (
                    <div key={reps} className="onerm-card-mobile">
                      <div className="reps">{reps}</div>
                      <div className="weight">{weight} {formData.weightUnit}</div>
                    </div>
                  ))}
                </div>
                
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  These calculations are estimates based on the Brzycki formula. Actual performance may vary based on individual factors.
                </p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen fitness-calculator-mobile bg-background text-foreground">
      <div className="fitness-calculator-container-mobile">
        <h1 className="fitness-calculator-title-mobile flex items-center justify-center">
          <FaCalculator className="mr-3 text-primary" /> Fitness Calculators
        </h1>
        
        <div className="calculator-tabs-mobile">
          {calculators.map((calc) => (
            <button
              key={calc.id}
              onClick={() => setActiveCalculator(calc.id)}
              className={`calculator-tab-mobile flex items-center ${
                activeCalculator === calc.id
                  ? "active"
                  : "bg-card hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <span className="mr-2">{calc.icon}</span>
              {calc.name}
            </button>
          ))}
        </div>
        
        <div className="fitness-calculator-card-mobile">
          {renderCalculator()}
        </div>
      </div>
    </div>
  );
};

export default FitnessCalculator;