from database import SessionLocal
from models import CommonFood
from datetime import datetime, timezone
import random  # for generating slight variations in nutritional values

# Create database session
db = SessionLocal()

# Check existing foods count
existing_count = db.query(CommonFood).count()
print(f"Current food count: {existing_count}")

# Foods organized by food groups
new_foods = {
    "Fruits": [
        {"name": "Strawberries", "calories": 49, "protein": 1.0, "carbs": 11.7, "fat": 0.3, "serving_size": "1 cup"},
        {"name": "Blueberries", "calories": 84, "protein": 1.1, "carbs": 21.0, "fat": 0.5, "serving_size": "1 cup"},
        {"name": "Oranges", "calories": 62, "protein": 1.2, "carbs": 15.4, "fat": 0.2, "serving_size": "1 medium"},
        {"name": "Watermelon", "calories": 46, "protein": 0.9, "carbs": 11.5, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Grapes", "calories": 62, "protein": 0.6, "carbs": 16.0, "fat": 0.3, "serving_size": "1 cup"},
        {"name": "Pineapple", "calories": 82, "protein": 0.9, "carbs": 21.6, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Mango", "calories": 99, "protein": 1.4, "carbs": 24.7, "fat": 0.6, "serving_size": "1 medium"},
        {"name": "Kiwi", "calories": 42, "protein": 0.8, "carbs": 10.1, "fat": 0.4, "serving_size": "1 medium"},
        {"name": "Pear", "calories": 101, "protein": 0.6, "carbs": 27.0, "fat": 0.3, "serving_size": "1 medium"},
        {"name": "Peach", "calories": 59, "protein": 1.4, "carbs": 14.3, "fat": 0.4, "serving_size": "1 medium"},
    ],
    "Vegetables": [
        {"name": "Spinach", "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "serving_size": "1 cup"},
        {"name": "Kale", "calories": 33, "protein": 2.2, "carbs": 6.7, "fat": 0.5, "serving_size": "1 cup"},
        {"name": "Bell Peppers", "calories": 31, "protein": 1.0, "carbs": 7.0, "fat": 0.3, "serving_size": "1 medium"},
        {"name": "Carrots", "calories": 50, "protein": 1.1, "carbs": 12.0, "fat": 0.3, "serving_size": "1 cup"},
        {"name": "Zucchini", "calories": 33, "protein": 2.4, "carbs": 6.0, "fat": 0.4, "serving_size": "1 medium"},
        {"name": "Tomatoes", "calories": 32, "protein": 1.6, "carbs": 7.0, "fat": 0.4, "serving_size": "1 medium"},
        {"name": "Cauliflower", "calories": 25, "protein": 2.0, "carbs": 5.0, "fat": 0.1, "serving_size": "1 cup"},
        {"name": "Sweet Potato", "calories": 112, "protein": 2.0, "carbs": 26.0, "fat": 0.1, "serving_size": "1 medium"},
        {"name": "Asparagus", "calories": 27, "protein": 2.9, "carbs": 5.2, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Brussels Sprouts", "calories": 56, "protein": 4.0, "carbs": 11.0, "fat": 0.4, "serving_size": "1 cup"},
    ],
    "Grains": [
        {"name": "Brown Rice", "calories": 216, "protein": 5.0, "carbs": 45.0, "fat": 1.8, "serving_size": "1 cup"},
        {"name": "Quinoa", "calories": 222, "protein": 8.1, "carbs": 39.0, "fat": 3.6, "serving_size": "1 cup"},
        {"name": "Oats", "calories": 158, "protein": 6.0, "carbs": 27.0, "fat": 3.0, "serving_size": "1 cup"},
        {"name": "Whole Wheat Bread", "calories": 81, "protein": 4.0, "carbs": 13.8, "fat": 1.1, "serving_size": "1 slice"},
        {"name": "Barley", "calories": 193, "protein": 3.5, "carbs": 44.0, "fat": 0.7, "serving_size": "1 cup"},
        {"name": "Buckwheat", "calories": 155, "protein": 5.7, "carbs": 33.5, "fat": 1.0, "serving_size": "1 cup"},
        {"name": "Corn Tortilla", "calories": 58, "protein": 1.5, "carbs": 12.0, "fat": 0.7, "serving_size": "1 medium"},
        {"name": "Millet", "calories": 207, "protein": 6.1, "carbs": 41.0, "fat": 1.7, "serving_size": "1 cup"},
        {"name": "Bulgur", "calories": 151, "protein": 5.6, "carbs": 34.0, "fat": 0.4, "serving_size": "1 cup"},
        {"name": "Wild Rice", "calories": 166, "protein": 6.5, "carbs": 35.0, "fat": 0.6, "serving_size": "1 cup"},
    ],
    "Protein Sources": [
        {"name": "Tofu", "calories": 144, "protein": 17.0, "carbs": 3.0, "fat": 8.0, "serving_size": "1 cup"},
        {"name": "Tempeh", "calories": 193, "protein": 20.0, "carbs": 7.0, "fat": 11.0, "serving_size": "100g"},
        {"name": "Lentils", "calories": 230, "protein": 18.0, "carbs": 40.0, "fat": 0.8, "serving_size": "1 cup"},
        {"name": "Black Beans", "calories": 227, "protein": 15.0, "carbs": 41.0, "fat": 0.9, "serving_size": "1 cup"},
        {"name": "Chickpeas", "calories": 269, "protein": 14.5, "carbs": 45.0, "fat": 4.3, "serving_size": "1 cup"},
        {"name": "Edamame", "calories": 188, "protein": 18.5, "carbs": 13.8, "fat": 8.0, "serving_size": "1 cup"},
        {"name": "Seitan", "calories": 370, "protein": 75.0, "carbs": 14.0, "fat": 2.0, "serving_size": "100g"},
        {"name": "Pumpkin Seeds", "calories": 158, "protein": 8.5, "carbs": 5.0, "fat": 13.9, "serving_size": "1/4 cup"},
        {"name": "Peanut Butter", "calories": 188, "protein": 8.0, "carbs": 6.0, "fat": 16.0, "serving_size": "2 tbsp"},
        {"name": "Almonds", "calories": 162, "protein": 6.0, "carbs": 6.1, "fat": 14.0, "serving_size": "1/4 cup"},
    ],
    "Dairy and Alternatives": [
        {"name": "Greek Yogurt", "calories": 133, "protein": 23.0, "carbs": 9.0, "fat": 0.7, "serving_size": "1 cup"},
        {"name": "Cottage Cheese", "calories": 206, "protein": 28.0, "carbs": 6.0, "fat": 9.0, "serving_size": "1 cup"},
        {"name": "Cheddar Cheese", "calories": 113, "protein": 7.0, "carbs": 0.9, "fat": 9.0, "serving_size": "1 oz"},
        {"name": "Almond Milk", "calories": 39, "protein": 1.5, "carbs": 3.5, "fat": 2.8, "serving_size": "1 cup"},
        {"name": "Soy Milk", "calories": 131, "protein": 8.0, "carbs": 15.0, "fat": 4.5, "serving_size": "1 cup"},
        {"name": "Oat Milk", "calories": 120, "protein": 3.0, "carbs": 16.0, "fat": 5.0, "serving_size": "1 cup"},
        {"name": "Coconut Yogurt", "calories": 180, "protein": 2.0, "carbs": 9.0, "fat": 15.0, "serving_size": "1 cup"},
        {"name": "Feta Cheese", "calories": 75, "protein": 4.0, "carbs": 1.2, "fat": 6.0, "serving_size": "1 oz"},
        {"name": "Mozzarella", "calories": 85, "protein": 6.3, "carbs": 0.6, "fat": 6.3, "serving_size": "1 oz"},
        {"name": "Cashew Milk", "calories": 50, "protein": 1.0, "carbs": 2.0, "fat": 4.0, "serving_size": "1 cup"},
    ],
    "Meat and Fish": [
        {"name": "Salmon", "calories": 175, "protein": 19.0, "carbs": 0.0, "fat": 11.0, "serving_size": "3 oz"},
        {"name": "Chicken Breast", "calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6, "serving_size": "3 oz"},
        {"name": "Ground Turkey", "calories": 170, "protein": 22.0, "carbs": 0.0, "fat": 9.0, "serving_size": "3 oz"},
        {"name": "Tuna", "calories": 111, "protein": 25.0, "carbs": 0.0, "fat": 0.5, "serving_size": "3 oz"},
        {"name": "Lean Beef", "calories": 187, "protein": 23.0, "carbs": 0.0, "fat": 10.0, "serving_size": "3 oz"},
        {"name": "Pork Tenderloin", "calories": 143, "protein": 26.0, "carbs": 0.0, "fat": 4.0, "serving_size": "3 oz"},
        {"name": "Tilapia", "calories": 109, "protein": 22.0, "carbs": 0.0, "fat": 2.0, "serving_size": "3 oz"},
        {"name": "Cod", "calories": 90, "protein": 20.0, "carbs": 0.0, "fat": 0.8, "serving_size": "3 oz"},
        {"name": "Egg", "calories": 78, "protein": 6.3, "carbs": 0.6, "fat": 5.3, "serving_size": "1 large"},
        {"name": "Shrimp", "calories": 85, "protein": 18.0, "carbs": 0.0, "fat": 1.5, "serving_size": "3 oz"},
    ],
    "Oils and Fats": [
        {"name": "Olive Oil", "calories": 119, "protein": 0.0, "carbs": 0.0, "fat": 14.0, "serving_size": "1 tbsp"},
        {"name": "Avocado", "calories": 234, "protein": 2.9, "carbs": 12.5, "fat": 21.0, "serving_size": "1 medium"},
        {"name": "Coconut Oil", "calories": 117, "protein": 0.0, "carbs": 0.0, "fat": 13.6, "serving_size": "1 tbsp"},
        {"name": "Flaxseed", "calories": 150, "protein": 5.0, "carbs": 8.0, "fat": 12.0, "serving_size": "1 oz"},
        {"name": "Chia Seeds", "calories": 138, "protein": 4.7, "carbs": 12.0, "fat": 9.0, "serving_size": "1 oz"},
    ],
    "Snacks and Sweets": [
        {"name": "Dark Chocolate", "calories": 155, "protein": 2.2, "carbs": 13.0, "fat": 12.0, "serving_size": "1 oz"},
        {"name": "Granola Bar", "calories": 120, "protein": 3.0, "carbs": 18.0, "fat": 5.0, "serving_size": "1 bar"},
        {"name": "Trail Mix", "calories": 173, "protein": 5.0, "carbs": 12.0, "fat": 11.0, "serving_size": "1/4 cup"},
        {"name": "Rice Cakes", "calories": 35, "protein": 0.7, "carbs": 7.3, "fat": 0.3, "serving_size": "1 cake"},
        {"name": "Popcorn", "calories": 106, "protein": 3.0, "carbs": 22.0, "fat": 1.0, "serving_size": "3 cups"}
    ]
}

# Count total new foods
total_new_foods = sum(len(foods) for foods in new_foods.values())
print(f"Adding {total_new_foods} new foods to database")

# Counter for foods added
added_count = 0

# Add foods to database
for food_group, foods in new_foods.items():
    for food in foods:
        # Check if food already exists
        existing_food = db.query(CommonFood).filter(CommonFood.name == food["name"]).first()
        if existing_food:
            print(f"Skipping {food['name']} - already exists")
            continue
            
        # Add small random variations to make data more realistic
        calories_var = food["calories"] * (1 + random.uniform(-0.02, 0.02))
        protein_var = food["protein"] * (1 + random.uniform(-0.05, 0.05))
        carbs_var = food["carbs"] * (1 + random.uniform(-0.05, 0.05))
        fat_var = food["fat"] * (1 + random.uniform(-0.05, 0.05))
        
        # Create new food
        new_food = CommonFood(
            name=food["name"],
            calories=round(calories_var, 1),
            protein=round(protein_var, 1),
            carbs=round(carbs_var, 1),
            fat=round(fat_var, 1),
            serving_size=food["serving_size"],
            food_group=food_group,
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_food)
        added_count += 1
        print(f"Added {food['name']} ({food_group})")

# Commit changes
db.commit()

# Verify new count
final_count = db.query(CommonFood).count()
print(f"\nFood database summary:")
print(f"Initial count: {existing_count}")
print(f"Foods added: {added_count}")
print(f"Final count: {final_count}")
print(f"Increase: {final_count - existing_count}")

# Print a summary of food groups
food_group_counts = {}
food_groups = db.query(CommonFood.food_group).distinct().all()
for group in food_groups:
    group_name = group[0] or "Uncategorized"
    count = db.query(CommonFood).filter(CommonFood.food_group == group[0]).count()
    food_group_counts[group_name] = count

print("\nFood by group:")
for group, count in food_group_counts.items():
    print(f"- {group}: {count} items")

print("\nDone! You now have a more diverse food database for meal planning.") 