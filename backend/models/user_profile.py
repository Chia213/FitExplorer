from sqlalchemy import Column, String, Integer, Boolean, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Theme preferences
    theme = Column(String, default="light")  # light or dark
    premium_theme = Column(String, default="default")
    unlocked_themes = Column(JSON, default=["default"])
    
    # Card appearance
    use_custom_card_color = Column(Boolean, default=False)
    card_color = Column(String, default="#3b82f6")  # Default blue
    
    # Emoji preferences
    show_profile_emoji = Column(Boolean, default=True)
    profile_emoji = Column(String, default="🏋️‍♂️")
    emoji_animation = Column(String, default="lift")  # lift, bounce, spin, pulse, wave
    
    # Animation preferences
    enable_animations = Column(Boolean, default=False)
    animation_style = Column(String, default="subtle")  # subtle, bounce, pulse, wave, glide
    animation_speed = Column(String, default="medium")  # slow, medium, fast
    
    # Notification settings
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=False)
    
    # Language preference
    language = Column(String, default="en")
    
    # Relationships
    user = relationship("User", back_populates="profile")
    
    def to_dict(self):
        return {
            "id": self.id,
            "theme": self.theme,
            "premium_theme": self.premium_theme,
            "unlocked_themes": self.unlocked_themes,
            "use_custom_card_color": self.use_custom_card_color,
            "card_color": self.card_color,
            "show_profile_emoji": self.show_profile_emoji,
            "profile_emoji": self.profile_emoji,
            "emoji_animation": self.emoji_animation,
            "enable_animations": self.enable_animations,
            "animation_style": self.animation_style,
            "animation_speed": self.animation_speed,
            "email_notifications": self.email_notifications,
            "push_notifications": self.push_notifications,
            "language": self.language
        } 