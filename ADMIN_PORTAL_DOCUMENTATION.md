# LeadsBuddy.ai — Admin Portal Documentation

---

## Overview

The Admin Portal is a dedicated control center for the LeadsBuddy platform team to manage all accounts, users, support, billing, and platform activity. The portal is organized into clearly separated sections so each area of the business can be managed independently.

**User types handled in this portal:**
- **Individual Users** — People who sign up and use the platform on their own
- **Enterprise Accounts** — Companies/organizations subscribed as a business, each account includes the admin contact who owns and manages it
- **Enterprise Users** — Staff members added under an enterprise account

---

## Who Uses the Admin Portal

| Person | Role |
|--------|------|
| Super Admin | Full access to everything in the admin portal |
| Enterprise Account Owner / Admin | The person who owns the enterprise account and manages their team (separate portal — not covered here) |
| Enterprise User | End user under an enterprise — no admin access |
| Individual User | End user with a personal account — no admin access |

---

## Admin Portal Pages — Full List

| # | Page | Purpose |
|---|------|---------|
| 1 | Dashboard | Platform-wide overview and stats |
| 2 | User Management | Manage individual users |
| 3 | Enterprise Management | Manage enterprise accounts (with admin info included) and their users |
| 4 | Plans | Create and manage subscription plans |
| 5 | Credits & Usage | Track and manage credit balances and usage |
| 6 | Offers & Discounts | Create and manage promotional offers |
| 7 | Payments & Invoices | View all transactions and invoices |
| 8 | Live Chat | Respond to live chat messages from users |
| 9 | Submitted Tickets | Manage support tickets raised by users |
| 10 | Activity & Reports | Search logs, reveal logs, exports |
| 11 | Settings | Platform configuration and admin access |

---

## Page Details

---

### 1. Dashboard

The first page seen after logging into the admin portal. Gives a quick summary of the entire platform at a glance.

---

#### Summary Cards

| Card | What It Shows |
|------|---------------|
| Total Individual Users | All individual accounts ever registered |
| Total Enterprise Accounts | All enterprise organizations on the platform |
| Total Enterprise Users | All users under all enterprises combined |
| Active Users This Month | Users who logged in at least once this month |
| Total Searches This Month | Searches done across all accounts this month |
| Total Email Reveals This Month | Email reveals done across all accounts this month |
| Open Support Tickets | Number of unresolved tickets currently open |
| Unread Live Chats | Number of chat conversations with unread messages |
| Total Revenue This Month | Payments received this month |

---

#### Recent Activity Feed

A live list of the latest actions across the platform. Each entry shows:
- Who performed the action (user name and account type)
- What the action was (login, signup, search, reveal, payment, ticket raised, chat started)
- Date and time it happened

---

#### Graphs & Charts

- New user signups over time — toggle between daily, weekly, and monthly view
- Search activity trend — how many searches are being done over time
- Revenue trend — payments received over the last 30 / 90 days
- Open vs Resolved tickets — support health snapshot
- Plan distribution — how many users are on each plan (pie chart)

---

### 2. User Management

This section is only for **individual users** — people who signed up for LeadsBuddy on their own, not as part of any company or enterprise.

---

#### Tab 2.1 — All Users

A full list of every individual user registered on the platform.

**Filters:**
- Search by name or email
- Filter by account status (Active / Inactive / Suspended)
- Filter by plan type
- Filter by date joined (date range)
- Filter by last login (date range)

**Table Columns:**

| Column | Description |
|--------|-------------|
| Name | Full name of the user |
| Email Address | Registered email address |
| Status | Active, Inactive, or Suspended |
| Plan | Subscription plan they are currently on |
| Credits Remaining | How many credits they have left this month |
| Date Joined | When they created their account |
| Last Login | The last time they logged in |
| Actions | View, Edit, Suspend, Delete |

---

#### Tab 2.2 — User Details (opens when you click a user)

A full detail view for any individual user.

**Personal Information**
- Full Name
- Email Address
- Profile Picture
- Account Status (Active / Inactive / Suspended)
- Date Account Was Created
- Last Login Date and Time

**Plan & Usage**
- Current Subscription Plan
- Plan Start Date
- Plan Renewal / Expiry Date
- Total Searches Performed (all time)
- Total Email Reveals Used (all time)
- Searches Used This Month
- Reveals Used This Month
- Credit Balance Remaining This Month

