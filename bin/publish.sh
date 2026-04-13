#!/bin/bash
set -e

echo "📦 Publishing new version..."

# Get current version
CURRENT_VERSION=$(jq -r '.version' package.json)

# Bump patch version
NEW_VERSION=$(echo "$CURRENT_VERSION" | awk -F. '{print $1"."$2"."$3+1}')

# Update package.json
jq ".version = \"$NEW_VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json

# Commit version bump
git add package.json
git commit -m "$NEW_VERSION"

# Publish to npm
npm publish

echo "✅ Published version $NEW_VERSION"
