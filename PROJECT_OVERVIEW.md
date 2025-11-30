# Sudoku App Project Overview

This document provides a high-level overview of the Sudoku application, detailing its structure and the purpose of its main components.

## Application Description
A web-based Sudoku game built with React and TypeScript. It features a playable Sudoku board, game generation, and validation.

## Project Structure

-   `public/`: Contains static assets like `vite.svg`.
-   `src/`: Main application source code.
    -   `App.css`: Global CSS for the main App component.
    -   `App.tsx`: The root React component, orchestrating the Sudoku game.
    -   `index.css`: Global CSS styles.
    -   `main.tsx`: Entry point of the React application.
    -   `theme.css`: Global theme variables and color palette.
    -   `assets/`: Contains static assets like `react.svg`.
    -   `components/`: Reusable React components.
        -   `SudokuBoard.tsx`: Component responsible for rendering the Sudoku grid and handling user input.
        -   `NumberPad.tsx`: Component for number input controls.
    -   `utils/`: Utility functions for Sudoku logic.
        -   `colorContrast.ts`: Utilities for calculating color contrast ratios.
        -   `contrastCheck.ts`: Script to verify contrast ratios against accessibility standards.
        -   `sudokuGenerator.ts`: Logic for generating new Sudoku puzzles.
        -   `sudokuSolver.ts`: Logic for solving Sudoku puzzles (potentially used for hints or solution checking).
        -   `sudokuValidator.ts`: Logic for validating the current state of the Sudoku board.
-   `index.html`: The main HTML file served by Vite.
-   `package.json`: Project metadata and dependencies.
-   `vite.config.ts`: Vite build configuration.
-   `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: TypeScript configuration files.
-   `eslint.config.js`: ESLint configuration for code linting.
-   `.gitignore`: Specifies intentionally untracked files to ignore.
-   `README.md`: Project README file.

## Core Components and Their Roles

-   **`App.tsx`**: The central component that manages the game state (e.g., the current Sudoku board, game difficulty, user interactions) and renders the `SudokuBoard` component.
-   **`SudokuBoard.tsx`**: Displays the 9x9 Sudoku grid. It handles rendering individual cells, capturing user input (numbers), and visually indicating valid/invalid moves or selected cells. It interacts with `App.tsx` to update the game state.
-   **`sudokuGenerator.ts`**: Uses the `sudoku-gen` library to create new, solvable Sudoku puzzles. Supports 'Easy', 'Medium', 'Hard', and 'Pro' difficulty levels.
-   **`sudokuSolver.ts`**: Contains the algorithm to solve a given Sudoku puzzle. This could be used internally for generating puzzles or externally for providing hints/solutions to the user.
-   **`sudokuValidator.ts`**: Offers functions to check if a given Sudoku board state is valid according to Sudoku rules (no duplicate numbers in rows, columns, or 3x3 blocks).
-   **`NumberPad.tsx`**: A component that renders buttons for numbers 1-9 and a "Clear" button, allowing users to input numbers into the selected cell.

## State Management

The application state is primarily managed in `App.tsx` using React's `useState` hook. Key state variables include:

-   `board`: The current state of the Sudoku grid.
-   `initialBoard`: The starting state of the puzzle (immutable during a game).
-   `solution`: The solved state of the puzzle for validation.
-   `isSolved`: Boolean flag indicating if the puzzle has been solved.
-   `selectedCell`: Coordinates `{ row, col }` of the currently selected cell.

## Tech Stack

-   **Framework**: React 19
-   **Build Tool**: Vite 7
-   **Language**: TypeScript
-   **Styling**: CSS Modules / Global CSS

This overview will help in understanding the context for future modifications and feature additions.