**Lists**
- Total number of lists created by the user
- Name of each list, its type (People or Companies), and how many contacts are in it

**Payment History**
- A short table of their recent payments — date, amount, plan, and payment status

**Support Activity**
- Number of support tickets raised by this user
- Number of live chat conversations started
- Link to view all their tickets and chats

**Password & Security**
- Button to send a password reset email to the user
- Button to force logout the user from all active sessions

**Actions:**
- Edit name or email address
- Change account status (Activate / Suspend / Deactivate)
- Change subscription plan
- Manually add or deduct credits
- Delete account (requires confirmation)

---

#### Tab 2.3 — Invitations

Tracks all invitations sent to people to join the platform as individual users.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Invited Email | The email address that was invited |
| Invited By | Which admin sent the invitation |
| Date Sent | When the invite was sent |
| Expiry Date | When the invite link stops working |
| Status | Pending / Accepted / Expired |
| Actions | Resend Invite, Cancel Invite |

---

### 3. Enterprise Management

This section is for managing **enterprise accounts** — businesses or organizations using LeadsBuddy as a team. An enterprise account and the admin who owns it are treated as one single record. When an enterprise account is created, the admin contact details are set up as part of that same account. Each enterprise also has:
- Multiple **Enterprise Users** — staff members added under the account by the enterprise admin

---

#### Tab 3.1 — Enterprise Accounts

A list of all companies registered as enterprise customers.

**Filters:**
- Search by company name
- Filter by account status (Active / Inactive / Suspended)
- Filter by plan type
- Filter by industry
- Filter by date created (date range)

**Table Columns:**

| Column | Description |
|--------|-------------|
| Company Name | Name of the enterprise |
| Admin Name | Full name of the person who owns and manages this account |
| Admin Email | Email address of the account admin |
| Industry | What sector they operate in |
| Status | Active, Inactive, or Suspended |
| Plan | Their enterprise subscription plan |
| Total Users | How many users are under this enterprise |
| Credits Used This Month | Credits consumed across all their users this month |
| Date Created | When the enterprise account was set up |
| Actions | View, Edit, Suspend, Delete |

---

#### Tab 3.2 — Enterprise Account Details (opens when you click a company)

A full detail view for any enterprise. Organized into multiple sub-tabs.

---

##### Sub-Tab: Company Information

This sub-tab holds both the company details and the admin contact details together, since the enterprise account and its admin are treated as one record.

**Company Details**

| Field | Description |
|-------|-------------|
| Company Name | Official name of the enterprise |
| Company Website | Their website URL |
| Industry / Sector | What industry they operate in |
| Company Size | Number of employees |
| Country | Where the company is headquartered |
| Region / State | Sub-region or state |
| Account Status | Active / Inactive / Suspended |
| Date Account Created | When they were onboarded |
| Internal Notes | Private notes visible only to admins |

**Admin Contact Details**

| Field | Description |
|-------|-------------|
| Admin Full Name | Full name of the person who owns this account |
| Admin Email Address | Their login email |
| Admin Phone Number | Contact phone number (optional) |
| Admin Status | Active / Inactive |
| Date Admin Was Set Up | When the admin contact was added |
| Last Login | The last time the admin logged in |

**Admin Actions:**
- Edit admin name, email, or phone number
- Send a password reset email to the admin
- Force logout the admin from all active sessions
- Replace admin — assign a different person as the account admin

---

##### Sub-Tab: Plan & Usage

| Field | Description |
|-------|-------------|
| Current Enterprise Plan | Name of the plan they are subscribed to |
| Plan Start Date | When this plan started |
| Plan Renewal / Expiry Date | When the plan renews or expires |
| Total Users Allowed | Maximum users permitted under their plan |
| Total Users Currently Active | How many users are currently active |
| Searches Used This Month | Total searches across all their users this month |
| Reveals Used This Month | Total email reveals across all their users this month |
| Monthly Credit Limit | Total credits allocated per month for this account |
| Credits Remaining This Month | How many credits they still have |

**Actions:**
- Change plan
- Manually add or deduct credits
- Extend plan expiry date

---

