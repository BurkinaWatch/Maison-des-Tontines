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

  let createdTontineId: string | undefined;
  let accessToken: string | null = null;
  const tontineName = `E2E tontine ${Date.now()}`;

  try {
    await page.getByText("Tontines", { exact: true }).click();
    const emptyStateCreateButton = page.getByText("Create Tontine", { exact: true });
    if (await emptyStateCreateButton.count()) {
      await emptyStateCreateButton.last().click();
    } else {
      await page.getByText("+", { exact: true }).click();
    }

    await page.getByPlaceholder("Enter tontine name").fill(tontineName);
    await page
      .getByPlaceholder("Describe the purpose")
      .fill("End-to-end test tontine for an authenticated account.");
    await page.getByText("Next", { exact: true }).click();

    await page.getByPlaceholder("0").fill("1000");
    await page.getByText("Next", { exact: true }).click();

    await page.getByPlaceholder("YYYY-MM-DD").fill("2027-01-01");
    await page.getByText("Next", { exact: true }).click();
    await page.getByText("Next", { exact: true }).click();

    const creationResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/v1/tontines"),
    );
    await page.getByText("Create Tontine", { exact: true }).last().click();
    const creationResponse = await creationResponsePromise;
    expect(creationResponse.status()).toBe(201);
    const creationBody = await creationResponse.json();
    createdTontineId = creationBody.tontine.id;
    expect(createdTontineId).toEqual(expect.any(String));
    accessToken = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(accessToken).toEqual(expect.any(String));
    await expect(page.getByText(tontineName, { exact: true }).last()).toBeVisible();

    const tontinesResponse = await request.get(
      `${baseURL || "http://127.0.0.1:5000"}/api/v1/tontines`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    expect(tontinesResponse.status()).toBe(200);
    const tontinesBody = await tontinesResponse.json();
    const createdTontine = tontinesBody.tontines.find(
      (tontine: { id: string }) => tontine.id === createdTontineId,
    );
    expect(createdTontine?.name).toBe(tontineName);
    expect(createdTontine?.members).toHaveLength(1);
    expect(createdTontine?.members[0].role).toBe("ORGANIZER");
  } finally {
    if (createdTontineId && accessToken) {
      const cleanupResponse = await request.delete(
        `${baseURL || "http://127.0.0.1:5000"}/api/v1/tontines/${createdTontineId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      expect(cleanupResponse.status()).toBe(204);
    }
  }
});