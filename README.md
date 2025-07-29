## Getting Started

To get started with development, take a look at the main game page: `src/app/page.tsx`.

The core components are located in `src/components/`, divided into `game/` and `admin/` subdirectories.

### Running the Development Server

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deployment Options

You can deploy this application to various platforms. Below are instructions for some popular choices. First, you'll need to have your project in a GitHub repository.

### 1. Set up a GitHub Repository (if you haven't already)

1.  **Create a new repository on GitHub:** Go to [github.com/new](https://github.com/new) to create a new repository for your project. You can make it public or private.
2.  **Initialize Git in your project:** If you haven't already, open a terminal in your project's root directory and run:
    ```bash
    git init -b main
    ```
3.  **Commit your files:** Stage and commit all your project files.
    ```bash
    git add .
    git commit -m "Initial commit"
    ```
4.  **Connect to your GitHub repo:** Link your local repository to the one you created on GitHub. Replace `<YOUR_USERNAME>` and `<YOUR_REPOSITORY_NAME>` with your details.
    ```bash
    git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
    ```
5.  **Push your code:** Push your local repository to GitHub.
    ```bash
    git push -u origin main
    ```

### 2. Add Environment Variables

For the application to work correctly, you need to set up the following environment variables on your chosen hosting platform. You can find these values in `src/lib/firebase.ts`.

*   `NEXT_PUBLIC_FIREBASE_API_KEY`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
*   `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
*   `NEXT_PUBLIC_FIREBASE_APP_ID`
*   `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

  

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


### 4. Choose a Deployment Platform

#### Deploy on Render

1.  **Sign up for Render:** If you don't have an account, sign up at [dashboard.render.com](https://dashboard.render.com).
2.  **Create a New Web Service:** From the dashboard, click **New +** and select **Web Service**.
3.  **Connect Your Repository:** Connect your GitHub account and select the repository for your project.
4.  **Configure the Service:**
    *   **Name:** Give your service a name.
    *   **Region:** Choose a region close to your users.
    *   **Branch:** Select `main`.
    *   **Build Command:** `npm run build`
    *   **Start Command:** `npm start`
5.  **Add Environment Variables:** Under the **Environment** section, add the variables listed above.
6.  **Deploy:** Click **Create Web Service**. Render will build and deploy your application.

#### Deploy on Koyeb

1.  **Sign up for Koyeb:** Create an account at [app.koyeb.com](https://app.koyeb.com).
2.  **Create an App:** From the dashboard, click **Create App**.
3.  **Connect GitHub:** Choose GitHub as the deployment method, connect your account, and select your repository.
4.  **Configure the Service:**
    *   **Branch:** Select `main`.
    *   **Builder:** Choose **Node.js**.
    *   **Build Command:** `npm run build`
    *   **Run Command:** `npm start`
    *   **Port:** Set to `3000`.
5.  **Add Environment Variables:** In the **Environment variables** section, add the necessary variables.
6.  **Deploy:** Give your service a name and click **Deploy**. Koyeb will handle the build and deployment process.

#### Deploy on Cloudflare Pages

1.  **Sign up for Cloudflare:** If you don't have an account, sign up at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2.  **Navigate to Pages:** In the Cloudflare dashboard, go to **Workers & Pages** from the sidebar and select the **Pages** tab.
3.  **Connect to Git:** Click **Create application** and then **Connect to Git**.
4.  **Select your repository:** Choose the GitHub repository you created and click **Begin setup**.
5.  **Configure your build settings:**
    *   **Project name:** Give your project a name.
    *   **Production branch:** Select `main`.
    *   **Framework preset:** Choose **Next.js**. Cloudflare will automatically configure most of the build settings for you.
    *   **Build command:** `npm run build`
    *   **Build output directory:** `.next`
6.  **Add Environment Variables:** Go to **Settings** > **Environment variables** and add the variables listed at the beginning of this section.
7.  **Deploy:** Click **Save and Deploy**. Cloudflare will now build and deploy your application. You'll be given a unique `.pages.dev` URL where you can access your live site.

   

### Using with WordPress (Headless)
You cannot deploy a Next.js application directly to a standard WordPress host, as WordPress runs on PHP. However, you can use Next.js as a "headless" frontend for a WordPress backend.

1.  **WordPress Setup**: Use your WordPress installation as a Headless CMS. Your content (posts, pages, etc.) will be exposed via the WordPress REST API.
2.  **Next.js Development**: Your Next.js app will fetch data from the WordPress API at build time (for static pages) or runtime (for server-rendered pages).
3.  **Deployment**: Deploy the Next.js application to any of the Node.js-compatible platforms listed above (Vercel, Netlify, Render, etc.).
4.  **Connecting the Two**: Configure your Next.js app with the URL of your WordPress site to fetch the data.
