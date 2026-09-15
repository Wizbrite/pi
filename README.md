# Pi Project

This is a modern web application built with [Next.js](https://nextjs.org), utilizing MongoDB (via Mongoose) for the database, Tailwind CSS for styling, and featuring integrations with Cloudinary, Mistral AI, and Nodemailer.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v18.17 or higher recommended)
- [pnpm](https://pnpm.io/) (preferred package manager, as `pnpm-lock.yaml` is present) or npm/yarn
- A [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- Accounts for [Cloudinary](https://cloudinary.com/) (image hosting), [Mistral AI](https://mistral.ai/) (AI integrations), and an SMTP provider (for emails).

## Installation Guide

Follow these steps to get your development environment set up:

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd pi_project/pi
```

### 2. Install Dependencies

Install the project dependencies using pnpm (or npm/yarn):

```bash
pnpm install
```
*(If you are using npm, run `npm install` instead).*

### 3. Configure Environment Variables

Create a new file named `.env.local` in the root directory of the project. You can copy the following template and fill in your specific credentials:

```env
# MongoDB Connection String (must start with mongodb:// or mongodb+srv://)
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (must be at least 32 characters long)
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Mistral AI API Key
MISTRAL_API_KEY=your_mistral_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SMTP Configuration (for sending emails)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
NEXT_PUBLIC_EMAIL_TO=recipient_email_address
```

### 4. Database Seeding (Optional but recommended)

If you need initial data for testing, you can run the seeding scripts provided in the `package.json`:

```bash
# To seed ICT data
pnpm run seed:ict

# To seed Exams data
pnpm run seed:exams
```

### 5. Start the Development Server

Once everything is installed and configured, start the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

## Technologies Used

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Form Handling:** react-hook-form & Zod
- **External Services:** Cloudinary (Media), Mistral AI, Nodemailer (Email)
