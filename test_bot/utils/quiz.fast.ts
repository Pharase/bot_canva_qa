import { expect, FrameLocator, Page } from '@playwright/test';

export async function answerQuizFast(
  page: Page,
  quizFrame: FrameLocator,
  expectedAnswerText: string
) {
  const start = performance.now();

  const options = quizFrame.locator('#options-container button');

  const targetButton = quizFrame.getByRole('button', {
    name: expectedAnswerText.trim(),
  });

  await targetButton.click({
    force: true,
    noWaitAfter: true,
  });

  // ✅ รอ confirm ถูก (เร็ว + stable)
  //await quizFrame 
  //  .locator('#options-container button.correct') 
  //  .waitFor({ timeout: 2000 });
  await expect.poll(
    async () =>
        await quizFrame.locator('#options-container button.correct').count(),
    { timeout: 100 }
    ).toBeGreaterThan(0);

  const end = performance.now();
  console.log(
    `🖱️ Click (${expectedAnswerText}) | ⏱️ ${(end - start).toFixed(0)} ms`
  );
}