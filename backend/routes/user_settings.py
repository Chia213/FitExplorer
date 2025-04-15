from fastapi import Request, Body, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from bson.objectid import ObjectId
from pymongo import MongoClient
from fastapi import APIRouter
import jwt
from datetime import datetime, timedelta

# Create router
router = APIRouter()

# Authentication helper functions
def get_user_id_from_request(request: Request) -> ObjectId:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    token = auth_header.split(" ")[1]
    try:
        # Use your JWT secret key here
        payload = jwt.decode(token, "your_jwt_secret_key", algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return ObjectId(user_id)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_user_by_id(user_id: ObjectId):
    return await users_collection.find_one({"_id": user_id})

# Assuming you have a MongoDB client
client = MongoClient()
db = client.get_database()
users_collection = db.users

@router.patch("/preferences")
async def update_preferences(
    request: Request,
    use_custom_card_color: bool = Body(...),
    card_color: str = Body(...),
    clear_premium_theme: bool = Body(False)
):
    user_id = get_user_id_from_request(request)
    user = await get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update the user's preferences
    update_data = {
        "preferences.use_custom_card_color": use_custom_card_color,
        "preferences.card_color": card_color,
    }
    
    # If clear_premium_theme is True, reset the premium theme to default
    if clear_premium_theme:
        update_data["preferences.premium_theme"] = "default"
    
    await users_collection.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    return {"message": "Preferences updated successfully"} 