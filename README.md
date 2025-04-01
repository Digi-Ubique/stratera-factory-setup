# Factory Portal - Self-Service Dashboard

## Overview

This application provides a comprehensive factory management and visualization portal. It allows users to view and manage factory hierarchies through different visualization methods.

## Component Structure

### Core Components

- **Tree View (`components/factory/tree-view.tsx`)**: Hierarchical tree visualization of factory assets.
- **Graph View (`components/factory/graph-view.tsx`)**: Interactive graph visualization of factory assets and their relationships.
- **Dual View (`app/masters/factory/dual-view.tsx`)**: Container component that allows switching between different visualization methods.
- **API View (`app/masters/factory/dual-view-api.tsx`)**: Advanced view with API data exploration capabilities.

### Services

- **API Service (`services/api-service.ts`)**: Centralized service for all API interactions.
- **Factory Service (`services/factory-service.ts`)**: Factory-specific data processing and transformation.

### UI Components

The application uses shadcn/ui components for consistent styling and behavior.

## Usage Guidelines

### Visualizing Factory Hierarchies

Use the Tree View for exploring hierarchical relationships between factory assets. This view is optimized for navigating through the factory structure from top-level facilities down to individual workstations.

### Exploring Asset Relationships

Use the Graph View for visualizing relationships between assets that might not follow a strict hierarchy. This view is useful for understanding connections and dependencies between different parts of the factory.

### Managing Factory Assets

Use the API View for detailed management of factory assets, including viewing and editing asset properties.

## Development Guidelines

### Adding New Features

1. Identify the appropriate component for your feature
2. Follow the existing patterns for state management and API interactions
3. Use the consolidated API service for all backend communication
4. Implement code splitting for large components
5. Add appropriate documentation

### Code Style

- Use TypeScript for all new components
- Follow the existing naming conventions
- Use shadcn/ui components for UI elements
- Implement proper error handling for all API calls

