# Invoice Management System Documentation

## Page 1: Overview of the Application

### What the App Does

The Invoice Management System is a comprehensive solution for automating the processing, storage, and management of invoices received via email. It combines a backend automation workflow with a frontend dashboard to provide users with a seamless way to view, organize, and analyze their invoices.

### Key Features

- **Automated Invoice Processing**: Automatically detects and processes invoice emails with PDF attachments.
- **AI-Powered Data Extraction**: Uses advanced AI to extract key information from invoices, including amounts, dates, company details, and payment status.
- **Cloud Storage Integration**: Stores original invoice PDFs in Google Drive for easy access and backup.
- **Database Storage**: Maintains structured invoice data in Supabase for efficient querying and reporting.
- **Web Dashboard**: Provides a user-friendly interface for viewing and managing invoices.
- **Access Control**: Secure login system requiring a one-time access code.
- **Real-time Updates**: Processes new invoices as they arrive in the email inbox.

### Technology Stack

- **Backend Automation**: n8n workflow engine
- **AI Processing**: Google Gemini for text extraction
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Google Drive
- **Email Processing**: IMAP protocol
- **Frontend**: Vue.js with Vite
- **Hosting**: Vercel (frontend), Custom server (backend API)
- **Authentication**: Session-based with access code

---

## Page 2: Backend Process (n8n Workflow)

### Workflow Overview

The backend consists of an n8n workflow that runs continuously, monitoring an email inbox for new invoice emails and processing them through several stages.

### Step-by-Step Process

#### 1. Email Monitoring (Email Trigger - IMAP)

- **Function**: Monitors a specified email inbox using IMAP protocol
- **Trigger**: New emails received
- **Credentials**: IMAP account credentials for email access
- **Output**: Raw email data including attachments

#### 2. PDF Filtering (pass pdf's through)

- **Function**: Filters emails to only process those with PDF attachments
- **Logic**: Identifies attachments with .pdf extension and invoice-related keywords
- **Output**: Filtered list of emails with valid PDF invoices

#### 3. Text Extraction (Extract from File)

- **Function**: Extracts text content from PDF attachments
- **Method**: PDF parsing to convert document content to machine-readable text
- **Output**: Text representation of invoice content

#### 4. Invoice Validation (filter out non-invoices)

- **Function**: Further filters content based on invoice keywords
- **Keywords**: faktura, fv, invoice, rachunek (Polish and English terms)
- **Output**: Confirmed invoice documents

#### 5. Batch Processing (Loop Over Items)

- **Function**: Processes each invoice individually in a loop
- **Purpose**: Handles multiple invoices per email efficiently
- **Output**: Individual invoice processing streams

#### 6. Payment Status Analysis (verify invoice payment status)

- **Function**: Analyzes invoice text to determine payment status
- **Logic**: Searches for payment-related keywords:
  - Paid: "zapłacono", "opłacono", "uregulowano", "brak do zapłaty", "saldo 0"
  - Partially Paid: "częściowo zapłacono", "częściowa zapłata", "częściowo opłacono"
  - Unpaid: Default if no payment indicators found
- **Output**: Invoice with payment status classification

#### 7. Data Extraction (Information Extractor)

- **Function**: Uses AI to extract structured data from invoice text
- **AI Model**: Google Gemini Chat Model
- **Extracted Fields**:
  - nip: Tax identification number of the invoice issuer
  - firma: Company name of the invoice issuer
  - numer_faktury: Invoice number
  - data_wystawienia: Issue date (YYYY-MM-DD format)
  - brutto: Total amount including VAT
  - vat: VAT percentage (without % sign)
  - tytul_przelewu: Payment title ("Splata faktury [invoice_number]")
  - numer_rachunku: Bank account number (26-digit Polish format)
  - status: Payment status (Paid/Unpaid/Partially Paid)
- **Output**: Structured JSON data for each invoice

#### 8. File Upload (Upload file)

- **Function**: Uploads original PDF to Google Drive
- **Destination**: Specified folder in Google Drive ("Faktury")
- **Naming**: Uses original filename
- **Output**: Google Drive file metadata including web view and download links

#### 9. Data Merging (Merge)

- **Function**: Combines extracted data with upload metadata
- **Purpose**: Creates complete invoice record
- **Output**: Unified data object

#### 10. Price Calculations (set prices based on brutto)

- **Function**: Calculates additional financial fields
- **Calculations**:
  - netto = brutto / (1 + vat/100)
  - vat_value = brutto - netto
  - vatPrc = vat + "%"
- **Output**: Complete financial data

#### 11. Database Storage (Create a row)

- **Function**: Inserts processed invoice data into Supabase database
- **Table**: invoices
- **Fields**: All extracted and calculated data plus file links
- **Error Handling**: Continues processing on errors

---

## Page 3: Frontend Functionality

### Dashboard Overview

The frontend is a Vue.js single-page application providing a comprehensive invoice management interface.

### Key Components

#### Login System

- **Access Code Authentication**: Single input field for hardcoded access code
- **Session Management**: 30-minute session stored in sessionStorage
- **Route Protection**: Automatic redirect to login for unauthenticated users
- **Cross-tab Synchronization**: Session expiration works across browser tabs

#### Dashboard (Main View)

- **Invoice Table**: Displays all processed invoices with sortable columns
- **Filters**: Search and filter invoices by various criteria
- **Bulk Actions**: Select multiple invoices for batch operations
- **Monthly Summary**: Aggregated financial data by month
- **Reports**: Advanced reporting and analytics features

