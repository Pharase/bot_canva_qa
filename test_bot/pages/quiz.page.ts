import { Page, FrameLocator, expect } from '@playwright/test';

export class QuizPage {
  readonly page: Page;
  readonly frame: FrameLocator;

  constructor(page: Page) {
    this.page = page;
    this.frame = page.frameLocator('iframe[title="Embedded content"]');
  }

  async goto() {
    await this.page.goto(
      'https://hylifehappyvalentine.my.canva.site/good-luck-to-you-jaa',
      { waitUntil: 'networkidle' }
    );

    // Wait for iframe to be ready
    await this.page.waitForSelector('iframe[title="Embedded content"]', { timeout: 10000 });
    await this.page.waitForTimeout(1000); // Give iframe time to fully load

    // 🔒 Disable animations
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          scroll-behavior: auto !important;
        }

        /* 🔴 Mouse debug tracker */
        .pw-mouse {
          position: fixed;
          width: 14px;
          height: 14px;
          background: rgba(255, 0, 0, 0.8);
          border: 2px solid white;
          border-radius: 50%;
          pointer-events: none;
          z-index: 999999;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
      `,
    });

    // 🧭 Inject mouse tracker
    await this.page.evaluate(() => {
      const dot = document.createElement('div');
      dot.className = 'pw-mouse';
      document.body.appendChild(dot);

      document.addEventListener('mousemove', e => {
        dot.style.left = e.clientX - 7 + 'px';
        dot.style.top = e.clientY - 7 + 'px';
      });
    });

    console.log('✅ Page loaded and configured');
  }

  async expectTitleVisible() {
    await expect(
      this.frame.getByRole('heading', { name: 'Valentine Love Song Quiz' })
    ).toBeVisible({ timeout: 10000 });
    console.log('✅ Quiz title visible');
  }

  async fillUserInfo(
    employeeId: string,
    nickname: string,
    fullName: string,
    businessUnit: string
  ) {
    console.log('📝 Filling user information...');

    const employeeIdField = this.frame.getByRole('textbox', { name: 'Enter your Employee ID' });
    await employeeIdField.waitFor({ state: 'visible', timeout: 10000 });
    await employeeIdField.clear();
    await employeeIdField.fill(employeeId);
    console.log(`  ✓ Employee ID: ${employeeId}`);

    const nicknameField = this.frame.getByRole('textbox', { name: 'Enter your Nickname' });
    await nicknameField.clear();
    await nicknameField.fill(nickname);
    console.log(`  ✓ Nickname: ${nickname}`);

    const fullNameField = this.frame.getByRole('textbox', { name: 'Enter your Full Name' });
    await fullNameField.clear();
    await fullNameField.fill(fullName);
    console.log(`  ✓ Full Name: ${fullName}`);

    const businessUnitSelect = this.frame.locator('#business-unit');
    await businessUnitSelect.selectOption(businessUnit);
    console.log(`  ✓ Business Unit: ${businessUnit}`);

    await this.page.waitForTimeout(100);
  }

  async startQuiz() {
    console.log('🎮 Starting quiz...');
    
    const startButton = this.frame.getByRole('button', { name: /Start Quiz|เริ่มเล่นเกม/ });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await expect(startButton).toBeEnabled({ timeout: 10000 });
    
    await startButton.click();
    
    // Wait for quiz to start
    await this.page.waitForTimeout(1000);
    
    // Verify quiz started by checking for question label
    const questionLabel = this.frame.locator('text=/Question \\d+\\/\\d+/');
    await expect(questionLabel).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Quiz started');
  }

  /**
   * ✅ Select answer with proper iframe handling
   */
  async selectAnswer(answer: string) {
    const emojiDisplay = this.frame.locator('#emoji-display');
    await expect(emojiDisplay).toBeVisible({ timeout: 10000 });

    const beforeEmoji = (await emojiDisplay.textContent())?.trim();

    const answerButton = this.frame.locator(
      `#options-container button[data-option="${answer}"]`
    );
    await expect(answerButton).toBeVisible({ timeout: 10000 });
    await expect(answerButton).toBeEnabled({ timeout: 10000 });

    // Scroll into view within iframe
    await answerButton.scrollIntoViewIfNeeded();

    // Get bounding boxes
    const frameElement = this.page.locator('iframe[title="Embedded content"]');
    const frameBox = await frameElement.boundingBox();
    const buttonBox = await answerButton.boundingBox();

    if (frameBox && buttonBox) {
      // Calculate absolute coordinates
      const absoluteX = frameBox.x + buttonBox.x + buttonBox.width / 2;
      const absoluteY = frameBox.y + buttonBox.y + buttonBox.height / 2;

      console.log(`🖱️  Moving to button at (${absoluteX.toFixed(0)}, ${absoluteY.toFixed(0)})`);
      
      // Move mouse
      await this.page.mouse.move(absoluteX, absoluteY, { steps: 1 });
    }

    // Click the button
    await answerButton.click({ timeout: 5000 });
    console.log(`✅ Clicked: "${answer}"`);

    // Wait for state change
    await expect
      .poll(
        async () => (await emojiDisplay.textContent())?.trim(),
        { 
          timeout: 7000,
          intervals: [500]
        }
      )
      .not.toBe(beforeEmoji);
    
    console.log(`✅ Answer processed, emoji changed`);
  }

  /**
   * Get current question number
   */
  async getCurrentQuestion(): Promise<string | null> {
    const questionLabel = this.frame.locator('text=/Question \\d+\\/\\d+/');
    try {
      return (await questionLabel.textContent())?.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if quiz is complete
   */
  async isQuizComplete(): Promise<boolean> {
    // Check for completion message or final screen
    const completeMessage = this.frame.locator('text=/Complete|Finish|Done|เสร็จสิ้น/i');
    return await completeMessage.isVisible().catch(() => false);
  }
}