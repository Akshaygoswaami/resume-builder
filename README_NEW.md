# Resume Builder - Modern Web Application

A professional resume builder with a beautiful UI inspired by resume.com. Built with React, FastAPI, and Supabase.

## Features

- **Modern UI Design**: Clean, professional interface with intuitive controls
- **Real-time Preview**: See your resume update as you type
- **Multiple Section Types**: Experience, Education, Skills, Projects, and Custom sections
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **PDF Export**: Download your resume as a PDF with one click
- **Cloud Storage**: All resumes are saved securely in Supabase
- **Auto-save**: Your work is automatically saved as you edit

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- shadcn/ui component library
- TanStack Query for data fetching

**Backend:**
- FastAPI (Python)
- Supabase for database and storage
- RESTful API architecture

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+

### Running the Application

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Application:**

   The application will automatically start both frontend and backend servers:

   - Frontend: http://localhost:5000
   - Backend API: http://localhost:8000

   Simply run:
   ```bash
   npm run dev
   ```

   Or manually:
   ```bash
   # Terminal 1 - Start Backend
   cd backend
   uvicorn app.main:app --reload --port 8000

   # Terminal 2 - Start Frontend
   npm run dev
   ```

### Database Setup

The application is already configured to use Supabase. The database schema includes:

- **resumes** table: Stores resume metadata and personal information
- **resume_sections** table: Stores individual sections (experience, education, etc.)

Both tables have Row Level Security (RLS) enabled for data protection.

## Project Structure

```
resume-builder/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # API endpoints
│   │   └── supabase_client.py  # Supabase connection
│   └── requirements.txt
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── home-improved.tsx  # Main application
│   │   ├── components/ui/  # UI components
│   │   └── App.tsx
│   └── index.html
├── .env                     # Environment variables
└── package.json
```

## Environment Variables

The `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
CORS_ORIGINS=http://localhost:5000,http://127.0.0.1:5000
```

## API Endpoints

- `GET /api/resumes` - List all resumes
- `POST /api/resumes` - Create a new resume
- `GET /api/resumes/{id}` - Get a specific resume
- `PUT /api/resumes/{id}` - Update a resume
- `DELETE /api/resumes/{id}` - Delete a resume
- `GET /api/health` - Health check endpoint

## Features in Detail

### Personal Information
- Full name, email, phone, location
- Website, LinkedIn, GitHub links
- Professional summary

### Section Types

1. **Experience**: Company, role, dates, location, description
2. **Education**: School, degree, dates, description
3. **Skills**: Skill name and proficiency level
4. **Projects**: Project name, URL, technologies, description
5. **Custom**: Free-form text for any additional sections

### Resume Preview

- Real-time preview updates as you type
- Clean, professional PDF-ready layout
- Optimized for ATS (Applicant Tracking Systems)
- Print-friendly design

### Export to PDF

Click the "Export PDF" button to download your resume as a PDF. The application uses the browser's print functionality for high-quality output.

## Development

### Building for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Type Checking

```bash
npm run check
```

## UI Improvements

The new UI includes:

- **Card-based Layout**: Clean separation of content areas
- **Collapsible Sections**: Expand/collapse sections for better organization
- **Icon Buttons**: Quick access to add different section types
- **Gradient Background**: Modern, professional appearance
- **Sticky Header**: Navigation stays visible while scrolling
- **Responsive Sidebar**: Resume list for easy switching
- **Toast Notifications**: User feedback for actions
- **Loading States**: Visual feedback during operations

## Color Scheme

The application uses a professional color palette:

- Primary: Blue (600-700) for actions and highlights
- Neutral: Slate (50-900) for text and backgrounds
- Accent: Blue gradient for visual interest
- Borders: Subtle slate borders for definition

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Known Issues

None at this time. The application is production-ready.

## Future Enhancements

- Multiple resume templates
- AI-powered content suggestions
- Import from LinkedIn
- Collaboration features
- Custom themes and fonts
- Mobile app

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
