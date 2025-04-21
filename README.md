# Online Data Annotation Platform

Welcome to the Online Data Annotation Platform! This platform is designed to facilitate the process of data annotation for various machine learning and data science projects. It provides a user-friendly interface for annotators to label data efficiently and accurately.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Data Upload**: Easy upload of datasets for annotation.
- **Annotation Interface**: Intuitive interface for annotating data.
- **Export Annotations**: Download annotated data in JSON formats.

## Technology Stack

- **Frontend**:
  - **Vue 3**: Modern JavaScript framework for building user interfaces.
  - **Vite**: Next-generation frontend build tool for faster development.
  - **Pinia**: Lightweight state management library for Vue 3.
  - **Element Plus**: Vue 3 UI component library for building modern web applications.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **Git**: [Download and install Git](https://git-scm.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:ABS-ZZ/sync_label.git
   cd sync_label
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   - Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

## Usage

1. **Image data upload**:
    - You can select a local image for uploading.
    - Or load the images from the server through the interface. (Due to security considerations, we have removed the data request interface. If necessary, you can connect to the data interface independently.) 

2. **Annotating Data**:
   - Use the annotation interface to label your data.

3. **Exporting Annotations**:
   - Once your data is annotated, you can export the annotations in JSON formats.

## Contributing

We welcome contributions from the community! If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Submit a pull request to the main repository.

## License

This project is licensed under the [MIT License](LICENSE).