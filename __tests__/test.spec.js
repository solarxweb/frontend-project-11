// @ts-check
import { test, expect } from "@playwright/test";

const answers = {
  success: "RSS успешно загружен",
  alreadyExist: "RSS уже существует",
  isntRSS: "Ресурс не содержит валидный RSS",
  invalidLink: "Ссылка должна быть валидным URL",
  networkErr: "Ошибка при загрузке данных. Попробуйте позже.",
};

test("check application", async ({ page }) => {
  await page.goto("http://localhost:8080/");

  const feedback = page.locator(".feedback");
  const btn = page.locator("#rss_submit");

  await page.fill("#rss_input", "https://ok.ru/");
  await btn.click();
  await expect(feedback).toHaveText(answers.isntRSS);

  await page.fill("#rss_input", "sobaka");
  await btn.click();
  await expect(feedback).toHaveText(answers.invalidLink);

  await page.fill("#rss_input", "https://lorem-rss.hexlet.app/feed");
  await btn.click();
  await expect(btn).toBeDisabled();
  await expect(feedback).toHaveText(answers.success);

  await page.fill("#rss_input", "https://lorem-rss.hexlet.app/feed");
  await btn.click();
  await expect(feedback).toHaveText(answers.alreadyExist);

  await page.locator("li > a").first().click();
  const classIs = await page.locator("li > a").first().getAttribute("class");
  expect(classIs).toBe("fw-normal");

  const modalWindow = page.locator('.modal-backdrop');

  expect(await modalWindow.isHidden()).toBe(true);
  await page.locator('.modal_btn').first().click();

  expect(await modalWindow.isVisible()).toBe(true);

  const closeModalBtn = page.locator(".modal-footer > button").first();

  await closeModalBtn.click();

  await page.waitForTimeout(600);
  expect(modalWindow).toBeHidden();
});

// Не работает :( -.- >.< -_-
// test("check server error handling", async ({ page }) => {
//   await page.goto("http://localhost:8080/");

//   const input = page.locator("#rss_input");
//   const btn = page.locator("#rss_submit");
//   const feedback = page.locator(".feedback");

//   await page.route("https://lorem-rss.hexlet.app/feed", (route) => {
//     route.fulfill({
//       status: 500,
//       contentType: "application/json",
//       body: "Ошибка сервера - попробуйте позже.",
//     });
//   });

//   await input.fill("https://lorem-rss.hexlet.app/feed");
//   await btn.click();

//
//   await expect(feedback).toHaveText("Ошибка сервера - попробуйте позже.");
// });
