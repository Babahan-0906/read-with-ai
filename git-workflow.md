# Git Workflow for PDF Translator

## Quick Commands

### Daily Workflow
```bash
# Check status
git st

# Add all changes
git add .

# Commit with message
git ci -m "Your commit message"

# View commit history
git lg
```

### Useful Aliases (Already Set Up)
- `git st` = `git status`
- `git co` = `git checkout`
- `git br` = `git branch`
- `git ci` = `git commit`
- `git lg` = `git log --oneline --graph --decorate`

### Feature Development
```bash
# Create and switch to feature branch
git co -b feature/new-feature

# Work on feature, then commit
git add .
git ci -m "Add new feature"

# Switch back to main
git co main

# Merge feature (if needed)
git merge feature/new-feature
```

### Quick Save Workflow
```bash
# Quick save current work
git add . && git ci -m "WIP: Current progress"

# Better commit message later
git commit --amend -m "Proper commit message"
```

## Commit Message Guidelines

### Format
```
Type: Brief description

- Detailed changes
- More details if needed
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `style`: UI/styling changes
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Testing
- `chore`: Maintenance

### Examples
```bash
git ci -m "feat: Add scroll view mode for PDF viewer

- Implemented dual view modes (single page / scroll)
- Added responsive design for mobile devices
- Enhanced text selection across multiple pages"

git ci -m "fix: Resolve text selection in scroll mode

- Fixed page detection for selected text
- Improved text layer event handling"

git ci -m "style: Enhance mobile responsive design

- Better button sizing for touch devices
- Optimized spacing for small screens"
```

## Current Project Status

### Latest Commits
- Enhanced .gitignore with comprehensive rules
- Initial commit: PDF Text Selector with responsive design

### Key Features Completed
- ✅ PDF upload and viewing
- ✅ Text selection with visual feedback
- ✅ Dual view modes (single/scroll)
- ✅ Responsive design
- ✅ Console logging
- ✅ Git workflow setup
