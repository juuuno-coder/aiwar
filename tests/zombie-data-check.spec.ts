import { test, expect } from '@playwright/test';

// Function to create a unique user for each test run
const createUser = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return {
        email: `user-${randomId}@example.com`,
        password: 'password123',
        nickname: `Commander-${randomId}`,
    };
};

const user1 = createUser();
const user2 = createUser();
const STARTER_PACK_REWARD_COINS = 1000;

// Helper function to sign up and get initial state
async function signUpAndClaimStarterPack(page, user) {
    await page.goto('/');

    // 1. Enter the network
    await page.getByRole('button', { name: /ENTER_THE_NETWORK/i }).click();

    // 2. Go to Sign Up
    await page.getByRole('button', { name: /Sign Up/i }).click();

    // 3. Fill registration form
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    // 4. Wait for the main dashboard to load by looking for the level indicator
    await expect(page.locator('div').filter({ hasText: /^LVL 1$/ })).toBeVisible({ timeout: 15000 });

    // 5. Complete the tutorial to make the starter pack modal appear
    await page.getByTestId('skip-tutorial-button').click();

    // 6. Claim the starter pack
    await expect(page.getByRole('heading', { name: 'STARTER PACK' })).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('Enter your name').fill(user.nickname);
    await page.getByRole('button', { name: /Claim Your Pack/i }).click();

    // 7. Verify the reward and card visibility
    await expect(page.getByText(`COINS: ${STARTER_PACK_REWARD_COINS}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: `지휘관 ${user.nickname}` })).toBeVisible(); // Check for the custom named card
}


// Helper function to sign out
async function signOut(page) {
    await page.getByTestId('profile-avatar').click();
    // The sidebar might need a moment to animate
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /SYSTEM LOGOUT/i }).click();
    await expect(page.getByRole('button', { name: /ENTER_THE_NETWORK/i })).toBeVisible({ timeout: 10000 });
}

// Helper function to sign in
async function signIn(page, user) {
    await page.getByRole('button', { name: /ENTER_THE_NETWORK/i }).click();
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page.locator('div').filter({ hasText: /^LVL 1$/ })).toBeVisible({ timeout: 15000 });
}


test.describe('Zombie Data Check: User Session Isolation', () => {

    test('should prevent data from a previous session from appearing in a new session', async ({ page }) => {
        // --- STEP 1: Sign up User 1 and claim their starter pack ---
        await signUpAndClaimStarterPack(page, user1);

        // Verify User 1's data is correct
        await expect(page.getByText(`COINS: ${STARTER_PACK_REWARD_COINS}`)).toBeVisible();
        await expect(page.getByRole('heading', { name: `지휘관 ${user1.nickname}` })).toBeVisible();
        console.log(`✅ User 1 (${user1.nickname}) signed up and claimed pack. Coins: ${STARTER_PACK_REWARD_COINS}`);


        // --- STEP 2: Sign out User 1 ---
        await signOut(page);
        console.log('✅ User 1 signed out.');


        // --- STEP 3: Sign up User 2 and claim their starter pack ---
        // This is the critical part. If zombie data exists, this might fail or show User 1's data.
        await signUpAndClaimStarterPack(page, user2);

        // Verify User 2's data is correct and is NOT User 1's data
        await expect(page.getByText(`COINS: ${STARTER_PACK_REWARD_COINS}`)).toBeVisible();
        await expect(page.getByRole('heading', { name: `지휘관 ${user2.nickname}` })).toBeVisible();
        await expect(page.getByRole('heading', { name: `지휘관 ${user1.nickname}` })).not.toBeVisible(); // IMPORTANT: Check that user1's card is gone
        console.log(`✅ User 2 (${user2.nickname}) signed up and claimed pack. Verified data isolation.`);

        // --- STEP 4: Sign out User 2 ---
        await signOut(page);
        console.log('✅ User 2 signed out.');


        // --- STEP 5: Sign in User 1 again to ensure their data is persistent ---
        await signIn(page, user1);

        // Verify User 1's data is restored correctly
        await expect(page.getByText(`COINS: ${STARTER_PACK_REWARD_COINS}`)).toBeVisible();
        await expect(page.getByRole('heading', { name: `지휘관 ${user1.nickname}` })).toBeVisible();
        await expect(page.getByRole('heading', { name: `지휘관 ${user2.nickname}` })).not.toBeVisible(); // Check that user2's card is not present
        console.log(`✅ User 1 (${user1.nickname}) signed back in. Data is correct and persistent.`);

        console.log('🎉 Zombie Data Check PASSED! User sessions are properly isolated.');
    });

});
