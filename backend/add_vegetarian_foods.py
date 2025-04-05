from database import SessionLocal
from models import CommonFood
from datetime import datetime, timezone
import random  # for generating slight variations in nutritional values

# Create database session
db = SessionLocal()

# Check existing foods count
existing_count = db.query(CommonFood).count()
print(f"Current food count: {existing_count}")

# Foods organized by food groups - all vegetarian-friendly
vegetarian_foods = {
    "Protein Sources": [
        {"name": "Kidney Beans", "calories": 225, "protein": 15.3, "carbs": 40.4, "fat": 0.9, "serving_size": "1 cup"},
        {"name": "Pinto Beans", "calories": 245, "protein": 15.4, "carbs": 44.8, "fat": 1.1, "serving_size": "1 cup"},
        {"name": "Seitan Strips", "calories": 120, "protein": 21.0, "carbs": 4.0, "fat": 2.0, "serving_size": "3 oz"},
        {"name": "TVP (Textured Vegetable Protein)", "calories": 160, "protein": 24.0, "carbs": 10.0, "fat": 1.0, "serving_size": "1/4 cup"},
        {"name": "Nutritional Yeast", "calories": 60, "protein": 8.0, "carbs": 5.0, "fat": 1.5, "serving_size": "2 tbsp"},
        {"name": "Sunflower Seeds", "calories": 165, "protein": 5.5, "carbs": 6.5, "fat": 14.0, "serving_size": "1/4 cup"},
        {"name": "Hempseed", "calories": 170, "protein": 10.0, "carbs": 3.0, "fat": 13.0, "serving_size": "3 tbsp"},
        {"name": "Walnuts", "calories": 185, "protein": 4.3, "carbs": 3.9, "fat": 18.5, "serving_size": "1/4 cup"},
        {"name": "Green Peas", "calories": 125, "protein": 8.2, "carbs": 21.0, "fat": 0.4, "serving_size": "1 cup"},
        {"name": "Sprouted Tofu", "calories": 155, "protein": 14.0, "carbs": 4.0, "fat": 9.0, "serving_size": "100g"},
        {"name": "Beyond Burger", "calories": 270, "protein": 20.0, "carbs": 5.0, "fat": 20.0, "serving_size": "1 patty"},
        {"name": "Impossible Burger", "calories": 240, "protein": 19.0, "carbs": 9.0, "fat": 14.0, "serving_size": "1 patty"},
    ],
    "Dairy and Alternatives": [
        {"name": "Coconut Kefir", "calories": 45, "protein": 2.0, "carbs": 8.0, "fat": 1.5, "serving_size": "1 cup"},
        {"name": "Cashew Yogurt", "calories": 150, "protein": 4.0, "carbs": 10.0, "fat": 12.0, "serving_size": "1 cup"},
        {"name": "Vegan Cream Cheese", "calories": 90, "protein": 2.0, "carbs": 3.0, "fat": 8.0, "serving_size": "2 tbsp"},
        {"name": "Plant-Based Mozzarella", "calories": 70, "protein": 6.0, "carbs": 2.0, "fat": 4.0, "serving_size": "1 oz"},
        {"name": "Hemp Milk", "calories": 60, "protein": 3.0, "carbs": 0.5, "fat": 5.0, "serving_size": "1 cup"},
        {"name": "Macadamia Milk", "calories": 50, "protein": 1.0, "carbs": 1.0, "fat": 4.5, "serving_size": "1 cup"},
        {"name": "Pea Milk", "calories": 70, "protein": 8.0, "carbs": 0.0, "fat": 4.5, "serving_size": "1 cup"},
    ],
    "Grains": [
        {"name": "Farro", "calories": 170, "protein": 7.0, "carbs": 34.0, "fat": 1.5, "serving_size": "1/4 cup dry"},
        {"name": "Amaranth", "calories": 180, "protein": 7.0, "carbs": 33.0, "fat": 3.0, "serving_size": "1/4 cup dry"},
        {"name": "Spelt", "calories": 150, "protein": 6.5, "carbs": 30.0, "fat": 1.0, "serving_size": "1/4 cup dry"},
        {"name": "Teff", "calories": 180, "protein": 7.0, "carbs": 35.0, "fat": 1.5, "serving_size": "1/4 cup dry"},
        {"name": "Kamut", "calories": 170, "protein": 7.0, "carbs": 35.0, "fat": 1.0, "serving_size": "1/4 cup dry"},
        {"name": "Ezekiel Bread", "calories": 80, "protein": 4.0, "carbs": 15.0, "fat": 0.5, "serving_size": "1 slice"},
        {"name": "Freekeh", "calories": 170, "protein": 6.0, "carbs": 34.0, "fat": 1.0, "serving_size": "1/4 cup dry"},
    ],
    "Vegetables": [
        {"name": "Collard Greens", "calories": 25, "protein": 2.0, "carbs": 4.0, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Bok Choy", "calories": 10, "protein": 1.3, "carbs": 1.5, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Swiss Chard", "calories": 35, "protein": 3.3, "carbs": 7.0, "fat": 0.1, "serving_size": "1 cup"},
        {"name": "Artichoke Hearts", "calories": 85, "protein": 4.2, "carbs": 14.3, "fat": 0.5, "serving_size": "1 cup"},
        {"name": "Fennel", "calories": 27, "protein": 1.1, "carbs": 6.3, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Radicchio", "calories": 9, "protein": 0.6, "carbs": 1.8, "fat": 0.1, "serving_size": "1 cup"},
        {"name": "Kohlrabi", "calories": 36, "protein": 2.3, "carbs": 8.4, "fat": 0.1, "serving_size": "1 cup"},
        {"name": "Daikon Radish", "calories": 21, "protein": 0.8, "carbs": 4.7, "fat": 0.1, "serving_size": "1 cup"},
        {"name": "Spaghetti Squash", "calories": 42, "protein": 1.0, "carbs": 10.0, "fat": 0.4, "serving_size": "1 cup"},
        {"name": "Eggplant", "calories": 35, "protein": 0.8, "carbs": 8.6, "fat": 0.2, "serving_size": "1 cup"},
    ],
    "Ready-made Vegetarian": [
        {"name": "Veggie Burger", "calories": 124, "protein": 11.0, "carbs": 18.0, "fat": 3.0, "serving_size": "1 patty"},
        {"name": "Falafel", "calories": 330, "protein": 13.0, "carbs": 32.0, "fat": 18.0, "serving_size": "4 pieces"},
        {"name": "Vegetable Stir Fry Mix", "calories": 62, "protein": 2.0, "carbs": 12.0, "fat": 0.5, "serving_size": "1 cup"},
        {"name": "Tofu Scramble", "calories": 120, "protein": 14.0, "carbs": 4.0, "fat": 6.0, "serving_size": "1/2 cup"},
        {"name": "Hummus", "calories": 166, "protein": 7.9, "carbs": 14.3, "fat": 9.6, "serving_size": "1/2 cup"},
        {"name": "Vegetarian Chili", "calories": 280, "protein": 15.0, "carbs": 42.0, "fat": 7.0, "serving_size": "1 cup"},
        {"name": "Tabouleh", "calories": 120, "protein": 3.0, "carbs": 23.0, "fat": 2.0, "serving_size": "1/2 cup"},
        {"name": "Ratatouille", "calories": 160, "protein": 2.5, "carbs": 14.0, "fat": 11.0, "serving_size": "1 cup"},
        {"name": "Quinoa Salad", "calories": 222, "protein": 7.0, "carbs": 39.0, "fat": 4.0, "serving_size": "1 cup"},
        {"name": "Lentil Soup", "calories": 230, "protein": 16.0, "carbs": 37.0, "fat": 2.0, "serving_size": "1 cup"},
    ],
    "Meat Alternatives": [
        {"name": "Tempeh Bacon", "calories": 140, "protein": 13.0, "carbs": 5.0, "fat": 8.0, "serving_size": "3 strips"},
        {"name": "Tofu Sausage", "calories": 120, "protein": 13.0, "carbs": 6.0, "fat": 5.0, "serving_size": "1 link"},
        {"name": "Seitan Chicken", "calories": 100, "protein": 18.0, "carbs": 4.0, "fat": 1.5, "serving_size": "3 oz"},
        {"name": "Jackfruit Pulled Pork", "calories": 160, "protein": 3.0, "carbs": 30.0, "fat": 3.0, "serving_size": "1 cup"},
        {"name": "Plant-Based Ground Beef", "calories": 240, "protein": 19.0, "carbs": 9.0, "fat": 14.0, "serving_size": "4 oz"},
        {"name": "Vegan Deli Slices", "calories": 90, "protein": 13.0, "carbs": 6.0, "fat": 1.5, "serving_size": "4 slices"},
        {"name": "Vegan Fish Fillets", "calories": 180, "protein": 10.0, "carbs": 19.0, "fat": 7.0, "serving_size": "1 fillet"},
        {"name": "Plant-Based Meatballs", "calories": 220, "protein": 14.0, "carbs": 10.0, "fat": 14.0, "serving_size": "4 pieces"},
    ],
}

# Count total new vegetarian foods
total_new_foods = sum(len(foods) for foods in vegetarian_foods.values())
print(f"Adding {total_new_foods} new vegetarian foods to database")

# Counter for foods added
added_count = 0

# Add foods to database
for food_group, foods in vegetarian_foods.items():
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
print(f"Vegetarian foods added: {added_count}")
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

print("\nDone! You now have many more vegetarian food options for meal planning.") 