##### Sub-Tab: Enterprise Users

Lists all staff members under this enterprise.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Name | Full name |
| Email Address | Their login email |
| Status | Active / Inactive / Suspended |
| Date Added | When they were added |
| Last Login | Last activity date and time |
| Searches This Month | Their personal search usage |
| Reveals This Month | Their personal reveal usage |
| Actions | View, Edit, Suspend, Remove |

**Filters:**
- Search by name or email
- Filter by status

---

##### Sub-Tab: Payment History

All payments made by this enterprise account.

| Column | Description |
|--------|-------------|
| Invoice Number | Unique reference number |
| Amount | How much was paid |
| Plan | Which plan the payment was for |
| Payment Date | When it was paid |
| Payment Method | Card, bank transfer, etc. |
| Status | Paid / Pending / Failed / Refunded |
| Actions | View Invoice, Download Invoice |

---

#### Tab 3.3 — All Enterprise Users

A combined view of every enterprise user across all companies on the platform.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Name | Full name |
| Email Address | Login email |
| Company | Which enterprise they belong to |
| Status | Active / Inactive / Suspended |
| Date Added | When they were added |
| Last Login | Last activity |
| Searches This Month | Personal search count |
| Reveals This Month | Personal reveal count |
| Actions | View, Suspend |

**Filters:**
- Search by name or email
- Filter by company
- Filter by status
- Filter by date joined

---

#### Tab 3.4 — Enterprise Invitations

Tracks all invitations sent for enterprise accounts.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Invited Email | Email that was invited |
| Role | Enterprise Admin or Enterprise User |
| Company | Which enterprise the invite is for |
| Invited By | Who sent the invite |
| Date Sent | When the invite was sent |
| Expiry Date | When the invite link stops working |
| Status | Pending / Accepted / Expired |
| Actions | Resend, Cancel |

---

### 4. Plans

This is a dedicated page for creating and managing all subscription plans available on the platform — both individual and enterprise plans.

---

#### Tab 4.1 — All Plans

A list of every subscription plan currently set up on the platform.

**Filters:**
- Filter by plan type (Individual / Enterprise)
- Filter by status (Active / Inactive / Draft)

**Table Columns:**

| Column | Description |
|--------|-------------|
| Plan Name | Name of the plan (e.g., Free, Pro, Business, Enterprise) |
| Plan Type | Individual or Enterprise |
| Billing Cycle | Monthly, Annual, or Both |
| Monthly Price | Price per month |
| Annual Price | Price per year (if applicable) |
| Search Limit | Max searches allowed per month |
| Reveal Limit | Max email reveals allowed per month |
| Max Users | Maximum users allowed (enterprise plans only) |
| Status | Active, Inactive, or Draft |
| Actions | Edit, Duplicate, Disable |

---

#### Tab 4.2 — Create / Edit Plan (form)

This form appears when adding a new plan or editing an existing one.

**Basic Details**
| Field | Description |
|-------|-------------|
| Plan Name | What the plan will be called |
| Plan Type | Individual or Enterprise |
| Short Description | A brief line shown to the customer about this plan |
| Status | Active (visible to customers), Draft (hidden), or Inactive (disabled) |

**Pricing**
| Field | Description |
|-------|-------------|
| Monthly Price | How much per month |
| Annual Price | How much per year (leave blank if not offered annually) |
| Currency | Currency for the price (e.g., USD) |
| Trial Period | Number of free trial days (0 if no trial) |

**Limits & Allowances**
| Field | Description |
|-------|-------------|
| Monthly Search Limit | How many searches are allowed per month |
| Monthly Email Reveal Limit | How many email reveals are allowed per month |
| Maximum Users | Max users allowed under this plan (for enterprise plans) |
| Rollover Unused Credits | Whether unused credits carry over to the next month (Yes / No) |

**Features Included**
A checklist of features that are included in this plan:
- People Search
- Company Search
- Lists Management
- Email Reveal
- Export to Spreadsheet
- Priority Support
- Dedicated Account Manager
- Custom Credit Packages

---

#### Tab 4.3 — Plan Assignment History

