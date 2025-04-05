from database import SessionLocal
from models import CommonFood
from datetime import datetime, timezone
import random  # for generating slight variations in nutritional values

# Create database session
db = SessionLocal()

# Check existing foods count
existing_count = db.query(CommonFood).count()
print(f"Current food count: {existing_count}")

# Foods organized by cuisine/category
cuisine_foods = {
    "Asian Cuisine": [
        {"name": "Miso Soup", "calories": 74, "protein": 4.0, "carbs": 7.8, "fat": 2.6, "serving_size": "1 cup"},
        {"name": "Pad Thai", "calories": 375, "protein": 11.0, "carbs": 32.0, "fat": 22.0, "serving_size": "1 cup"},
        {"name": "Spring Roll", "calories": 110, "protein": 3.0, "carbs": 12.0, "fat": 5.0, "serving_size": "1 roll"},
        {"name": "Sushi Roll", "calories": 255, "protein": 6.0, "carbs": 42.0, "fat": 6.0, "serving_size": "6 pieces"},
        {"name": "Kimchi", "calories": 23, "protein": 1.0, "carbs": 4.0, "fat": 0.2, "serving_size": "1/2 cup"},
        {"name": "Udon Noodles", "calories": 210, "protein": 8.0, "carbs": 40.0, "fat": 1.0, "serving_size": "1 cup"},
        {"name": "Mochi", "calories": 96, "protein": 1.0, "carbs": 22.0, "fat": 0.5, "serving_size": "1 piece"},
        {"name": "Sticky Rice", "calories": 169, "protein": 3.5, "carbs": 37.0, "fat": 0.3, "serving_size": "1/2 cup"},
        {"name": "Edamame Beans", "calories": 121, "protein": 12.0, "carbs": 9.9, "fat": 5.0, "serving_size": "1/2 cup"},
        {"name": "Nori Seaweed", "calories": 10, "protein": 1.0, "carbs": 1.0, "fat": 0.0, "serving_size": "1 sheet"},
    ],
    "Mediterranean": [
        {"name": "Greek Salad", "calories": 230, "protein": 7.0, "carbs": 10.0, "fat": 18.0, "serving_size": "1 cup"},
        {"name": "Dolma", "calories": 120, "protein": 3.0, "carbs": 18.0, "fat": 4.5, "serving_size": "4 pieces"},
        {"name": "Pita Bread", "calories": 165, "protein": 5.5, "carbs": 33.0, "fat": 0.7, "serving_size": "1 piece"},
        {"name": "Tzatziki", "calories": 30, "protein": 1.0, "carbs": 2.0, "fat": 2.0, "serving_size": "2 tbsp"},
        {"name": "Couscous", "calories": 176, "protein": 6.0, "carbs": 37.0, "fat": 0.3, "serving_size": "1 cup"},
        {"name": "Baba Ganoush", "calories": 100, "protein": 2.5, "carbs": 6.0, "fat": 7.0, "serving_size": "1/4 cup"},
        {"name": "Tahini", "calories": 89, "protein": 2.5, "carbs": 3.0, "fat": 8.0, "serving_size": "1 tbsp"},
        {"name": "Tabouli", "calories": 120, "protein": 3.0, "carbs": 23.0, "fat": 2.0, "serving_size": "1/2 cup"},
        {"name": "Kalamata Olives", "calories": 45, "protein": 0.5, "carbs": 2.5, "fat": 4.0, "serving_size": "10 olives"},
    ],
    "Latin American": [
        {"name": "Black Bean Burrito", "calories": 350, "protein": 15.0, "carbs": 55.0, "fat": 8.0, "serving_size": "1 burrito"},
        {"name": "Guacamole", "calories": 120, "protein": 1.5, "carbs": 6.0, "fat": 10.0, "serving_size": "1/4 cup"},
        {"name": "Plantains", "calories": 181, "protein": 1.9, "carbs": 47.5, "fat": 0.6, "serving_size": "1 cup"},
        {"name": "Pupusa", "calories": 300, "protein": 8.0, "carbs": 40.0, "fat": 12.0, "serving_size": "1 pupusa"},
        {"name": "Jicama", "calories": 45, "protein": 1.0, "carbs": 10.0, "fat": 0.1, "serving_size": "1 cup"},
        {"name": "Salsa Verde", "calories": 15, "protein": 0.5, "carbs": 3.5, "fat": 0.0, "serving_size": "2 tbsp"},
        {"name": "Mole Sauce", "calories": 130, "protein": 3.0, "carbs": 12.0, "fat": 8.0, "serving_size": "1/4 cup"},
        {"name": "Elote", "calories": 160, "protein": 4.0, "carbs": 14.0, "fat": 10.0, "serving_size": "1 ear"},
    ],
    "Indian Cuisine": [
        {"name": "Chana Masala", "calories": 300, "protein": 12.0, "carbs": 35.0, "fat": 12.0, "serving_size": "1 cup"},
        {"name": "Naan Bread", "calories": 260, "protein": 9.0, "carbs": 48.0, "fat": 3.5, "serving_size": "1 piece"},
        {"name": "Samosa", "calories": 260, "protein": 5.0, "carbs": 24.0, "fat": 15.0, "serving_size": "1 piece"},
        {"name": "Palak Paneer", "calories": 280, "protein": 11.0, "carbs": 8.0, "fat": 22.0, "serving_size": "1 cup"},
        {"name": "Raita", "calories": 45, "protein": 3.0, "carbs": 4.0, "fat": 1.5, "serving_size": "1/4 cup"},
        {"name": "Basmati Rice", "calories": 210, "protein": 4.0, "carbs": 45.0, "fat": 0.5, "serving_size": "1 cup"},
        {"name": "Dosa", "calories": 120, "protein": 3.0, "carbs": 20.0, "fat": 2.5, "serving_size": "1 small"},
        {"name": "Papadum", "calories": 30, "protein": 1.0, "carbs": 5.0, "fat": 1.0, "serving_size": "1 piece"},
        {"name": "Dal", "calories": 140, "protein": 9.0, "carbs": 20.0, "fat": 3.5, "serving_size": "1/2 cup"},
    ],
    "Breakfast Foods": [
        {"name": "Acai Bowl", "calories": 350, "protein": 6.0, "carbs": 60.0, "fat": 10.0, "serving_size": "1 bowl"},
        {"name": "Breakfast Burrito", "calories": 400, "protein": 15.0, "carbs": 40.0, "fat": 18.0, "serving_size": "1 burrito"},
        {"name": "Chia Pudding", "calories": 180, "protein": 6.0, "carbs": 16.0, "fat": 12.0, "serving_size": "1/2 cup"},
        {"name": "Protein Pancakes", "calories": 250, "protein": 15.0, "carbs": 30.0, "fat": 7.0, "serving_size": "3 pancakes"},
        {"name": "Breakfast Smoothie", "calories": 200, "protein": 10.0, "carbs": 35.0, "fat": 2.0, "serving_size": "12 oz"},
        {"name": "French Toast", "calories": 260, "protein": 9.0, "carbs": 30.0, "fat": 12.0, "serving_size": "2 slices"},
        {"name": "Eggs Florentine", "calories": 280, "protein": 16.0, "carbs": 15.0, "fat": 17.0, "serving_size": "1 serving"},
        {"name": "Frittata", "calories": 350, "protein": 20.0, "carbs": 5.0, "fat": 25.0, "serving_size": "1 slice"},
    ],
    "Protein-Rich": [
        {"name": "Turkey Breast", "calories": 125, "protein": 26.0, "carbs": 0.0, "fat": 1.0, "serving_size": "3 oz"},
        {"name": "Venison", "calories": 134, "protein": 26.0, "carbs": 0.0, "fat": 2.7, "serving_size": "3 oz"},
        {"name": "Bison", "calories": 122, "protein": 24.0, "carbs": 0.0, "fat": 2.0, "serving_size": "3 oz"},
        {"name": "Mussels", "calories": 148, "protein": 20.0, "carbs": 6.0, "fat": 4.0, "serving_size": "3 oz"},
        {"name": "Sardines", "calories": 177, "protein": 21.0, "carbs": 0.0, "fat": 10.0, "serving_size": "3 oz"},
        {"name": "Duck Breast", "calories": 250, "protein": 19.0, "carbs": 0.0, "fat": 19.0, "serving_size": "3 oz"},
        {"name": "Scallops", "calories": 100, "protein": 20.0, "carbs": 3.0, "fat": 0.8, "serving_size": "3 oz"},
        {"name": "Spirulina", "calories": 20, "protein": 4.0, "carbs": 1.7, "fat": 0.5, "serving_size": "1 tbsp"},
    ],
    "Healthy Fats": [
        {"name": "Macadamia Nuts", "calories": 204, "protein": 2.2, "carbs": 3.9, "fat": 21.5, "serving_size": "1 oz"},
        {"name": "Brazil Nuts", "calories": 186, "protein": 4.1, "carbs": 3.3, "fat": 19.0, "serving_size": "1 oz"},
        {"name": "Pecans", "calories": 196, "protein": 2.6, "carbs": 3.9, "fat": 20.4, "serving_size": "1 oz"},
        {"name": "Hazelnuts", "calories": 178, "protein": 4.2, "carbs": 4.7, "fat": 17.2, "serving_size": "1 oz"},
        {"name": "Cashews", "calories": 163, "protein": 5.2, "carbs": 9.3, "fat": 13.1, "serving_size": "1 oz"},
        {"name": "Pine Nuts", "calories": 191, "protein": 3.9, "carbs": 3.7, "fat": 19.1, "serving_size": "1 oz"},
        {"name": "Hemp Seeds", "calories": 110, "protein": 6.3, "carbs": 1.7, "fat": 10.0, "serving_size": "1 tbsp"},
        {"name": "Coconut Meat", "calories": 100, "protein": 1.0, "carbs": 4.0, "fat": 9.0, "serving_size": "1 oz"},
    ],
    "Fermented Foods": [
        {"name": "Sauerkraut", "calories": 27, "protein": 1.3, "carbs": 6.0, "fat": 0.2, "serving_size": "1/2 cup"},
        {"name": "Kombucha", "calories": 30, "protein": 0.0, "carbs": 8.0, "fat": 0.0, "serving_size": "8 oz"},
        {"name": "Kefir", "calories": 110, "protein": 11.0, "carbs": 12.0, "fat": 2.0, "serving_size": "1 cup"},
        {"name": "Miso Paste", "calories": 35, "protein": 2.0, "carbs": 4.0, "fat": 1.0, "serving_size": "1 tbsp"},
        {"name": "Tempeh", "calories": 160, "protein": 17.0, "carbs": 7.0, "fat": 9.0, "serving_size": "3 oz"},
        {"name": "Natto", "calories": 186, "protein": 15.0, "carbs": 9.0, "fat": 10.0, "serving_size": "1/2 cup"},
    ],
    "Super Greens": [
        {"name": "Microgreens", "calories": 25, "protein": 2.0, "carbs": 4.0, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Watercress", "calories": 4, "protein": 0.8, "carbs": 0.4, "fat": 0.0, "serving_size": "1 cup"},
        {"name": "Arugula", "calories": 5, "protein": 0.5, "carbs": 0.7, "fat": 0.1, "serving_size": "1 cup"},
        {"name": "Dandelion Greens", "calories": 25, "protein": 1.5, "carbs": 5.0, "fat": 0.4, "serving_size": "1 cup"},
        {"name": "Mustard Greens", "calories": 15, "protein": 1.5, "carbs": 2.3, "fat": 0.2, "serving_size": "1 cup"},
        {"name": "Wheatgrass", "calories": 15, "protein": 1.0, "carbs": 2.0, "fat": 0.0, "serving_size": "1 oz"},
    ],
    "Superfoods": [
        {"name": "Acai Berries", "calories": 70, "protein": 1.0, "carbs": 4.0, "fat": 5.0, "serving_size": "100g"},
        {"name": "Goji Berries", "calories": 98, "protein": 3.8, "carbs": 21.6, "fat": 0.1, "serving_size": "1 oz"},
        {"name": "Cacao Nibs", "calories": 200, "protein": 4.0, "carbs": 10.0, "fat": 15.0, "serving_size": "1 oz"},
        {"name": "Matcha Powder", "calories": 10, "protein": 1.0, "carbs": 1.0, "fat": 0.0, "serving_size": "1 tsp"},
        {"name": "Bee Pollen", "calories": 40, "protein": 2.0, "carbs": 7.0, "fat": 1.0, "serving_size": "1 tbsp"},
        {"name": "Turmeric Root", "calories": 24, "protein": 0.5, "carbs": 4.4, "fat": 0.2, "serving_size": "1 tbsp"},
        {"name": "Maca Powder", "calories": 45, "protein": 1.7, "carbs": 8.0, "fat": 0.6, "serving_size": "1 tbsp"},
        {"name": "Moringa Powder", "calories": 25, "protein": 3.0, "carbs": 3.0, "fat": 0.0, "serving_size": "1 tbsp"},
    ],
}

# Count total new foods
total_new_foods = sum(len(foods) for foods in cuisine_foods.values())
print(f"Adding {total_new_foods} new diverse foods to database")

# Counter for foods added
added_count = 0

# Add foods to database
for food_group, foods in cuisine_foods.items():
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
print(f"New foods added: {added_count}")
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

print("\nDone! Your food database now has diverse options from many cuisines and specialty categories.") 