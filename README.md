# 🤖 Canva QA Bot (Playwright)

An automated QA bot built with Playwright to interact with web-based question-and-answer interfaces that use complex nested DOM structures (e.g., drag-and-drop or layered elements).

---

## 📌 Overview

This bot is designed to:

1. Navigate to a target website
2. Log in using provided user credentials
3. Analyze the DOM structure of questions
4. Match detected questions with predefined templates
5. Automatically select the correct answers based on matching logic

Due to the complexity of nested DOM elements, direct interaction via DOM selectors is unreliable. Therefore, this bot uses coordinate-based clicking to ensure accurate answer selection.

---

## ⚙️ How It Works

### Step 1: Open Website

The bot launches a browser instance and navigates to the specified URL.

### Step 2: User Authentication

It fills in login credentials and submits the form.

### Step 3: Read Questions (DOM Parsing)

* Extracts question elements from the page
* Normalizes text for matching
* Identifies question patterns

### Step 4: Template Matching

* Loads predefined templates from:

  ```
  tests/assets/templates/
  ```
* Matches detected questions against template questions

### Step 5: Answer Selection

* Finds the correct answer index from the template
* Locates the corresponding answer element
* Performs click using screen coordinates (not DOM click)

---

## 📁 Project Structure

```
bot_canva_qa/
│
├── test_bot/
│   ├── data/
│   │   └── quiz.data.ts
│   │
│   ├── pages/
│   │   └── quiz.page.ts
│   │
│   ├── specs/
│   │   └── valentine-quiz.spec.ts
│   │
│   └── utils/
│       ├── quiz.fast.ts
│       ├── quiz.helper.ts
│
├── package-lock.json
├── package.json
├── playwright.config.js
└── README.md
```

---

## 🧠 Template System

Templates define the mapping between questions and answers.

### Naming Convention:

*  quizAnswers as list in form { emoji: '', answer: '' }

### Behavior:

* Bot reads question from DOM
* Matches with `emoji` in quizAnswer list
* Retrieves answer index from `answer` in quizAnswer list

---

## 🖱️ Why Coordinate-Based Clicking?

The target web application uses deeply nested DOM elements.

Issues with normal DOM interaction:

* Elements overlap
* Click events do not propagate correctly
* Subsequent selections may fail

Solution:

* Use Playwright's mouse click with screen coordinates
* Ensures consistent interaction across all questions

---

## 🚀 Installation

```bash
git clone https://github.com/Pharase/bot_canva_qa.git
cd bot_canva_qa

pip install -r requirements.txt
playwright install
```

---

## ▶️ Usage

```bash
pytest tests/test_bot.py
```

Or run directly:

```bash
python tests/test_bot.py
```

---

## 🔧 Configuration

Update the following in your script:

* Target URL
* Login credentials
* Template file paths

---

## ⚠️ Limitations

* Requires stable UI layout (coordinate-based clicking)
* Sensitive to screen resolution changes
* Template matching must be accurate
* Not suitable for highly dynamic UI changes

---

## 💡 Future Improvements

* Replace coordinate clicks with more reliable selectors
* Add fuzzy matching for question detection
* Build UI for managing templates
* Integrate logging and reporting system

---

## 📬 Contact

For questions or improvements, feel free to open an issue or contribute to the repository.

---