A log of every time a plan was assigned or changed for any user or enterprise.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Account Name | User or enterprise name |
| Account Type | Individual or Enterprise |
| Previous Plan | What plan they were on before |
| New Plan | What plan they moved to |
| Changed By | Which admin made the change (or "Self" if the user upgraded themselves) |
| Date Changed | When the change happened |
| Reason | Why the plan was changed (if noted) |

---

### 5. Credits & Usage

This dedicated page is for tracking and managing credit balances, usage, and any manual credit adjustments across all accounts.

---

#### Tab 5.1 — Credit Overview

A summary of credit usage across the entire platform.

**Summary Cards:**
- Total credits allocated this month (across all accounts)
- Total credits consumed this month
- Total credits remaining across all accounts
- Number of accounts that have used more than 80% of their credits
- Number of accounts that have exceeded their credit limit

---

#### Tab 5.2 — Individual User Credits

Credit status and history for all individual users.

**Filters:**
- Search by name or email
- Filter by credit status (Healthy / Low / Exceeded)
- Filter by plan type

**Table Columns:**

| Column | Description |
|--------|-------------|
| User Name | Full name of the user |
| Email | Their email address |
| Plan | Their current plan |
| Monthly Credit Limit | How many credits they get per month |
| Credits Used This Month | How many they have consumed |
| Credits Remaining | How many are left |
| Status | Healthy / Low (under 20% left) / Exceeded |
| Actions | View History, Add Credits, Deduct Credits |

---

#### Tab 5.3 — Enterprise Credits

Credit status and history for all enterprise accounts.

**Filters:**
- Search by company name
- Filter by credit status (Healthy / Low / Exceeded)
- Filter by plan type

**Table Columns:**

| Column | Description |
|--------|-------------|
| Company Name | Enterprise name |
| Plan | Their current enterprise plan |
| Monthly Credit Limit | Total credits allocated per month |
| Credits Used This Month | Total consumed across all their users |
| Credits Remaining | How many are left for this month |
| Status | Healthy / Low / Exceeded |
| Actions | View History, Add Credits, Deduct Credits |

---

#### Tab 5.4 — Credit Adjustment Log

A full history of every manual credit adjustment made by the admin team.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Account Name | User or enterprise that was adjusted |
| Account Type | Individual or Enterprise |
| Adjustment Type | Added or Deducted |
| Amount | Number of credits added or deducted |
| Reason | Why the adjustment was made |
| Adjusted By | Which admin made the change |
| Date | When the adjustment was made |

**Add Manual Adjustment button** — opens a form with:
- Select Account (search and select a user or enterprise)
- Account Type (auto-filled)
- Adjustment Type (Add / Deduct)
- Number of Credits
- Reason for Adjustment
- Internal Note (optional, only visible to admins)

---

#### Tab 5.5 — Usage Reports

A detailed breakdown of how credits/usage are being consumed across the platform.

**Filters:**
- Date range
- Account type (Individual / Enterprise)
- Specific user or company

**Table Columns:**

| Column | Description |
|--------|-------------|
| Account Name | User or enterprise name |
| Account Type | Individual or Enterprise |
| Searches Done | Number of searches in selected period |
| Reveals Done | Number of email reveals in selected period |
| Credits Consumed | Total credits used in selected period |
| Peak Usage Day | The day they used the most credits |

---

### 6. Offers & Discounts

This page is for creating and managing promotional offers, discount codes, and special deals that can be applied to plans.

---

#### Tab 6.1 — All Offers

A list of all offers and discount codes ever created on the platform.

**Filters:**
- Filter by status (Active / Inactive / Expired / Scheduled)
- Filter by offer type (Percentage Discount / Fixed Amount / Free Trial Extension / Bonus Credits)
- Filter by applicable plan
- Filter by date range

**Table Columns:**

| Column | Description |
|--------|-------------|
| Offer Name | Internal name for the offer |
| Discount Code | The code customers enter to apply the offer (if applicable) |
| Offer Type | Percentage off, Fixed amount off, Free trial extension, or Bonus credits |
| Discount Value | How much off — e.g., 20% or $10 or 30 extra days or 500 extra credits |
| Applicable Plans | Which plans this offer applies to |
| Valid From | Start date of the offer |
| Valid Until | Expiry date of the offer |
| Usage Limit | Maximum number of times this code can be used (blank = unlimited) |
| Times Used | How many times it has been redeemed so far |
| Status | Active / Inactive / Expired / Scheduled |
| Actions | View, Edit, Deactivate, Delete |

