# Update Instructions: Node.js and Angular

## ⚠️ IMPORTANT: Update Node.js First!

Angular 21 requires Node.js v20.19.0+ or v22.12.0+. Your current version (v18.18.0) is not compatible.

## Current Status
- ✅ Angular CLI: Updated to 21.0.5 (globally)
- ❌ Node.js: v18.18.0 (needs update to v20.19+ or v22.12+)
- ⏳ Angular Project: Ready to update (after Node.js update)

---

## Step 1: Update Node.js

### For Windows (Recommended: nvm-windows)

1. **Download nvm-windows**:
   - Visit: https://github.com/coreybutler/nvm-windows/releases
   - Download `nvm-setup.exe` (latest version)
   - Run the installer

2. **Install Node.js 22 LTS**:
   ```powershell
   nvm install 22.12.0
   nvm use 22.12.0
   nvm alias default 22.12.0
   ```

3. **Verify**:
   ```powershell
   node --version  # Should show v22.12.0 or higher
   npm --version
   ```

### Alternative: Direct Install

1. Visit https://nodejs.org/
2. Download Node.js v22 LTS (or v20 LTS)
3. Run installer
4. **Restart your terminal/IDE** (important!)

---

## Step 2: Update npm

After updating Node.js:
```powershell
npm install -g npm@latest
```

---

## Step 3: Update Angular Project

Once Node.js is updated, navigate to the project and run:

```powershell
cd dynamic-forms-app

# Update Angular CLI and Core to latest
ng update @angular/cli @angular/core --force

# Update all Angular packages
ng update

# Clean install dependencies
npm install
```

---

## Step 4: Verify

```powershell
ng version
```

Expected output:
- Angular CLI: 21.0.5
- Angular: 21.0.8
- Node: 22.x.x (or 20.x.x)

---

## Step 5: Test the Application

```powershell
npm start
```

Visit http://localhost:4200 to verify everything works.

---

## Troubleshooting

### If ng update fails:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install`
4. Try `ng update` again

### If build fails:
1. Check for breaking changes: https://angular.dev/update
2. Review any migration warnings
3. Update TypeScript if needed: `npm install typescript@latest --save-dev`

### Common Issues:
- **"Node version not supported"**: Make sure you restarted your terminal after installing Node.js
- **"ng: command not found"**: Reinstall Angular CLI: `npm install -g @angular/cli@latest`
- **Build errors**: Check Angular update guide for breaking changes

---

## What Changed in Angular 21?

- Improved performance and smaller bundle sizes
- Enhanced developer experience
- New features and APIs
- Security updates
- Breaking changes (see migration guide)

For detailed changes: https://angular.dev/reference/versions
