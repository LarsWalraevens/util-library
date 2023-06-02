# Atomic Design System with Sass and Gulp

This repository provides a setup for creating an Atomic Design System using Sass and Gulp. The Atomic Design methodology allows for a modular and scalable approach to designing and developing user interfaces. By combining it with Sass and Gulp, you can streamline your styling workflow and easily compile your Sass files into a master CSS file.

## Prerequisites

Before getting started, ensure that you have the following dependencies installed:

- [Node.js](https://nodejs.org) - JavaScript runtime environment
- [Gulp CLI](https://gulpjs.com/docs/en/getting-started/quick-start/) - Command-line interface for Gulp
- [Sass](https://sass-lang.com/documentation/) - CSS extension language

## Getting Started

1. Copy this folder or set up a new project directory.

2. Organize your project using the Atomic Design system:
   - In this folder you will have an advanced example that you can use to your advantage.
   - I tried adding comments to the files to describe or explain things that follows the Atomic principles.
   - Create folders for atoms, molecules, organisms, templates, and pages.
   - Each component should be placed in the appropriate folder based on its level of complexity.
   - Follow the naming conventions and principles of Atomic Design.

3. Configure the Gulpfile:
   - Copy the provided `gulpfile.js` into the root directory of your project.
   - Customize the Gulpfile to match your project's file structure and requirements.
   - Define Gulp tasks for compiling Sass, autoprefixing, minifying, and any other desired styling tasks.

4. Install the required npm packages:
   - Open the command line in your project's root directory.
   - Run the command `npm install` or `yarn` to install the necessary packages specified in the `package.json` file.

5. Start Gulp:
   - Run the command `gulp` in the command line to start Gulp and initiate the watch functionality.
   - Gulp will monitor your Sass files for changes and automatically compile them into a single CSS file.
   - The compiled CSS file will be saved in a designated folder for easy access.

6. Begin styling with the Atomic Design approach:
   - Start creating your atomic components using Sass.
   - Organize your Sass files within the respective folders based on the Atomic Design hierarchy.
   - Utilize Sass features such as variables, mixins, and partials to enhance your styling workflow.

7. Additional Gulp tasks:
   - Customize the Gulpfile to include additional tasks such as linting, optimizing images, or generating style guides.
   - Explore the Gulp ecosystem for a wide range of plugins that can enhance your frontend development workflow.

8. Happy Styling!
   - You can now start building your user interface using the Atomic Design System and take advantage of the automated Sass compilation provided by Gulp.
   - Edit your Sass files, and Gulp will handle the compilation and output of the final CSS file.

## Additional Resources

- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/) - Learn more about the Atomic Design methodology and its principles.
- [Sass Documentation](https://sass-lang.com/documentation/) - Official documentation for Sass.
- [Gulp Documentation](https://gulpjs.com/docs/en/getting-started/quick-start/) - Official documentation for Gulp.

Feel free to explore the provided resources for further information and guidance on Atomic Design, Sass, and Gulp.

Happy coding!
