# Git Guide for Compliance Management System

## Repository Information
- **Repository URL**: https://github.com/vraj1091/Compliance_management
- **Branch**: master
- **Remote**: origin

## Common Git Commands

### Check Status
```bash
git status
```
Shows which files have been modified, added, or deleted.

### Add Files
```bash
# Add all changes
git add .

# Add specific file
git add path/to/file
```

### Commit Changes
```bash
git commit -m "Your descriptive commit message"
```

### Push to GitHub
```bash
# Push to current branch
git push

# Push and set upstream (first time for new branch)
git push -u origin branch-name
```

### Pull Latest Changes
```bash
git pull
```

### View Commit History
```bash
git log

# Compact view
git log --oneline

# Last 5 commits
git log -5
```

### Create New Branch
```bash
# Create and switch to new branch
git checkout -b feature-name

# Or using newer syntax
git switch -c feature-name
```

### Switch Branches
```bash
git checkout branch-name

# Or using newer syntax
git switch branch-name
```

### View Remote Information
```bash
git remote -v
```

### View Branch Information
```bash
# List all branches
git branch -a

# List with tracking info
git branch -vv
```

## Typical Workflow

### Making Changes and Pushing
```bash
# 1. Check current status
git status

# 2. Add your changes
git add .

# 3. Commit with a message
git commit -m "Description of changes"

# 4. Push to GitHub
git push
```

### Working with Branches
```bash
# 1. Create new feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push branch to GitHub
git push -u origin feature/new-feature

# 4. Switch back to master
git checkout master

# 5. Merge feature branch (after testing)
git merge feature/new-feature

# 6. Push merged changes
git push
```

## Best Practices

1. **Commit Often**: Make small, focused commits with clear messages
2. **Pull Before Push**: Always pull latest changes before pushing
3. **Use Branches**: Create feature branches for new work
4. **Write Clear Messages**: Use descriptive commit messages
5. **Review Before Commit**: Use `git status` and `git diff` to review changes

## Commit Message Guidelines

### Format
```
<type>: <subject>

<body (optional)>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
git commit -m "feat: Add user authentication system"
git commit -m "fix: Resolve login redirect issue"
git commit -m "docs: Update README with setup instructions"
git commit -m "refactor: Optimize database queries"
```

## Undoing Changes

### Unstage Files
```bash
git reset HEAD file-name
```

### Discard Local Changes
```bash
# Discard changes to specific file
git checkout -- file-name

# Discard all local changes
git reset --hard
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

## Viewing Changes

### See What Changed
```bash
# See unstaged changes
git diff

# See staged changes
git diff --staged

# See changes in specific file
git diff file-name
```

## Troubleshooting

### Merge Conflicts
1. Open conflicted files
2. Resolve conflicts manually
3. Add resolved files: `git add .`
4. Complete merge: `git commit`

### Push Rejected
```bash
# Pull and merge first
git pull

# Resolve any conflicts
# Then push
git push
```

### Forgot to Add Files
```bash
# Add missing files
git add forgotten-file

# Amend last commit
git commit --amend --no-edit
```

## Repository Setup (Already Done)
```bash
# Initialize repository
git init

# Add remote
git remote add origin https://github.com/vraj1091/Compliance_management.git

# Add all files
git add .

# Initial commit
git commit -m "Initial commit"

# Push to GitHub
git push -u origin master
```

## Current Repository Status
✅ Repository initialized
✅ Remote configured: https://github.com/vraj1091/Compliance_management.git
✅ Initial commit created (115 files, 21,636 insertions)
✅ Pushed to GitHub successfully
✅ Branch 'master' tracking 'origin/master'

## Quick Reference Card

| Task | Command |
|------|---------|
| Check status | `git status` |
| Add all changes | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push` |
| Pull | `git pull` |
| Create branch | `git checkout -b branch-name` |
| Switch branch | `git checkout branch-name` |
| View history | `git log --oneline` |
| View remotes | `git remote -v` |

---

**Note**: Always ensure you're on the correct branch before making changes!
