#!/bin/bash

# Split enhanced_rectification.py
mkdir -p src/backend/core/agents/core/enhanced_rectification
mv src/backend/core/agents/core/enhanced_rectification.py src/backend/core/agents/core/enhanced_rectification/index.py
touch src/backend/core/agents/core/enhanced_rectification/{calculations,analysis,validation,utils}.py

# Split ml_engine.py
mkdir -p src/backend/core/agents/core/ml_engine
mv src/backend/core/agents/core/ml_engine.py src/backend/core/agents/core/ml_engine/index.py
touch src/backend/core/agents/core/ml_engine/{model,training,prediction,utils}.py

# Move swisseph data
mkdir -p src/assets/data/swisseph
mv src/shared/data/swisseph/* src/assets/data/swisseph/
rm -rf src/shared/data/swisseph

echo "Large files have been split into modules" 