---

#### Tab 6.2 — Create / Edit Offer (form)

**Basic Details**
| Field | Description |
|-------|-------------|
| Offer Name | Internal label for this offer (not shown to customers) |
| Offer Description | A note about what this offer is and why it was created |
| Discount Code | The code customers enter (leave blank for auto-apply offers) |
| Offer Type | Percentage Discount / Fixed Amount Off / Free Trial Extension / Bonus Credits |
| Discount Value | The amount — percentage, fixed price, number of days, or number of credits |

**Applicability**
| Field | Description |
|-------|-------------|
| Applicable To | Individual Plans / Enterprise Plans / Both |
| Specific Plans | Select which plans this offer applies to (or select All Plans) |
| New Customers Only | Whether existing customers can use this offer |
| One Time Use Per Account | Whether each account can use this code only once |

**Validity**
| Field | Description |
|-------|-------------|
| Valid From | Date when the offer becomes active |
| Valid Until | Date when the offer expires (leave blank for no expiry) |
| Maximum Total Uses | How many times this code can be redeemed in total (leave blank for unlimited) |

**Status**
- Active — available for use right now
- Scheduled — will become active on the Valid From date
- Inactive — created but not yet activated

---

#### Tab 6.3 — Redemption History

A log of every time an offer or discount code was used.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Account Name | Who used the offer |
| Account Type | Individual or Enterprise |
| Offer Name | Which offer was redeemed |
| Discount Code | The code that was used |
| Discount Applied | The value that was discounted |
| Plan Purchased | Which plan was purchased with this offer |
| Date Redeemed | When the offer was used |
| Invoice Number | The payment this discount was applied to |

---

### 7. Payments & Invoices

This dedicated page tracks all financial transactions across the platform — individual users and enterprise accounts combined.

---

#### Tab 7.1 — All Transactions

A full list of every payment made on the platform.

**Filters:**
- Search by account name or invoice number
- Filter by account type (Individual / Enterprise)
- Filter by payment status (Paid / Pending / Failed / Refunded)
- Filter by plan
- Filter by date range
- Filter by payment method

**Table Columns:**

| Column | Description |
|--------|-------------|
| Invoice Number | Unique reference number for this payment |
| Account Name | Who made the payment (user or company name) |
| Account Type | Individual or Enterprise |
| Plan | Which plan the payment was for |
| Amount | How much was paid |
| Discount Applied | If any offer/discount was used, the amount reduced |
| Final Amount Paid | Actual amount after discounts |
| Payment Method | Card / Bank Transfer / etc. |
| Payment Date | When the payment was made |
| Billing Period | Which month/period this payment covers |
| Status | Paid / Pending / Failed / Refunded |
| Actions | View Invoice, Download Invoice, Issue Refund |

---

#### Tab 7.2 — Individual Payments

Payments made only by individual users, filtered separately for easier management.

**Filters:**
- Search by user name or email
- Filter by plan
- Filter by payment status
- Filter by date range

**Table Columns:**

| Column | Description |
|--------|-------------|
| Invoice Number | Unique reference number |
| User Name | Name of the individual user |
| Email | Their email address |
| Plan | Plan purchased |
| Amount Paid | Final amount paid |
| Discount Used | Offer or discount code applied (if any) |
| Payment Date | When payment was made |
| Billing Period | Period this payment covers |
| Status | Paid / Pending / Failed / Refunded |
| Actions | View Invoice, Download Invoice, Issue Refund |

---

#### Tab 7.3 — Enterprise Payments

Payments made only by enterprise accounts.

**Filters:**
- Search by company name
- Filter by plan
- Filter by payment status
- Filter by date range

**Table Columns:**

| Column | Description |
|--------|-------------|
| Invoice Number | Unique reference number |
| Company Name | Enterprise that made the payment |
| Plan | Enterprise plan purchased |
| Number of Users | How many users were billed for |
| Amount Paid | Final amount paid |
| Discount Used | Offer or discount code applied (if any) |
| Payment Date | When payment was made |
| Billing Period | Period this payment covers |
| Status | Paid / Pending / Failed / Refunded |
| Actions | View Invoice, Download Invoice, Issue Refund |

