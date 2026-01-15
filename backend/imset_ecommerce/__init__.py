"""
IMSET E-commerce Django project initialization
Applies djongo compatibility patches for pymongo 4.x
"""

# Apply djongo compatibility patches before Django setup
try:
    from .djongo_patch import apply_djongo_patch
    apply_djongo_patch()
except ImportError:
    pass  # Patch not available or djongo not installed
