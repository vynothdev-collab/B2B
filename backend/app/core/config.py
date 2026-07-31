from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    APP_NAME: str = ""
    APP_VERSION: str = ""
    DEBUG: bool = False
    ENVIRONMENT: str = ""

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CORS_ORIGINS: list[str] = [""]

    DATABASE_URL: str = ""

    SECRET_KEY: str = ""
    ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Admin JWT — separate secret so admin tokens can't be used as user tokens
    ADMIN_SECRET_KEY: str = ""
    ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ADMIN_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Static API key required in X-Admin-Api-Key header to create admin accounts
    ADMIN_CREATE_API_KEY: str = ""

    REDIS_URL: str = ""

    CORESIGNAL_API_KEY: str = ""
    CORESIGNAL_BASE_URL: str = ""
    CORESIGNAL_PAGE_SIZE: int = 10

    PDL_API_KEY: str = ""
    PDL_BASE_URL: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # LinkedIn OAuth
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    LINKEDIN_CALLBACK_URL: str = ""  # e.g. http://localhost:8000/api/v1/auth/linkedin/callback
    FRONTEND_URL: str = ""           # e.g. http://localhost:3000


settings = Settings()