---

#### Tab 7.4 — Refunds

A dedicated list of all refunds issued on the platform.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Refund Reference | Unique reference number for this refund |
| Original Invoice Number | The payment that was refunded |
| Account Name | User or company that received the refund |
| Account Type | Individual or Enterprise |
| Refund Amount | How much was refunded |
| Reason | Why the refund was issued |
| Refunded By | Which admin processed the refund |
| Date Issued | When the refund was processed |
| Status | Processed / Pending |

---

#### Tab 7.5 — Revenue Summary

A financial overview of platform revenue.

**Summary Cards:**
- Total Revenue This Month
- Total Revenue Last Month
- Total Revenue This Year
- Number of Active Paid Subscriptions
- Number of Failed Payments This Month
- Total Refunds Issued This Month

**Charts:**
- Monthly revenue trend (bar chart)
- Revenue by plan type (pie chart)
- Revenue by account type — Individual vs Enterprise (bar chart)

---

### 8. Live Chat

This page is for the support team to monitor and respond to all live chat conversations initiated by users from within the LeadsBuddy platform.

---

#### Tab 8.1 — All Conversations

A list of every chat conversation on the platform.

**Filters:**
- Filter by status (Open / In Progress / Resolved / Unread)
- Filter by account type (Individual User / Enterprise Admin / Enterprise User)
- Filter by assigned agent (which support admin is handling it)
- Filter by date range

**Table Columns:**

| Column | Description |
|--------|-------------|
| Conversation ID | Unique reference for this chat |
| User Name | Who started the chat |
| Account Type | Individual / Enterprise Admin / Enterprise User |
| Company (if enterprise) | Which enterprise they belong to |
| Subject / First Message | A preview of what the chat is about |
| Assigned To | Which support admin is handling this chat |
| Status | Open / In Progress / Resolved |
| Unread Messages | Number of messages not yet read by the support team |
| Started At | When the chat was first initiated |
| Last Message | Time of the most recent message |
| Actions | Open Chat, Assign, Resolve |

---

#### Tab 8.2 — Chat View (opens when you click a conversation)

The full conversation view for a single chat.

**Left Panel — Conversation Details**
- User Name
- Email Address
- Account Type (Individual / Enterprise Admin / Enterprise User)
- Company Name (if enterprise)
- Plan they are on
- Date they joined
- Number of previous chats
- Number of open support tickets
- Quick links: View User Profile, View Their Tickets

**Center Panel — Chat Messages**
- Full message history in chronological order
- Each message shows: who sent it, the message content, and the time sent
- File/image attachments are shown inline
- Admin messages appear visually distinct from user messages

**Reply Box (at the bottom of chat panel)**
- Text field to type a reply
- Option to attach a file or image
- Send button
- Quick Reply Templates — a dropdown of pre-written common responses the support team can insert
- Internal Note option — add a note visible only to the admin team, not to the user

**Right Panel — Actions**
| Action | Description |
|--------|-------------|
| Assign To | Assign this chat to a specific support admin |
| Change Status | Set to Open / In Progress / Resolved |
| Priority | Set as Normal or Urgent |
| Convert to Ticket | Turn this chat into a formal support ticket |
| Add Tags | Label the chat (e.g., Billing, Technical, Account) |

---

#### Tab 8.3 — Unread / Waiting

A filtered view showing only conversations that have unread messages or are waiting for a response from the support team.

Same columns as All Conversations but filtered automatically to show urgency.

---

#### Tab 8.4 — Quick Reply Templates

Manage pre-written response templates that support agents can use to reply quickly.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Template Name | Short label for the template |
| Category | What type of response it is (e.g., Billing, Technical, General) |
| Message Content | The pre-written reply text |
| Created By | Which admin created it |
| Last Updated | When it was last edited |
| Actions | Edit, Delete |

**Add New Template** — button that opens a form with:
- Template Name
- Category
- Message Content (full text of the reply)

---

### 9. Submitted Tickets

This page manages all formal support tickets raised by users when they need help or want to report an issue. Unlike live chat (which is real-time), tickets are structured requests that are tracked until fully resolved.

---

#### Tab 9.1 — All Tickets

A full list of every support ticket submitted on the platform.

