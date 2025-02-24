const calculateHealthScore = ({
    age,
    gender,
    weight,
    height,
    mealFrequency,
    activityLevel,
    dietaryPreferences = [],
    dietaryNote = "",
    fitnessGoals = [],
    fitnessNote = "",
    healthCondition = [],
    healthNote = ""
  }) => {
    let totalScore = 0;
    let maxPossibleScore = 75; // We want the score to be capped at 75
  
    // Calculate BMI if weight and height are available
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      totalScore += calculateBMIScore(bmi);
    }
  
    // Score meal frequency if available
    if (mealFrequency) {
      totalScore += calculateMealFrequencyScore(mealFrequency);
    }
  
    // Score activity level if available
    if (activityLevel) {
      totalScore += calculateActivityScore(activityLevel);
    }
  
    // Score dietary preferences if available
    if (dietaryPreferences.length > 0) {
      totalScore += calculateDietaryScore(dietaryPreferences);
    }
  
    // Score fitness goals if available
    if (fitnessGoals.length > 0) {
      totalScore += calculateFitnessGoalsScore(fitnessGoals);
    }
  
    // Adjust for health conditions if present
    if (healthCondition.length > 0) {
      totalScore += calculateHealthConditionImpact(healthCondition);
    }
  
    // Ensure the total score does not exceed 75
    return Math.min(totalScore, maxPossibleScore);
  };
  
  // Example Calculation Functions (Feel free to customize these ranges/weights):
  const calculateBMIScore = (bmi) => {
    if (bmi < 18.5) return 5; // Underweight
    if (bmi < 25) return 15; // Normal weight
    if (bmi < 30) return 10; // Overweight
    return 5; // Obese or higher
  };
  
  const calculateMealFrequencyScore = (frequency) => {
    if (frequency === 3) return 10; // Ideal
    if (frequency === 4) return 7; // Good
    if (frequency === 2) return 5; // Acceptable
    return 3; // Suboptimal or poor
  };
  
  const calculateActivityScore = (level) => {
    const scores = {
      "Sedentary": 5,
      "Lightly active": 10,
      "Active": 15,
      "Very active": 20
    };
    return scores[level] || 5;
  };
  
  const calculateDietaryScore = (preferences) => {
    const healthyDiets = [
      "Vegetarian", "Vegan", "Keto", "Low fat", "Low carb",
      "Sugar free", "Gluten-free"
    ];
    let score = 0;
  
    preferences.forEach(pref => {
      if (healthyDiets.includes(pref)) {
        score += 3; // Small increment per healthy preference
      }
    });
  
    return Math.min(10, score); // Cap at 10 points
  };
  
  const calculateFitnessGoalsScore = (goals) => {
    const validGoals = [
      "Weight loss", "Muscle gain", "Control diabetes", 
      "Manage blood sugar", "Postpartum Recovery"
    ];
    let score = 0;
  
    goals.forEach(goal => {
      if (validGoals.includes(goal)) {
        score += 2;
      }
    });
  
    return Math.min(10, score); // Cap at 10 points
  };
  
  const calculateHealthConditionImpact = (conditions) => {
    let score = 10; // Start with full points
    const severeConditions = ["Diabetes", "High Blood Pressure", "Thyroid Issues"];
  
    conditions.forEach(condition => {
      if (severeConditions.includes(condition)) {
        score -= 3;
      } else {
        score -= 1;
      }
    });
  
    return Math.max(0, score); // Keep the minimum impact at zero
  };
  
  export default calculateHealthScore;
  