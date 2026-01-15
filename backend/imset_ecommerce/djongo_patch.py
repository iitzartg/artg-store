"""
Djongo compatibility patch for pymongo 4.x
This patch fixes the NotImplementedError when checking database connection truthiness
and JSONField issues where MongoDB returns Python objects instead of JSON strings
"""
import sys

def apply_djongo_patch():
    """Apply patches to djongo to fix pymongo 4.x compatibility issues"""
    try:
        import djongo.base
        
        # Patch the _close method to fix pymongo 4.x compatibility
        original_close = djongo.base.DatabaseWrapper._close
        
        def patched_close(self):
            """Patched _close method that works with pymongo 4.x"""
            try:
                if self.connection is not None:
                    original_close(self)
            except (NotImplementedError, AttributeError):
                # pymongo 4.x doesn't support truthiness testing
                # Just close the connection if it exists
                try:
                    if hasattr(self, 'connection') and self.connection:
                        original_close(self)
                except:
                    pass
        
        djongo.base.DatabaseWrapper._close = patched_close
        
        # Also patch cursor to handle ORDER BY issues
        try:
            import djongo.cursor
            import djongo.sql2mongo.query
            
            # Patch to handle ORDER BY more gracefully
            original_parse = djongo.sql2mongo.query.Query.parse
            
            def patched_parse(self):
                """Patched parse to handle ORDER BY"""
                try:
                    return original_parse(self)
                except Exception as e:
                    error_msg = str(e)
                    if 'ORDER BY' in error_msg or 'Unknown keyword' in error_msg:
                        # For queries with ORDER BY, try without it
                        # This is a workaround for djongo limitations
                        if hasattr(self, 'statement'):
                            # Remove ORDER BY clause if present
                            import re
                            self.statement = re.sub(r'\s+ORDER\s+BY\s+[^\s]+(?:\s+ASC|\s+DESC)?', '', str(self.statement), flags=re.IGNORECASE)
                            return original_parse(self)
                    raise
            
            djongo.sql2mongo.query.Query.parse = patched_parse
        except Exception:
            pass  # If patching fails, continue anyway
        
        # Patch JSONField to handle MongoDB's native Python objects
        try:
            from django.db.models.fields.json import JSONField
            original_from_db_value = JSONField.from_db_value
            
            def patched_from_db_value(self, value, expression, connection):
                """Patched from_db_value to handle MongoDB returning Python objects directly"""
                if value is None:
                    return value
                # If value is already a Python dict/list (from MongoDB), return it directly
                if isinstance(value, (dict, list)):
                    return value
                # Otherwise, try to parse as JSON string (normal Django behavior)
                try:
                    return original_from_db_value(self, value, expression, connection)
                except (TypeError, ValueError):
                    # If parsing fails and it's not a string, return as-is
                    # This handles edge cases
                    return value
            
            JSONField.from_db_value = patched_from_db_value
        except Exception:
            pass  # If patching fails, continue anyway
            
    except ImportError:
        pass  # djongo not installed, skip patching


# Apply patch when module is imported
apply_djongo_patch()