**Filters:**
- Search by ticket number, user name, or subject
- Filter by status (Open / In Progress / Waiting for User / Resolved / Closed)
- Filter by priority (Low / Normal / High / Urgent)
- Filter by category (Billing / Account / Technical / Plans & Credits / Feature Request / Other)
- Filter by account type (Individual / Enterprise Admin / Enterprise User)
- Filter by assigned agent
- Filter by date submitted (date range)

**Table Columns:**

| Column | Description |
|--------|-------------|
| Ticket Number | Unique ID for this ticket |
| Subject | The topic or title of the issue |
| Submitted By | Name of the user who raised the ticket |
| Account Type | Individual / Enterprise Admin / Enterprise User |
| Company (if enterprise) | Which enterprise they belong to |
| Category | What area the ticket is about |
| Priority | Low / Normal / High / Urgent |
| Status | Open / In Progress / Waiting for User / Resolved / Closed |
| Assigned To | Which support admin is handling it |
| Date Submitted | When the ticket was raised |
| Last Updated | When the ticket was last responded to |
| Actions | Open Ticket, Assign, Change Status |

---

#### Tab 9.2 — Ticket Detail View (opens when you click a ticket)

A full view of a single support ticket.

**Ticket Header**
| Field | Description |
|-------|-------------|
| Ticket Number | Unique reference |
| Subject | The issue title |
| Status | Current status |
| Priority | Urgency level |
| Category | What area the ticket is about |
| Submitted On | Date and time raised |
| Last Updated | Most recent activity |

**User Information Panel**
- Name of the user who raised the ticket
- Email Address
- Account Type (Individual / Enterprise Admin / Enterprise User)
- Company Name (if enterprise)
- Plan they are currently on
- Number of previous tickets raised by this user
- Link to their full profile

**Ticket Description**
- The full original message the user wrote when submitting the ticket
- Any file attachments the user included

**Reply Thread**
- Full history of all replies in chronological order
- Each reply shows: who replied (user or admin name), the message, and the timestamp
- Admin replies are visually distinct from user replies

**Reply Box**
- Text field for writing a response
- Attach file option
- Internal Note option — a note only visible to the admin team, not the user
- Send Reply button
- Send and Resolve button (replies and marks ticket as resolved in one step)

**Ticket Actions Panel**

| Action | Description |
|--------|-------------|
| Assign To | Assign to a specific support admin |
| Change Status | Open / In Progress / Waiting for User / Resolved / Closed |
| Change Priority | Low / Normal / High / Urgent |
| Change Category | Re-categorize if needed |
| Link to Live Chat | Link this ticket to a related chat conversation |
| Merge Tickets | Combine with another ticket from the same user if they raised duplicates |
| Close Ticket | Permanently close a resolved issue |

---

#### Tab 9.3 — My Assigned Tickets

A personal view showing only tickets currently assigned to the logged-in support admin. Same columns as All Tickets but pre-filtered.

---

#### Tab 9.4 — Ticket Categories

Manage the list of categories used to classify support tickets.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Category Name | The label (e.g., Billing, Technical, Account) |
| Description | What types of issues belong in this category |
| Number of Tickets | How many open tickets are currently in this category |
| Actions | Edit, Delete |

**Add New Category** — button with:
- Category Name
- Description

---

#### Tab 9.5 — Ticket Reports

A summary view of support ticket performance.

**Summary Cards:**
- Total tickets submitted this month
- Tickets resolved this month
- Average time to first response
- Average time to resolution
- Tickets currently open (unresolved)
- Tickets marked Urgent and unresolved

**Charts:**
- Tickets by status (pie chart)
- Tickets by category (bar chart)
- Ticket volume over time — how many were opened vs resolved each day/week

---

### 10. Activity & Reports

This section gives detailed logs of how the platform is being used and allows the admin team to download reports.

---

#### Tab 10.1 — Search Activity

A log of all searches performed across the platform.

**Filters:**
- Date range
- Account type (Individual / Enterprise)
- Specific user or company
- Search type (People Search / Company Search)

**Table Columns:**

