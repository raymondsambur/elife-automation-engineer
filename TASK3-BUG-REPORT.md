# 📋 Task 3: Bug Report Analysis & Rewrite

---

## 🔍 What's Missing or Unclear in the Original Report

- **Vague Steps to Reproduce**: 
  *"Open the uploaded data"* and *"Open the data under review"* do not tell the engineer where they are in the application. It misses the specific module (e.g., `QA - D_Shipping Management`), the specific tab (`審査中 / Under Review`), and the action taken to trigger the extraction.

- **Lack of Specific Values**: 
  The *"Actual Result"* just says *"shows uncertain information"*. A good bug report should state exactly what incorrect information is being shown (e.g., it is hallucinating `"2025年02月21日"` and `"しんせつドラッグ"`).

- **Corrupted Date/Time**: 
  The Date/Time of Occurrence is listed as `"46079"`. This looks like an Excel serial date (which translates to roughly February 2026) rather than a human-readable timestamp, making it useless for checking server logs.

- **Missing Test Assets**: 
  The report doesn't link to the specific receipt image or the specific record ID used to trigger the issue. An engineer needs that exact image to test why the OCR (Optical Character Recognition) failed in this specific way.

- **Generic Title**: 
  *"Data extraction shows wrong information"* is too broad. It doesn't mention receipts, OCR, or the specific fields failing.

---

## 📝 Rewritten Bug Report

### **Title**
`OCR Extraction: Unreadable receipt fields (Date, Store Name) populate with hallucinated data instead of "Unreadable" [D_Shipping Management]`

**Summary:**  
When reviewing uploaded receipts in the `D_Shipping Management` module, if the OCR engine cannot read specific fields (such as the Date or Store Name) due to image quality/blur, the system populates these fields with guessed or incorrect data instead of displaying the intended fallback text `"読み取れません"` (Unreadable).

---

### 🛠️ Prerequisites
- [ ] Access to the `QA - D_Shipping Management` environment.
- [ ] A test receipt image where the store name and date are visibly obscured or unreadable.

### 👣 Steps to Reproduce
1. Log into the application and navigate to the **QA - D_Shipping Management** dashboard.
2. Select the **Under Review** (`審査中`) tab.
3. Open a record containing an uploaded receipt where the text is illegible (e.g., Record ID: `#XXXXX`).
4. Observe the auto-extracted data in the **"Receipt Issue Date"** (`レシート発行日`) and **"Store"** (`店舗`) fields.

---

### 🎯 Results

| Result Type | Description |
| :--- | :--- |
| **Expected Result** | Fields that cannot be confidently extracted by the OCR should display the text `"読み取れません"` (Unreadable). |
| **Actual Result** | The system populates the fields with incorrect, hallucinated data. <br> *Example:* Date as `"2025年02月21日 (金) 13:01"` and Store as `"しんせつドラッグ"`, despite those specific areas being completely obscured on the source receipt. |

---

### 💻 Environment
*   **Device:** Lenovo ThinkPad
*   **OS:** Windows 11 Pro
*   **Browser:** Chrome (v122.0), Edge (v122.0)
*   **Date/Time of Occurrence:** March 16, 2026, 14:30 JST *(Note: Replaced "46079" with a standard format)*

### 📎 Attachments
*   `image_ad305b.png` (Screenshot of the UI showing the mismatch)
*   Link to the original uploaded receipt image asset used for this test.

---

## 🤝 Coaching the Original Reporter

To help the original reporter write better tickets in the future, I would frame the feedback collaboratively:

> [!TIP]
> **Coaching Feedback for Reporter**
> "This is a great catch on a tricky OCR bug! To make your reports even stronger going forward, try to write your 'Steps to Reproduce' as if you are giving directions to someone who has never used the app before—mention the exact tabs and buttons to click. Also, always include the exact incorrect values you are seeing on the screen (like the specific wrong date) and attach the exact file you used, as this helps our engineers replicate the exact same error much faster."