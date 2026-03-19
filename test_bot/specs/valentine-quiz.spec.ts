import { test } from '@playwright/test';
import { QuizPage } from '../pages/quiz.page';
import { answerQuiz } from '../utils/quiz.helper';
import { quizAnswers } from '../data/quiz.data';
import { answerQuizFast } from '../utils/quiz.fast';


test('Valentine Love Song Quiz flow', async ({ page }) => {
  const quiz = new QuizPage(page);
  const quizFrame = page.frameLocator('iframe');

  await quiz.goto();
  await quiz.expectTitleVisible();
  await quiz.fillUserInfo('PAMC', 'PRO พนักงานระดับล่าง O5', 'PAMC', 'PAMC');
  await quiz.startQuiz();

  for (const { answer } of quizAnswers) {
    //await answerQuiz(page, quizFrame, answer as 'A' | 'B' | 'C' | 'D');
    await answerQuizFast(page, quizFrame, answer);
    await page.waitForTimeout(1600); // รอเล็กน้อยก่อนข้อต่อไป
  }

  // 🛑 ค้างไว้ดูผล
  await quizFrame.locator('text=Congratulations! You have completed the quiz.').waitFor({ timeout: 10000 });
});