| Column | Description |
|--------|-------------|
| User Name | Who performed the search |
| Account Type | Individual or Enterprise |
| Company (if enterprise) | Which enterprise they belong to |
| Search Type | People Search or Company Search |
| Filters Applied | Summary of what filters were used |
| Number of Results | How many results were returned |
| Date & Time | When the search was done |

---

#### Tab 10.2 — Email Reveal Activity

A log of all email reveals performed on the platform.

**Filters:**
- Date range
- Account type
- Specific user or company

**Table Columns:**

| Column | Description |
|--------|-------------|
| User Name | Who revealed the email |
| Account Type | Individual or Enterprise |
| Company (if enterprise) | Which enterprise they belong to |
| Contact Name | The person whose email was revealed |
| Date & Time | When the reveal happened |

---

#### Tab 10.3 — Login History

A log of all logins across the platform.

**Filters:**
- Date range
- Account type
- Specific user

**Table Columns:**

| Column | Description |
|--------|-------------|
| User Name | Who logged in |
| Email | Their email address |
| Account Type | Individual / Enterprise Admin / Enterprise User |
| Login Date & Time | When they logged in |
| Status | Successful or Failed |

---

#### Tab 10.4 — Exported Reports

Download summaries of platform data as spreadsheet files.

**Available Exports:**

| Report | What It Contains |
|--------|-----------------|
| All Individual Users | Full list with plan, usage stats, and status |
| All Enterprise Accounts | Full list with user counts, plan, and usage |
| All Enterprise Users | Full list with company, plan, and usage stats |
| Monthly Activity Report | Searches and reveals broken down by account for a selected month |
| Credit Usage Report | Credit limits, usage, and remaining balance for all accounts |
| Payments Report | All transactions for a selected date range |
| Support Ticket Report | All tickets with status, priority, and resolution time |

Each export can be filtered by date range and account type before downloading.

---

### 11. Settings

Platform-wide configuration managed by the super admin.

---

#### Tab 11.1 — General Settings

| Setting | Description |
|---------|-------------|
| Platform Name | The name shown across the platform |
| Support Email Address | The email address shown to users for support |
| Default Plan for New Sign-ups | Which plan new individual users are placed on by default |
| New Registrations | Toggle — whether new users can sign up (on/off) |
| Maintenance Mode | Toggle — puts the platform in maintenance mode for all users |

---

#### Tab 11.2 — Email & Notifications

Settings for all automated emails sent by the platform.

| Setting | Description |
|---------|-------------|
| Welcome Email | Toggle on/off and edit the message content |
| Invitation Email | Toggle on/off and edit the message content |
| Password Reset Email | Edit the message template |
| Plan Expiry Reminder | How many days before expiry to send the reminder |
| Low Credits Warning | What percentage of credits remaining triggers a warning email to the user |
| Payment Failed Notification | Toggle on/off — email sent when a payment fails |
| New Ticket Confirmation | Toggle on/off — email sent to user when their ticket is received |
| Ticket Reply Notification | Toggle on/off — email sent to user when support replies to their ticket |

---

#### Tab 11.3 — Admin Accounts

Manage who has access to this admin portal.

**Table Columns:**

| Column | Description |
|--------|-------------|
| Name | Admin's full name |
| Email | Admin's login email |
| Access Level | Super Admin |
| Status | Active / Inactive |
| Date Added | When they were added |
| Last Login | Their most recent login to the admin portal |
| Actions | Edit, Deactivate |

**Add New Admin** — button that opens a form with:
- Full Name
- Email Address

---

## Summary: What Manages What

| Page | Manages |
|------|---------|
| Dashboard | Platform-wide overview and key numbers |
| User Management | Individual user accounts only |
| Enterprise Management | Enterprise accounts (admin contact included in each account) and their users |
| Plans | Subscription plan creation and management |
| Credits & Usage | Credit balances, usage tracking, and manual adjustments |
| Offers & Discounts | Promo codes, discounts, and offer redemption history |
| Payments & Invoices | All financial transactions, invoices, and refunds |
| Live Chat | Real-time chat support with users |
| Submitted Tickets | Formal support ticket tracking and resolution |
| Activity & Reports | Usage logs and downloadable reports |
| Settings | Platform configuration and admin portal access control |

---

*This document covers the full scope of the LeadsBuddy.ai Admin Portal — all pages, tabs, fields, and functionality. No code is involved in this document.*
