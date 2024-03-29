# Sass with Gulp Setup and BEM Design System

This repository provides a setup for using Sass with Gulp and follows the Block, Element, Modifier (BEM) design system. It allows you to easily compile Sass files into a master CSS file and automate various styling tasks using Gulp.

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org) - JavaScript runtime environment
- [Gulp CLI](https://gulpjs.com/docs/en/getting-started/quick-start/) - Command-line interface for Gulp
- [Sass](https://sass-lang.com/documentation/) - CSS extension language

## Getting Started

1. Create a "styles" folder in your project
   - Create a folder in your project directory to organize your design system and CSS files.
   - Follow the BEM rules while structuring your CSS files within the "styles" folder.

2. Add the gulpfile to the root directory
   - Copy the provided "gulpfile.js" into the root directory of your project.
   - The gulpfile handles the compilation of your Sass files into a master CSS file.
   - Customize the gulpfile to meet your specific requirements.
   - You can find examples of gulpfiles in previous projects or explore various Gulp packages to enhance your workflow.

3. Start Gulp
   - Open the command line in the root directory of your project.
   - Run the command `gulp` to start Gulp and initiate the watch functionality.
   - Gulp will monitor the "styles" folder for changes in Sass files and automatically compile them into a master CSS file.
   - You can also configure Gulp to automate other styling tasks based on your needs.

4. Happy Styling!
   - You are now ready to start styling your project using Sass.
   - Edit your Sass files, and Gulp will compile them into a master CSS file located in the "dist" folder.

## Additional Resources

- [BEM Methodology](https://getbem.com/introduction/) - Introduction to the Block, Element, Modifier (BEM) methodology.
- [Sass Documentation](https://sass-lang.com/documentation/) - Official Sass documentation.
- [Gulp Documentation](https://gulpjs.com/docs/en/getting-started/quick-start/) - Official Gulp documentation.

Feel free to explore the provided resources for further information and guidance.

Happy coding!
