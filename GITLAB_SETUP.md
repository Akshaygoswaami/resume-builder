# GitLab Setup Instructions

Your repository has been initialized and committed locally. To push to GitLab, you need to authenticate.

## Option 1: Using Personal Access Token (Recommended)

1. **Create a Personal Access Token on GitLab:**
   - Go to https://gitlab.com/-/user_settings/personal_access_tokens
   - Create a token with `write_repository` scope
   - Copy the token

2. **Push using the token:**
   ```powershell
   &"C:\Program Files\Git\bin\git.exe" push -u origin main
   ```
   When prompted:
   - Username: `akshaygoswami87`
   - Password: `<paste your personal access token>`

## Option 2: Using SSH (More Secure)

1. **Generate SSH key (if you don't have one):**
   ```powershell
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```

2. **Add SSH key to GitLab:**
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to https://gitlab.com/-/user_settings/ssh_keys
   - Add the public key

3. **Change remote to SSH:**
   ```powershell
   &"C:\Program Files\Git\bin\git.exe" remote set-url origin git@gitlab.com:akshaygoswami87-group/resume-builder.git
   &"C:\Program Files\Git\bin\git.exe" push -u origin main
   ```

## Option 3: Using Git Credential Manager

If you have Git Credential Manager installed, it will prompt you to authenticate when you push.

## Quick Push Command

Once authenticated, use:
```powershell
&"C:\Program Files\Git\bin\git.exe" push -u origin main
```

## Note: Create Repository on GitLab First

If the repository doesn't exist on GitLab yet:
1. Go to https://gitlab.com/akshaygoswami87-group
2. Click "New project"
3. Create a project named `resume-builder`
4. Don't initialize with README (we already have one)
5. Then push using one of the methods above
