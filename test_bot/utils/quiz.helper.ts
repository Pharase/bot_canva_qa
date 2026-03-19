import { expect, FrameLocator, Page } from '@playwright/test';

export async function answerQuiz(
  page: Page,
  quizFrame: FrameLocator,
  expectedAnswerText: string
) {
  const questionLabel = quizFrame.getByText(/Question \d+\/10/);
  const options = quizFrame.locator('#options-container button');

  await expect(options).toHaveCount(4);

  const beforeQuestion = await questionLabel.textContent();

  // 🔹 หา index ของคำตอบที่ถูก
  let targetIndex = -1;

  for (let i = 0; i < 4; i++) {
    const text = (await options.nth(i).getAttribute('data-option'))?.trim();
    if (text === expectedAnswerText.trim()) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) {
    throw new Error(`❌ Answer not found: ${expectedAnswerText}`);
  }

  const answerKey = String.fromCharCode(65 + targetIndex); // A-D

  const targetButton = options.nth(targetIndex);


  // 🔹 คำนวณตำแหน่งจริงจาก DOM
  const box = await targetButton.boundingBox();
  if (!box) throw new Error('❌ Cannot get bounding box');

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  const nextY = box.y + box.height / 2; // เลื่อนไปปุ่มถัดลงมา
  const nextX = x;

  //A = (683, 337)
  //B = (683, 411)
  //C = (683, 486)
  //D = (683, 560)

  const WAIT_X = 683;
  const WAIT_Y = 485;

  await page.addStyleTag({
    content: `
      * {
        transition: none !important;
        animation: none !important;
      }
    `,
  });

  const start = performance.now();
  // 🔹 mouse control
  await page.mouse.move(x, y-20, { steps: 1 });
  await page.mouse.down();
  await page.mouse.up();

  // 🔹 รอข้อถัดไป
  //await page.mouse.move(WAIT_X, WAIT_Y);
  await expect
    .poll(() => questionLabel.textContent(), { timeout: 2550 })
    .not.toBe(beforeQuestion);

  const end = performance.now();
  const durationMs = end - start;

  console.log(
    `🖱️ Click ${answerKey} (${expectedAnswerText}) at (${Math.round(x)}, ${Math.round(y)}) | ⏱️ ${durationMs.toFixed(0)} ms`
  );
}
