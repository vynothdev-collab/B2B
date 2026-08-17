import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

_fernets: dict[str, Fernet] = {}


def _get_fernet(key: str) -> Fernet:
    if key not in _fernets:
        if not key:
            raise RuntimeError("An encryption key must be set to store or read integration tokens")
        # Derive a valid 32-byte Fernet key from whatever string the operator provides
        # (Fernet requires urlsafe-base64(32 bytes) specifically, not an arbitrary secret).
        digest = hashlib.sha256(key.encode()).digest()
        _fernets[key] = Fernet(base64.urlsafe_b64encode(digest))
    return _fernets[key]


def encrypt_secret(value: str, key: str) -> str:
    return _get_fernet(key).encrypt(value.encode()).decode()


def decrypt_secret(value: str, key: str) -> str:
    try:
        return _get_fernet(key).decrypt(value.encode()).decode()
    except InvalidToken as e:
        raise RuntimeError("Failed to decrypt stored token — wrong or rotated encryption key") from e
