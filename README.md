# 📄 DotAi — Contract Extractor

An end-to-end, full-stack application designed to ingest, analyze, and extract structured data from complex Purchase Order (PO) and contract PDFs. This system utilizes a highly resilient **Hybrid AI Cascade Extraction Pipeline** (Gemini 2.5 Flash → Groq Llama-4 Scout → Regex Fallback) to guarantee data extraction accuracy, coupled with a sleek React frontend that allows users to visually verify AI-extracted fields directly against the source document.

---

### 🔗 Project Links & Team
* 📊 **Presentation Deck (PPT / Google Slides):** [View Presentation](https://docs.google.com/presentation/d/16VCWlFI-iC6Qh9KSaqyydWrxBlK6p7SI/edit?usp=sharing&ouid=114891623805018444011&rtpof=true&sd=true)
* 👥 **Team "POWER RANGER":** Yashika Sharma, Sonakshi Dalal, Shivansh, Ankur
* 💻 **Repository:** [DotAi on GitHub](https://github.com/shivansh8851514064-bit/DotAi.git)

---

## ✨ Key Features

* **🧠 Hybrid AI Cascade Pipeline:** Prioritizes Gemini 2.5 Flash for initial extraction. If it fails, falls back to Groq's Llama-4 Scout, and finally relies on robust Regex patterns for ultimate fault tolerance.
* **🔍 Deep Contract Analysis:** A secondary AI pass dedicated to identifying complex project deadlines, payment obligations, missing clauses (anomalies), and generating PO-specific dynamic fields.
* **🎯 Source Verification Engine:** Click on any extracted field to open a React-PDF viewer that uses a sliding-window text-matching algorithm to highlight the exact clause, sentence, or word the AI used to extract the data.
* **⏱️ Interactive Deadline Calculator:** Automatically calculates contract deadlines based on relative anchors (e.g., "30 days after invoice"). Unresolved triggers can be manually adjusted via an interactive UI.
* **⚙️ Dynamic Custom Schema Management:** Administrators can define new custom fields globally. The system will retroactively back-fill this new data across all previously processed documents.
* **📊 Tabular Line Item Extraction:** Extracts complex tabular data while preserving row integrity via intelligent, page-level PDF chunking using PyMuPDF.
* **📅 Calendar Dashboard:** A centralized calendar view mapping out all upcoming contract expiry dates and critical milestones across the enterprise.

---

## 🛠️ Architecture & Tech Stack

### Backend (Python)
| Technology | Purpose |
| :--- | :--- |
| **FastAPI** | High-performance asynchronous API framework for handling uploads and CRUD operations. |
| **SQLAlchemy (SQLite)** | Database ORM. DB is stored locally at `./data/po_database.db`. |
| **PyMuPDF (fitz)** | Rapid, page-level PDF text extraction to preserve tabular data structures. |
| **Google GenAI SDK** | Primary extraction engine using `gemini-2.5-flash` with strict JSON schema enforcement. |
| **Groq SDK** | Fallback extraction engine using `meta-llama/llama-4-scout-17b-16e-instruct`. |

### Frontend (React)
| Technology | Purpose |
| :--- | :--- |
| **React** | Component-based UI architecture. |
| **React-PDF** | Renders uploaded PDFs directly in the browser for visual source verification. |
| **React-Big-Calendar** | Visualizes extracted contract dates and deadlines. |
| **Lucide React** | Consistent, modern iconography. |
| **Tailwind CSS** | Utility-first styling for complex, responsive dashboards. |

---

## 📂 Project Structure

```text
DotAi/
├── server/
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # API Keys (Gemini, Groq)
│   ├── database/
│   │   ├── connection.py        # SQLite engine & session configuration
│   │   └── models.py            # SQLAlchemy PurchaseOrderRecord schema
│   ├── extractor/
│   │   ├── config.py            # System configuration & field mappings
│   │   ├── extraction.py        # Core AI Cascade (Gemini -> Groq -> Regex)
│   │   └── ingestion.py         # PyMuPDF chunking logic
│   ├── data/                    # Generated automatically
│   │   ├── po_database.db       # Local SQLite Database
│   │   └── custom_fields.json   # Dynamic schema configurations
│   └── document_storage/        # Local storage for uploaded PDF files
│
└── client/
    ├── package.json
    └── src/
        ├── App.jsx              # Main React dashboard shell
        ├── components/          # ExtractionView, CalendarView, SourceSidebar, etc.
        └── utils/               # Date parsing and UI helpers
```

---

## 🎙️ Project Presentation Script (Demo & Pitch Guide)

This script is structured for a **5-minute live demonstration or pitch**. Accompanying slides are available at the **[Google Slides Presentation](https://docs.google.com/presentation/d/16VCWlFI-iC6Qh9KSaqyydWrxBlK6p7SI/edit?usp=sharing&ouid=114891623805018444011&rtpof=true&sd=true)**. It includes exact timing, physical/visual actions on screen, spoken dialogue, and key technical takeaways.

---

### ⏱️ Presentation Timeline Overview

| Stage | Duration | Core Focus | Screen Action |
| :--- | :--- | :--- | :--- |
| **1. Hook & Problem** | `0:00 - 0:45` | Pain of manual contract processing & risks | Landing / Calendar Dashboard |
| **2. Solution & Cascade Architecture** | `0:45 - 1:30` | Hybrid AI Cascade resilience | Architecture Diagram / Tech stack slide |
| **3. Live Ingestion & Extraction** | `1:30 - 2:30` | Uploading PDF, real-time AI parsing | Drag-and-drop PDF in Extraction tab |
| **4. Visual Verification Engine** | `2:30 - 3:15` | Zero-hallucination ground truth verification | Click field to highlight PDF text |
| **5. Deadlines & Calendar Intelligence** | `3:15 - 4:00` | Anchor-based dates & deadline resolution | Trigger calculator & Calendar View |
| **6. Dynamic Schema & Backfill** | `4:00 - 4:30` | Adding custom fields across all historical POs | Schema Manager modal |
| **7. Conclusion & Q&A** | `4:30 - 5:00+` | Wrap-up and handling technical questions | Open discussion |

---

### 🎬 Step-by-Step Script

#### [0:00 - 0:45] Phase 1: The Problem & The Hook
> 🖥️ **Screen:** Display the main dashboard on `http://localhost:5173` showing the Calendar View or All POs list.

* **Speaker Dialogue:**
  > *"Good morning/afternoon, everyone. In modern business operations, organizations process hundreds of complex Purchase Orders, service agreements, and vendor contracts every month.*
  > 
  > *Today, the industry still relies overwhelmingly on manual human review. Procurement officers and legal teams spend countless hours hunting through 15-page PDFs for payment milestones, liability clauses, and delivery dates. This manual process is slow, expensive, and error-prone—leading to missed renewal deadlines, accidental penalty clauses, and compliance failures.*
  > 
  > *Today, I’m excited to present **Contract Extractor**: an enterprise-grade, end-to-end AI system engineered to automate contract ingestion, provide deep clause analysis, and solve the critical trust barrier in AI with pixel-perfect visual ground-truth verification."*

---

#### [0:45 - 1:30] Phase 2: Solution & The Hybrid AI Cascade
> 🖥️ **Screen:** Highlight the key architectural features or switch to the Extraction tab.

* **Speaker Dialogue:**
  > *"When relying on AI for critical legal and financial contracts, a common obstacle is reliability: What happens if an API rate-limits, an endpoint drops, or a model hallucinates?*
  > 
  > *To eliminate single points of failure, we designed the **Hybrid AI Cascade Extraction Pipeline**:*
  > 1. * **Primary Tier:** **Google Gemini 2.5 Flash**, operating with strict JSON schema constraints for ultra-fast, high-accuracy reasoning.*
  > 2. * **Fallback Tier:** If Gemini experiences throttling or network downtime, the system automatically and seamlessly shifts to **Groq's Llama-4 Scout** for lightning-fast sub-second LLM inference.*
  > 3. * **Deterministic Safety Net:** If both cloud APIs fail, robust **Regex pattern matchers** kick in to extract vital identifiers like PO numbers, dates, and currency totals.*
  > 
  > *This 3-tier cascade guarantees uninterrupted uptime and mission-critical fault tolerance."*

---

#### [1:30 - 2:30] Phase 3: Live Ingestion & Structured Extraction
> 🖥️ **Screen:** Click the **Extraction** tab (`/`). Drag and drop a sample contract or PO PDF into the upload zone and click **Analyze Document**.

* **Speaker Dialogue:**
  > *"Let's see it in action. I am uploading a sample multi-page purchase contract.*
  > 
  > *Notice what happens immediately behind the scenes: using **PyMuPDF**, the backend splits and analyzes the document page-by-page. Unlike standard text dumpers that scramble tables across multi-line columns, our page-level chunker preserves tabular row integrity.*
  > 
  > *Once ingested, our secondary **Deep Contract Analysis** engine runs. In seconds, look at what we get:*
  > * *Core metadata: PO number, vendor name, addresses, and total contract value.*
  > * *Itemized line-item tables with unit pricing and quantities.*
  > * *Conditions of payment, authorising signatories, and legal anomalies."*

---

#### [2:30 - 3:15] Phase 4: The Game Changer — Source Verification Engine
> 🖥️ **Screen:** Click directly on an extracted field (such as `Vendor Name`, `Effective Date`, or `Conditions of Payment`). Show the right-hand **Source Verification Sidebar** opening with the PDF page auto-navigated and the exact text highlighted in glowing violet/yellow.

* **Speaker Dialogue:**
  > *"Now, here is the feature that sets this platform apart from conventional AI wrappers: **The Source Verification Engine**.*
  > 
  > *The biggest resistance to adopting AI in legal and financial workflows is trust: 'How do I know the AI didn’t hallucinate this number?'*
  > 
  > *Watch this: I click on this extracted payment condition. Instantly, our React-PDF viewer slides open, jumps directly to page 2, and using our custom sliding-window word-matching algorithm, highlights the exact sentence in the original PDF that the AI used to extract that information.*
  > 
  > *The auditor or contract manager never has to take the AI's word for it—they have instant, clickable visual proof."*

---

#### [3:15 - 4:00] Phase 5: Relative Deadline Calculator & Calendar Sync
> 🖥️ **Screen:** Scroll to the **Milestones & Deadlines** section in the extraction view, demonstrate setting an anchor trigger (e.g. invoice date), and then switch to the **Calendar View** tab.

* **Speaker Dialogue:**
  > *"Contracts rarely have simple static dates. Instead, they say things like: 'Payment due 30 days after receipt of invoice' or 'Delivery within 6 weeks of signing'.*
  > 
  > *Our system identifies these **relative deadline anchors**. Through this interactive UI, the user can input the trigger date—for example, the actual invoice receipt date—and the calculator automatically computes the true calendar deadline, adjusts color-coded urgency indicators, and pushes the event into our centralized **Enterprise Calendar**.*
  > 
  > *Switching to the **Calendar View**, stakeholders can see all contract renewal expirations, delivery milestones, and payment windows across all projects in month, week, or agenda format."*

---

#### [4:00 - 4:30] Phase 6: Dynamic Schema Management & Project Tagging
> 🖥️ **Screen:** Click on **All POs** view to demonstrate filtering, project tagging, and custom schema extension.

* **Speaker Dialogue:**
  > *"Every enterprise has unique needs. If a compliance team suddenly requires tracking a new custom field—such as 'Governing Law State' or 'Carbon Offset Clause'—administrators can define custom schema fields dynamically without touching the database schema.*
  > 
  > *The system will retroactively parse and backfill that new field across existing stored documents.*
  > 
  > *We also support project categorization, document status tracking (Active, In Review, Expired), and direct in-place editable metadata."*

---

#### [4:30 - 5:00] Phase 7: Summary & Conclusion
> 🖥️ **Screen:** Return to the full dashboard or open the API documentation (`/docs`).

* **Speaker Dialogue:**
  > *"To summarize: Contract Extractor bridges the gap between state-of-the-art Generative AI and production enterprise reliability.*
  > * **High Accuracy & Uptime:** via our Gemini 2.5 → Groq Llama-4 → Regex Cascade.*
  > * **Total Transparency:** with real-time PDF ground-truth source highlighting.*
  > * **Actionable Intelligence:** with relative deadline calculation and calendar tracking.*
  > 
  > *Thank you very much. I'd be delighted to answer any questions or demonstrate specific features."*

---

### 💡 Frequently Asked Questions (Q&A Preparation)

* **Q: How does the system handle scanned or image-only PDFs?**
  * *A:* Currently, PyMuPDF extracts embedded text layers directly for speed and table structure preservation. For scanned documents without an OCR layer, an upstream OCR engine (such as Tesseract or Gemini Vision multimodal input) can be piped seamlessly into the ingestion stage.

* **Q: What happens if Gemini API experiences rate limits or goes down?**
  * *A:* The system automatically catches rate limits (`429`), server overloads (`503`), or authentication errors with exponential backoff, and immediately cascades the prompt to the Groq Llama-4 Scout model, ensuring no user interruption.

* **Q: How does the PDF highlighting work without fixed bounding box coordinates?**
  * *A:* We extract tokenized word streams from the PDF text layer using `pdfjs` and apply a fuzzy sliding-window sequence matcher against the AI's returned source quote. This dynamically reconstructs the exact highlight rectangles regardless of zoom level or page scale.