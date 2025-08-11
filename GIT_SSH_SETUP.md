# Git & SSH Configuration for Game Hub Project

## 🔑 SSH Key Configuration

This project uses the `snowmuffin` GitHub account with dedicated SSH keys.

### SSH Key Details
- **Private Key**: `~/.ssh/id_ed25519_snowmuffin`
- **Public Key**: `~/.ssh/id_ed25519_snowmuffin.pub`
- **GitHub Account**: `snowmuffin`

### SSH Configuration
The SSH config (`~/.ssh/config`) should include:

```bash
Host github-account-a
HostName github.com
User git
IdentityFile ~/.ssh/id_ed25519_snowmuffin
IdentitiesOnly yes
```

## 📝 Git Configuration

### Repository Settings
```bash
# Remote URL (using SSH)
origin: git@github-account-a:snowmuffin/game_hub_nest.git

# Local user configuration
user.name: snowmuffin
user.email: snowmuffin@users.noreply.github.com
```

### Setup Commands
If you need to reconfigure this project:

```bash
# Set remote to use SSH
git remote set-url origin git@github-account-a:snowmuffin/game_hub_nest.git

# Configure local Git user
git config user.name "snowmuffin"
git config user.email "snowmuffin@users.noreply.github.com"

# Test SSH connection
ssh -T git@github-account-a
```

## 🔧 Verification

### Test SSH Connection
```bash
ssh -T git@github-account-a
# Expected output: Hi snowmuffin! You've successfully authenticated...
```

### Test Git Push
```bash
git add .
git commit -m "test commit"
git push origin main
```

## 🚨 Troubleshooting

### SSH Key Not Working
1. Check if SSH agent is running:
   ```bash
   ssh-add -l
   ```

2. Add key to SSH agent if needed:
   ```bash
   ssh-add ~/.ssh/id_ed25519_snowmuffin
   ```

3. Verify key permissions:
   ```bash
   chmod 600 ~/.ssh/id_ed25519_snowmuffin
   chmod 644 ~/.ssh/id_ed25519_snowmuffin.pub
   ```

### Authentication Issues
1. Verify the public key is added to GitHub account `snowmuffin`
2. Check SSH config syntax:
   ```bash
   ssh -T -v git@github-account-a
   ```

## 📋 Current Status

✅ SSH key `id_ed25519_snowmuffin` configured  
✅ SSH config with `github-account-a` host alias  
✅ Git remote using SSH  
✅ Local Git user set to `snowmuffin`  
✅ SSH authentication tested and working  

---

*Last updated: 2025-08-11*
