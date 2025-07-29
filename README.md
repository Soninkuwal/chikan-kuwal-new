
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deployment

This is a standard Next.js application, so you can deploy it to any platform that supports Next.js. Here are some popular options:

### Vercel
Vercel is the creator of Next.js and offers a seamless deployment experience. Simply connect your Git repository (GitHub, GitLab, Bitbucket) to Vercel.

1.  Push your code to a Git repository.
2.  Go to [vercel.com](https://vercel.com/) and sign up.
3.  Click "Add New..." -> "Project".
4.  Import your Git repository.
5.  Vercel will automatically detect that it's a Next.js app and configure the build settings.
6.  Click "Deploy".

### Netlify
Netlify also offers great support for Next.js.

1.  Push your code to a Git repository.
2.  Go to [netlify.com](https://netlify.com/) and sign up.
3.  Click "Add new site" -> "Import an existing project".
4.  Connect your Git provider and select your repository.
5.  Netlify will detect it's a Next.js app. The build command should be `next build` and the publish directory should be `.next`.
6.  Click "Deploy site".

### Render
Render is another platform that simplifies deployment.

1.  Push your code to a Git repository.
2.  Go to [render.com](https://render.com/) and sign up.
3.  In the dashboard, click "New +" -> "Web Service".
4.  Connect your Git repository and select it.
5.  Set the environment to "Node".
6.  Set the build command to `npm install && npm run build`.
7.  Set the start command to `npm run start`.
8.  Click "Create Web Service".

### Koyeb
Koyeb is a developer-friendly serverless platform.

1.  Push your code to a Git repository.
2.  Go to [koyeb.com](https://koyeb.com/) and sign up.
3.  In the control panel, click "Create App".
4.  Choose GitHub as the deployment method and select your repository.
5.  Koyeb will automatically detect the `Dockerfile` if you have one, or you can configure it to use Node.js buildpacks.
6.  Set necessary environment variables.
7.  Click "Deploy".

### Heroku
Heroku uses buildpacks to automatically build and deploy your application.

1.  Push your code to a Git repository.
2.  Go to [heroku.com](https://heroku.com/) and sign up.
3.  Create a new app.
4.  Connect your GitHub repository and enable automatic deploys.
5.  Heroku's Node.js buildpack will detect the `build` script in `package.json` and run it automatically.
6.  The `start` script will be used to run the production server.

### Cloudflare Pages
Cloudflare Pages provides a fast and secure platform for deploying modern web applications.

1.  Push your code to a Git repository.
2.  Log in to the Cloudflare dashboard and go to "Workers & Pages".
3.  Click "Create application" -> "Pages" -> "Connect to Git".
4.  Select your project repository.
5.  In the build settings, select "Next.js" as the framework preset. Cloudflare will automatically configure the correct build command and output directory.
6.  Click "Save and Deploy".

### Using with WordPress (Headless)
You cannot deploy a Next.js application directly to a standard WordPress host, as WordPress runs on PHP. However, you can use Next.js as a "headless" frontend for a WordPress backend.

1.  **WordPress Setup**: Use your WordPress installation as a Headless CMS. Your content (posts, pages, etc.) will be exposed via the WordPress REST API.
2.  **Next.js Development**: Your Next.js app will fetch data from the WordPress API at build time (for static pages) or runtime (for server-rendered pages).
3.  **Deployment**: Deploy the Next.js application to any of the Node.js-compatible platforms listed above (Vercel, Netlify, Render, etc.).
4.  **Connecting the Two**: Configure your Next.js app with the URL of your WordPress site to fetch the data.
