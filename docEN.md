# Introduction
The objective of this project was to be able to display and evaluate a DMN file. This report explains the project's architecture as well as the design choices, main features, and libraries used to achieve these goals. The source code is also available here [C21111222/DMN_project](https://github.com/C21111222/DMN_project).

![style image](img/style.PNG)

# Code Organization
## Folder Structure
The project consists of several folders and subfolders, following this structure:

- `ts/`: The folder containing all the TypeScript files.
  - `animation/`: Page animation functions (e.g., `eyes_movements`)
  - `models/`: Data model classes (e.g., `DMNModel`)
  - `utils/`: Utility functions and classes (e.g., `migrate_DMN`)
  - `view/`: Classes and functions for data display (e.g., `DataDisplay`)
  - `main.ts`: Main file of the project, importing various functions and data, handling drag and drop files.
- `css/`: Folder for CSS files
- `@types/`: Folder for TypeScript type declarations needed for the build
- `DMN_file`: Folder containing example DMN files

## Naming Conventions
- **File**: Snake-case (e.g., `decision_table.ts`).
- **Classes & Interfaces**: PascalCase (e.g., `DMNModel`).
- **Methods & Variables**: camelCase (e.g., `defineInputData`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_TIMEOUT`).

## Detail of Classes and Functions
The details of the classes, their methods, and the project's functions can be found in the documentation. Refer to the associated section in "Installation and Usage".

# Libraries and Frameworks
The project is based on several libraries to function:
- **DMN-JS**: Groups JavaScript objects to "read" DMN files
- **SweetAlert2**: Allows simple display of notifications.
- **Xmldom**: Allows parsing of XML files
- **DMN-Migrate**: I used this library ([github link](https://github.com/bpmn-io/dmn-migrate)) by adapting it to TypeScript, allowing the migration of DMN files to version 1.3 from earlier versions.
- **Feelin**: Allows evaluation of feel language expressions, which correspond to the rules in a DMN file.
- **TypeDoc**: Allows generation of documentation.

# General Operation
The principle of the application is simple: drag and drop a DMN file. This allows you to visualize and evaluate it. Then, you can observe the output data.

## Additional Features
- **Migration**: Thanks to the migrate-dmn library, the application can handle DMN files in versions 1.1 and 1.2.
- **Sub-table Visualization**: When the MDN file contains multiple decisions, the display corresponds to all of them. To view the sub-tables in detail, you can click on the object representing it in the diagram.
- **Form**: To evaluate a DMN file, you can either drop a JSON file containing the required data or use the automatically generated form by clicking on "Open Input Data form".
- **Documentation**: The generation of documentation for each file is available in

# Installation and Usage

## Prerequisites
- **npm (Node Package Manager)**: The Node.js package manager is necessary for downloading dependencies and building the application.
- **Live Server**: A live server is necessary to open the project's HTML file.

## Build
1. (from GitHub only) Clone the repository.
2. Access the project directory.
3. Install the necessary dependencies by running "npm install".
4. Build the project by running "npm run build".

## Usage
1. Open index.html with a live server in a modern web browser.
2. Drag and drop a DMN file into the designated area.
3. Review the decision table and input data.
4. Evaluate the decision logic by providing a JSON or using the provided form
5. Observe the output.

## Documentation
1. Access the project directory.
2. Run npm run doc.
3. Open docs/index.html in a web browser.

# Limitations
Several points need improvement in this project;
- Incomplete error handling
- Support for aberrant DMN files, for example in a file containing several unrelated decisions (notably flight rebooking)
- Code robustness