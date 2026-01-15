"""
Encryption utilities for digital keys
"""
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import hashlib


def get_encryption_key():
    """Get or generate encryption key from settings"""
    key = settings.ENCRYPTION_KEY
    if not key:
        raise ValueError('ENCRYPTION_KEY not set in settings')
    
    # Convert hex string to bytes and create Fernet key
    key_bytes = bytes.fromhex(key)
    # Fernet requires 32 bytes, so we hash if needed
    if len(key_bytes) != 32:
        key_bytes = hashlib.sha256(key_bytes).digest()
    
    return base64.urlsafe_b64encode(key_bytes)


def encrypt_key(plain_key):
    """Encrypt a digital key"""
    f = Fernet(get_encryption_key())
    encrypted = f.encrypt(plain_key.encode())
    return encrypted.decode()


def decrypt_key(encrypted_key):
    """Decrypt a digital key"""
    f = Fernet(get_encryption_key())
    decrypted = f.decrypt(encrypted_key.encode())
    return decrypted.decode()


