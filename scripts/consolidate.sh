#!/bin/bash

# Create new directory structure
mkdir -p src/{__tests__/{unit,integration,e2e,mocks},types/{shared,frontend,backend},utils/{chart,validation,date},services/{api,chart,workflow},components/{chart,rectification,shared},constants/{chart,validation,api},styles/{components,pages,themes}} src/pages/api

# Move test files
mv src/frontend/tests/* src/__tests__/unit/ 2>/dev/null
mv src/shared/tests/* src/__tests__/integration/ 2>/dev/null
mv src/frontend/__mocks__/* src/__tests__/mocks/ 2>/dev/null
mv src/shared/__mocks__/* src/__tests__/mocks/ 2>/dev/null
mv src/__mocks__/* src/__tests__/mocks/ 2>/dev/null

# Move type files
mv src/frontend/types/* src/types/frontend/ 2>/dev/null
mv src/backend/types/* src/types/backend/ 2>/dev/null
mv src/shared/types/* src/types/shared/ 2>/dev/null

# Move utility files
mv src/frontend/utils/* src/utils/chart/ 2>/dev/null
mv src/backend/utils/* src/utils/validation/ 2>/dev/null
mv src/shared/utils/* src/utils/date/ 2>/dev/null

# Move service files
mv src/frontend/services/* src/services/api/ 2>/dev/null
mv src/backend/services/* src/services/chart/ 2>/dev/null
mv src/shared/services/* src/services/workflow/ 2>/dev/null

# Move component files
mv src/frontend/components/chart/* src/components/chart/ 2>/dev/null
mv src/frontend/components/rectification/* src/components/rectification/ 2>/dev/null
mv src/shared/components/* src/components/shared/ 2>/dev/null

# Move style files
mv src/frontend/styles/* src/styles/components/ 2>/dev/null

# Move pages
mv src/frontend/pages/* src/pages/ 2>/dev/null

# Clean up empty directories
rm -rf src/frontend/{tests,__mocks__,types,utils,services,styles,pages} 2>/dev/null
rm -rf src/backend/{types,utils,services} 2>/dev/null
rm -rf src/shared/{tests,__mocks__,types,utils,services,components} 2>/dev/null
rm -rf src/__mocks__ 2>/dev/null

# Remove empty directories
find src -type d -empty -delete

# Create necessary Next.js files
touch src/pages/_app.tsx
touch src/pages/_document.tsx
touch src/pages/index.tsx

echo "Directory consolidation complete" 