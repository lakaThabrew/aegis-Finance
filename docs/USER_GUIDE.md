# Aegis Finance - User Guide

Welcome to the Aegis Finance system! This guide will walk you through the key features of the mobile application and the web portals (Customer & Admin).

## Part 1: Mobile Application (Flutter)

## 1. Logging In
1. Open the Aegis app.
2. Enter your credentials on the Login Screen:
    - **Username**: `customer-001` or `customer-002` (demo accounts).
    - **Password**: Your registered password.
3. Tap **Login**. The app securely authenticates you and loads your personalized dashboard.

## 2. Viewing Your Dashboard
Once logged in, the **Home Dashboard** provides a unified view of your finances:
- **Total Balance**: Displayed at the top of the screen.
- **Active Accounts**: Swipe through your available checking and savings accounts.
- **Quick Actions**: Use the middle menu to easily jump to Transfers, QR Pay, or Card Management.
- **Recent Transactions**: Scroll down to see a real-time list of your latest incoming and outgoing transactions.

## 3. Transferring Funds
To send money to another account:
1. Tap the **Transfer** icon under Quick Actions.
2. **From Account**: Select the account you wish to debit from the dropdown menu (this lists all your active accounts).
3. **To Account**: Enter the recipient's Account Number or select a saved beneficiary.
4. **Amount**: Enter the amount you wish to transfer.
5. Tap **Send Money**. The dashboard will automatically refresh with your new balance and transaction history once successful.

## 4. Managing Your Cards
You can control the security of your debit/credit cards directly from the app.
1. Tap the **Cards** icon on the dashboard.
2. **Card Details**: Your active card will be displayed in 3D. Tap the card to flip it over and view the CVV.
3. **Security Toggles**:
    - **Freeze Card**: Instantly lock your card to prevent any new transactions.
    - **Online Payments**: Enable/disable internet-based purchases.
    - **International Payments**: Enable/disable transactions processed outside your home country.
    - **Contactless (NFC)**: Enable/disable tap-to-pay functionality.
4. Any changes you make are instantly synchronized with the banking backend to ensure your funds remain secure.

## 5. Using Aegis AI Assistant
Aegis AI is your personal financial assistant powered by Google Gemini.
1. Tap the **Headset/Support** icon in the top right corner of the Home screen.
2. You can type a question like "How much did I spend recently?" or "What is my total balance?".
3. Because Aegis AI has secure access to your financial context, it provides personalized, accurate answers based on your real data. You can also tap the quick-prompt chips (e.g., "Spending summary") to get instant insights.

## Part 2: Customer Web App
The Customer Web App allows users to access their banking details from any browser.
1. **Login**: Go to the Customer Web App URL and log in using your Keycloak credentials.
2. **Dashboard**: View your total balance, active accounts, and recent transactions on a large screen.
3. **AI Widget**: Click the AI floating button on the bottom right to open the Aegis AI Assistant in your browser.

## Part 3: Admin Web App
The Admin Web App is meant for banking staff to monitor and control the system.
1. **Login**: Log in using an administrator account (e.g., `admin-001`).
2. **Dashboard**: View system-wide metrics, active users, and total transaction volumes.
3. **Fraud Monitoring**: Monitor alerts triggered by the Fraud ML Engine.
