# Frontend Troubleshooting Guide

## npm install Issues

### Issue: "npm install not working"

**Common Causes:**
1. Running from wrong directory - Must be in `frontend/` folder
2. Network/firewall blocking npm registry
3. Corrupted npm cache
4. Permission issues

**Solutions:**

1. **Make sure you're in the frontend directory:**
   ```powershell
   cd "D:\IMSET e-commerce website project\frontend"
   npm install
   ```

2. **Clear npm cache and retry:**
   ```powershell
   npm cache clean --force
   npm install
   ```

3. **Use different registry (if network issues):**
   ```powershell
   npm install --registry https://registry.npmjs.org/
   ```

4. **Run as Administrator (if permission issues):**
   - Right-click PowerShell/Terminal
   - Select "Run as Administrator"
   - Navigate to frontend folder
   - Run `npm install`

5. **Delete node_modules and package-lock.json, then reinstall:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   ```

## Security Vulnerabilities

If you see security warnings:
```powershell
npm audit
npm audit fix
```

## Common Errors

### "ENOENT: no such file or directory"
- **Solution**: Make sure you're in the `frontend/` directory

### "EACCES: permission denied"
- **Solution**: Run terminal as Administrator

### Network timeout errors
- **Solution**: Check internet connection, try different registry, or use VPN

### "Cannot find module"
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again


