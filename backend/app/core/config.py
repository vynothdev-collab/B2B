from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    @model_validator(mode="after")
    def _require_secrets(self) -> "Settings":
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be set in environment")
        if not self.ADMIN_SECRET_KEY:
            raise ValueError("ADMIN_SECRET_KEY must be set in environment")
        return self

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

    # Microsoft OAuth
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""
    MICROSOFT_TENANT_ID: str = "common"  # "common" = personal + work/school accounts
    MICROSOFT_CALLBACK_URL: str = ""     # e.g. http://localhost:8000/api/v1/auth/microsoft/callback

    # Salesforce OAuth (production orgs only — login.salesforce.com)
    SALESFORCE_CLIENT_ID: str = ""
    SALESFORCE_CLIENT_SECRET: str = ""
    SALESFORCE_CALLBACK_URL: str = ""  # e.g. http://localhost:8000/api/v1/integrations/salesforce/callback
    SALESFORCE_API_VERSION: str = "v59.0"  # bump when Salesforce deprecates this REST API version
    SALESFORCE_ENCRYPTION_KEY: str = ""  # used to encrypt stored Salesforce access/refresh tokens at rest

    # HubSpot OAuth
    HUBSPOT_CLIENT_ID: str = ""
    HUBSPOT_CLIENT_SECRET: str = ""
    HUBSPOT_CALLBACK_URL: str = ""  # e.g. http://localhost:8000/api/v1/integrations/hubspot/callback
    HUBSPOT_ENCRYPTION_KEY: str = ""  # used to encrypt stored HubSpot access/refresh tokens at rest


settings = Settings()
