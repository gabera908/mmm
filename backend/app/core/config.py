from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "npos_accounting"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: str = "sqlite:///./test.db"

    JWT_SECRET_KEY: str = "change_me_jwt_secret_key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    SECRET_KEY: str = "change_me_secret_key"
    APP_NAME: str = "نظام المحاسبة المركزي"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    CORS_ORIGINS: list[str] = ["http://localhost", "http://localhost:3000", "http://localhost:80"]

    BACKUP_SCHEDULE: str = "0 2 * * *"
    BACKUP_RETENTION_DAYS: int = 30


settings = Settings()
