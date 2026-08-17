import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        if not settings.SALESFORCE_ENCRYPTION_KEY:
            raise RuntimeError(
                "SALESFORCE_ENCRYPTION_KEY must be set to store or read Salesforce tokens"
            )
        # Derive a valid 32-byte Fernet key from whatever string the operator provides
        # (Fernet requires urlsafe-base64(32 bytes) specifically, not an arbitrary secret).
        digest = hashlib.sha256(settings.SALESFORCE_ENCRYPTION_KEY.encode()).digest()
        _fernet = Fernet(base64.urlsafe_b64encode(digest))
    return _fernet


def encrypt_secret(value: str) -> str:
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt_secret(value: str) -> str:
    try:
        return _get_fernet().decrypt(value.encode()).decode()
    except InvalidToken as e:
        raise RuntimeError("Failed to decrypt stored Salesforce token — wrong or rotated encryption key") from e