#### Invoice Management

- **View Details**: Click to view full invoice information
- **Edit**: Modify invoice data (if permitted)
- **Create**: Manual invoice entry (if needed)
- **Delete**: Remove invoices from the system

#### Navigation

- **Router-based**: Client-side routing with Vue Router
- **Protected Routes**: All routes except login require authentication
- **Responsive Design**: Works on desktop and mobile devices

### API Integration

- **Direct Database Access**: Frontend queries Supabase directly
- **Real-time Updates**: Automatic refresh when new invoices are processed
- **File Access**: Direct links to Google Drive files for viewing/downloading

---

## Page 4: Access Control and Security

### Authentication System

- **Access Code Login**: Single-use hardcoded code (777666555444333222111)
- **Session-based**: No persistent user accounts or passwords
- **Time-limited**: 30-minute session timeout
- **Browser Storage**: Uses sessionStorage for cross-tab synchronization

### Who Has Access

- **Authorized Users**: Anyone with knowledge of the access code
- **Single Access**: Code can only be used once (though implementation may vary)
- **Session Exclusivity**: Only one active session per browser
- **No User Management**: No registration, password reset, or user profiles

### Security Measures

- **Route Guards**: Automatic redirection for unauthenticated access attempts
- **Session Validation**: Continuous checking of session expiration
- **No Sensitive Data Exposure**: Access code not stored in client-side code
- **HTTPS Required**: All communications use secure protocols
- **API Security**: Supabase RLS (Row Level Security) policies

### Data Privacy

- **Minimal Personal Data**: Only business-related invoice information
- **File Security**: PDFs stored securely in Google Drive with access controls
- **Database Security**: Supabase provides enterprise-grade security
- **Email Privacy**: Processed emails contain business documents only

---

## Page 5: Data Flow and Integration

### End-to-End Data Flow

#### Input Sources

1. **Email Inbox**: IMAP-monitored email account
2. **PDF Attachments**: Invoice documents in PDF format
3. **Email Content**: Subject lines and body text for context

#### Processing Pipeline

1. **Email Reception** → IMAP trigger detects new messages
2. **Attachment Extraction** → PDFs isolated from emails
3. **Text Extraction** → PDF content converted to text
4. **Content Filtering** → Invoice validation and categorization
5. **AI Analysis** → Structured data extraction using Gemini AI
6. **Payment Analysis** → Status determination from text patterns
7. **File Storage** → PDF upload to Google Drive
8. **Data Storage** → Structured data insertion to Supabase
9. **Frontend Access** → Dashboard queries and displays data

#### Output Destinations

- **Google Drive**: Original PDF files with web/download links
- **Supabase Database**: Structured invoice data for querying
- **Frontend Dashboard**: User interface for data visualization
- **API Endpoints**: Programmatic access for integrations

### Integration Points

#### External Services

- **Google Drive API**: File storage and sharing
- **Google Gemini AI**: Intelligent text processing
- **Supabase**: Database and real-time subscriptions
- **IMAP Email Server**: Email monitoring and retrieval

#### Internal Components

- **n8n Workflow Engine**: Orchestrates the entire processing pipeline
- **Vue.js Frontend**: User interface and data presentation
- **Express.js API**: Additional backend endpoints if needed

---

## Page 6: How It Works End-to-End

### Complete User Journey

#### For Invoice Senders

1. **Send Invoice Email**: Business partners send invoice PDFs via email
2. **Automatic Processing**: System detects and processes the email immediately
3. **Data Extraction**: AI analyzes the PDF and extracts all relevant information
4. **Storage**: Both the original PDF and structured data are stored securely
5. **Notification**: System processes silently (no user notification required)

#### For Dashboard Users

1. **Access Request**: User navigates to the application URL
2. **Authentication**: Enters the access code to gain entry
3. **Session Start**: 30-minute session begins with cross-tab synchronization
4. **Dashboard View**: User sees all processed invoices in a comprehensive table
5. **Data Interaction**: Can filter, search, view details, and analyze invoices
6. **File Access**: Can view/download original PDFs from Google Drive links
7. **Session Management**: Automatic logout after 30 minutes or manual logout

### System Architecture

#### Backend Architecture

```
Email Server (IMAP)
    ↓
n8n Workflow Engine
    ↓
├── Google Gemini AI (Data Extraction)
├── Google Drive (File Storage)
└── Supabase (Database)
```

#### Frontend Architecture

```
Vercel Hosting
    ↓
Vue.js SPA
    ↓
Supabase Direct Queries
    ↓
Real-time Data Display
```

### Business Process Automation

1. **Invoice Receipt**: Eliminates manual email checking
2. **Data Entry**: Automates what would be hours of manual data entry
3. **Payment Tracking**: Automatically categorizes payment status
4. **Financial Reporting**: Enables real-time financial insights
5. **Compliance**: Maintains organized records for tax and audit purposes

### Maintenance and Monitoring

- **Workflow Monitoring**: n8n provides execution logs and error handling
- **Database Monitoring**: Supabase offers query performance and usage analytics
- **File Storage**: Google Drive provides storage usage and access logs
- **Frontend Monitoring**: Vercel provides deployment and performance metrics

This system transforms a manual, time-consuming process into a fully automated, real-time invoice management solution.
