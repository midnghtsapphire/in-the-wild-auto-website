# InTheWild — User Guide

> **Product:** InTheWild — Full-Stack AI App Generator  
> **Audience:** Anyone who wants to build a web or mobile app

---

## What InTheWild Does

InTheWild turns a description of your app idea into a complete, working codebase — frontend, backend, database, and deployment configuration — in minutes. You don't need to know how to code.

Unlike tools like Lovable or v0, InTheWild builds the **entire stack**:
- ✅ React frontend with components and routing
- ✅ Node.js/Express backend with API routes
- ✅ Database schema and migrations
- ✅ Docker deployment configuration
- ✅ React Native mobile app (iOS + Android)

---

## Getting Started

### Step 1 — Sign In
Go to the InTheWild home page and click **Sign In**. You can sign in with your email address or Google account.

### Step 2 — Describe Your App
After signing in, you'll land on the **Generate** page. You'll see:
- A **Project Name** field (optional — we'll name it for you if you skip this)
- A large **Describe Your App** text area

Type a description of what you want to build. Be specific — the more detail you give, the better the result.

**Good example:**
> "A task management app where users can create projects, add tasks with due dates, assign tasks to team members, and track completion. Include user authentication, a dashboard with stats, and email notifications when tasks are due."

**Less effective:**
> "A todo app"

### Step 3 — Generate
Click the big **Generate Complete App** button. Generation takes 30–90 seconds. You'll see a loading indicator.

When generation completes, you'll be taken to your **Project Detail** page.

---

## Understanding Your Project

The Project Detail page has four tabs:

### Frontend Tab
Shows the generated HTML/CSS/JavaScript for your app's user interface. This is what users see in their browser.

### Backend Tab
Shows the generated Node.js/Express server code — the API routes, data handling, and business logic.

### Database Tab
Shows the database schema — the tables, columns, and relationships for storing your app's data.

### Mobile App Tab
Convert your web app into a React Native mobile app (works on both iOS and Android).

1. Enter your **App Name** (e.g. "My Task Manager")
2. Enter a **Package Name** (e.g. `com.yourname.taskmanager`)
3. Click **Generate Mobile App**

This generates React Native code, Android configuration, iOS configuration, and build instructions.

---

## Managing Your Projects

Click **My Projects** in the navigation to see all your generated apps.

Each project card shows:
- Project name and description
- Status badge (Generating / Ready / Deployed / Failed)
- Creation date
- A "Live" link if the project has been deployed

Click any project card to open its detail view.

---

## Deploying Your App

On the Project Detail page, click the **Deploy** button in the top-right corner. This initiates deployment to a live URL.

> **Note:** Deployment is currently being wired to production hosting. Check with the development team for the latest deployment status.

Once deployed, you'll see a **View Live** button that takes you directly to your running app.

---

## Billing & Token Usage

InTheWild uses a token-based billing system. Each time you generate an app, it uses some of your monthly token allowance.

### Plans

| Plan | Tokens/month | Cost |
|---|---|---|
| **Free** | 50,000 | $0 |
| **Pro** | 500,000 | $29/month |
| **Business** | 5,000,000 | $99/month |

### Checking Your Usage
The **Generate** page always shows your current token usage at the top — how many tokens you've used this month and what percentage of your limit that is.

To manage your subscription, click **Billing** in the navigation.

---

## Tips for Great Results

1. **Be specific about features.** "User authentication" is good. "Email/password login with password reset, remember me, and session timeout after 30 days of inactivity" is much better.

2. **Describe your data.** Tell InTheWild what information needs to be stored. "Users have a name, email, profile photo, and a bio" helps generate a better database schema.

3. **Describe user flows.** "A user signs up, verifies their email, then sets up their profile before seeing the dashboard" gives the generator clear guidance on how pages should connect.

4. **Name complex features explicitly.** If you want a Stripe payment flow, a drag-and-drop interface, or real-time chat, say so directly.

5. **Iterate.** Start with a focused app description. After reviewing what was generated, you can generate again with a more refined prompt.

---

## Troubleshooting

### "Monthly token limit exceeded"
Your free or paid plan's monthly token quota is used up. Either:
- Wait until your quota resets at the start of next month
- Upgrade your plan on the Billing page

### Generation takes very long or fails
- Check that you have a stable internet connection
- Try a slightly shorter/simpler prompt
- Try again — LLM availability can vary

### The generated code doesn't match what I asked for
This can happen with very complex or ambiguous prompts. Try:
- Breaking your app into smaller, more focused descriptions
- Being more explicit about the tech or framework you want
- Generating again (you get a different result each time)

### I can't sign in
Make sure you're using the same sign-in method you registered with (email vs. Google). If you're locked out, contact support.

---

## Support

- **GitHub Issues:** https://github.com/MIDNGHTSAPPHIRE/in-the-wild-auto-website/issues
- **Owner:** Audrey Evans · @midnghtsapphire
