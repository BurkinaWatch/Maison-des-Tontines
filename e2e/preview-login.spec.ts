import { expect, test } from "@playwright/test";

const developmentEmail = process.env.E2E_EMAIL || "preview-e2e@example.com";
const developmentPassword = process.env.E2E_PASSWORD || "preview-password-123";
const developmentPhone = process.env.E2E_PHONE || "+221771234568";

test("shows a login error and signs a development account into the tabs", async ({
  page,
  request,
  baseURL,
}) => {
  // Keep the smoke test self-contained on a fresh development database. A 409
  // means the account already exists from an earlier run, which is expected.
  const registration = await request.post("/api/v1/auth/register", {
    data: {
      phone: developmentPhone,
      email: developmentEmail,
      name: "Preview E2E User",
      password: developmentPassword,
    },
  });
  expect([201, 409]).toContain(registration.status());

  const loginRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/v1/auth/login")) {
      loginRequests.push(request.url());
    }
  });

  await page.goto("/");
  await expect(page.getByText("Welcome back")).toBeVisible();

  await page.getByPlaceholder("vous@exemple.com").fill("missing@example.com");
  await page.getByPlaceholder("Your password").fill("wrongpass123");
  await page.getByText("Sign in", { exact: true }).click();

  await expect(page.getByText("Invalid email address or password")).toBeVisible();

  const previewOrigin = new URL(baseURL || "http://127.0.0.1:5000").origin;
  expect(loginRequests).toContain(`${previewOrigin}/api/v1/auth/login`);

  await page.getByPlaceholder("vous@exemple.com").fill(developmentEmail);
  await page.getByPlaceholder("Your password").fill(developmentPassword);
  await page.getByText("Sign in", { exact: true }).click();

  await expect(page.getByText("Dashboard")).toBeVisible();
  await expect(page.getByText("Tontines", { exact: true })).toBeVisible();
  await expect(page.getByText("Me", { exact: true })).toBeVisible();
  await expect(page.getByText("Invalid email address or password")).not.toBeVisible();
});