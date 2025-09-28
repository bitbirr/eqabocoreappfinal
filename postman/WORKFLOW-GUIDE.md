# 🏨 Hotel Booking Complete Workflow Guide

This guide walks you through the **complete end-to-end hotel booking process** using the Hotel Booking Workflow Postman collection.

## 📋 Workflow Overview

The complete hotel booking process follows these **7 sequential steps**:

```
1️⃣ Authentication → 2️⃣ Hotel Search → 3️⃣ Room Availability → 4️⃣ Create Booking → 5️⃣ Payment → 6️⃣ Callback → 7️⃣ Receipt
```

## 🚀 Quick Setup

### Prerequisites
1. **API Server Running**: Ensure your server is running on `http://localhost:3000`
2. **Postman Installed**: Latest version of Postman
3. **Database Seeded**: Hotel and room data should be available

### Import Collection
1. Open Postman
2. Click **Import**
3. Import these files:
   - `Hotel-Booking-Workflow.postman_collection.json`
   - `Hotel-Booking-Workflow.postman_environment.json`
4. Select **Hotel Booking Workflow Environment** from dropdown

## 🔄 Complete Workflow Steps

### 1️⃣ Authentication
**🔐 Register & Login**

**Purpose**: Authenticate user and get JWT token for protected endpoints

**What it does**:
- Registers a new user account
- Returns JWT authentication token
- Automatically stores token and user ID

**Sample Data**:
```json
{
  "first_name": "Abebe",
  "last_name": "Kebede",
  "phone": "+251911123456",
  "password": "SecurePassword123!",
  "role": "hotel_owner"
}
```

**Auto-stored Variables**:
- `jwt_token` - For subsequent authenticated requests
- `user_id` - Current user identifier

**✅ Success Indicators**:
- Status: 200 OK
- JWT token received and stored
- User data returned

---

### 2️⃣ Hotel Search
**🔍 Search Hotels by City**

**Purpose**: Find available hotels in the desired city

**What it does**:
- Searches hotels in Addis Ababa
- Returns list of available hotels with details
- Automatically selects first hotel for next step

**Query Parameters**:
- `city`: "Addis Ababa"
- `limit`: 10 results
- `offset`: 0 (start from beginning)

**Auto-stored Variables**:
- `selected_hotel_id` - ID of chosen hotel

**✅ Success Indicators**:
- Status: 200 OK
- Hotels array returned
- Hotel automatically selected

---

### 3️⃣ Room Availability
**🏠 Check Room Availability**

**Purpose**: Check available rooms for specific dates

**What it does**:
- Checks availability for selected hotel
- Shows available rooms for Oct 1-3, 2025
- Automatically selects first available room
- Calculates total booking price

**Date Parameters**:
- `checkin`: 2025-10-01
- `checkout`: 2025-10-03

**Auto-stored Variables**:
- `selected_room_id` - ID of chosen room
- `total_booking_price` - Calculated total cost

**✅ Success Indicators**:
- Status: 200 OK
- Available rooms returned
- Room automatically selected
- Price calculated

---

### 4️⃣ Create Booking
**📝 Create Hotel Booking**

**Purpose**: Create the actual hotel reservation

**What it does**:
- Creates booking with selected room
- Sets guest information and dates
- Returns booking with 'pending' status
- Stores booking ID for payment

**Booking Data**:
```json
{
  "room_id": "{{selected_room_id}}",
  "check_in_date": "2025-10-01",
  "check_out_date": "2025-10-03",
  "guest_name": "Abebe Kebede",
  "guest_email": "abebe.kebede@example.com",
  "guest_phone": "+251911123456",
  "special_requests": "Late check-in requested, non-smoking room preferred"
}
```

**Auto-stored Variables**:
- `booking_id` - Created booking identifier

**✅ Success Indicators**:
- Status: 201 Created
- Booking created with 'pending' status
- Booking ID stored

---

### 5️⃣ Payment Initiation
**💳 Initiate Payment**

**Purpose**: Start the payment process for the booking

**What it does**:
- Creates payment record for booking
- Generates payment URL for Chapa gateway
- Returns transaction reference
- In real scenario, user would be redirected to payment URL

**Payment Data**:
```json
{
  "booking_id": "{{booking_id}}",
  "payment_provider": "chapa"
}
```

**Auto-stored Variables**:
- `payment_id` - Payment record ID
- `transaction_reference` - Unique transaction identifier
- `payment_url` - Gateway payment URL

**✅ Success Indicators**:
- Status: 200 OK
- Payment URL generated
- Transaction reference created

---

### 6️⃣ Payment Callback
**✅ Payment Completion Callback**

**Purpose**: Simulate payment gateway callback to complete payment

**What it does**:
- Simulates successful payment completion
- Updates payment status to 'completed'
- Updates booking status to 'confirmed'
- In real scenario, this is called by payment gateway

**Callback Data**:
```json
{
  "transaction_reference": "{{transaction_reference}}",
  "status": "completed",
  "amount": 5000.00,
  "currency": "ETB",
  "provider_transaction_id": "chapa_txn_1234567890"
}
```

**✅ Success Indicators**:
- Status: 200 OK
- Payment marked as completed
- Booking confirmed

---

### 7️⃣ Booking Receipt
**🧾 Get Booking Receipt**

**Purpose**: Retrieve final booking confirmation with all details

**What it does**:
- Gets complete booking details
- Shows confirmed status
- Displays hotel, room, guest, and payment information
- Provides final receipt/confirmation

**Receipt Information**:
- ✅ Booking confirmation number
- 🏨 Hotel details (name, address, city)
- 🛏️ Room details (type, price)
- 📅 Stay dates and duration
- 👤 Guest information
- 💳 Payment confirmation
- 📧 Confirmation details

**✅ Success Indicators**:
- Status: 200 OK
- Booking status: 'confirmed'
- Complete details displayed

## 🔧 Environment Variables

### Auto-Managed Variables
These are automatically set by the workflow:

| Variable | Description | Set By |
|----------|-------------|---------|
| `jwt_token` | Authentication token | Step 1 |
| `user_id` | Current user ID | Step 1 |
| `selected_hotel_id` | Chosen hotel ID | Step 2 |
| `selected_room_id` | Chosen room ID | Step 3 |
| `total_booking_price` | Calculated price | Step 3 |
| `booking_id` | Created booking ID | Step 4 |
| `payment_id` | Payment record ID | Step 5 |
| `transaction_reference` | Payment reference | Step 5 |
| `payment_url` | Gateway URL | Step 5 |

### Pre-configured Variables
These are set in the environment:

| Variable | Value | Purpose |
|----------|-------|---------|
| `base_url` | http://localhost:3000 | API endpoint |
| `workflow_guest_name` | Abebe Kebede | Guest name |
| `workflow_guest_email` | abebe.kebede@example.com | Guest email |
| `workflow_guest_phone` | +251911123456 | Guest phone |
| `workflow_city` | Addis Ababa | Search city |
| `workflow_checkin_date` | 2025-10-01 | Check-in date |
| `workflow_checkout_date` | 2025-10-03 | Check-out date |

## 🎯 Running the Complete Workflow

### Option 1: Manual Sequential Execution
1. Click on **1️⃣ Authentication** → **🔐 Register & Login** → **Send**
2. Wait for success, then click **2️⃣ Hotel Search** → **🔍 Search Hotels by City** → **Send**
3. Continue with each step in order: 3️⃣ → 4️⃣ → 5️⃣ → 6️⃣ → 7️⃣

### Option 2: Collection Runner
1. Click **Collections** → **Hotel Booking Complete Workflow**
2. Click **Run** button
3. Select all requests in order
4. Click **Run Hotel Booking Complete Workflow**
5. Watch the automated execution

## 🧪 Testing & Validation

### Automatic Tests
Each step includes comprehensive tests:

- ✅ **Status Code Validation** - Ensures correct HTTP status
- ✅ **Response Structure** - Validates JSON structure
- ✅ **Data Extraction** - Automatically stores variables
- ✅ **Business Logic** - Checks booking flow logic
- ✅ **Performance** - Response time under 5 seconds

### Console Logging
Each step provides detailed console output:

- 📊 **Step Progress** - Current step and status
- 📋 **Data Summary** - Key information extracted
- ➡️ **Next Step** - What to do next
- 🎉 **Success Messages** - Confirmation of completion

## 🚨 Troubleshooting

### Common Issues

**❌ Authentication Failed (Step 1)**
- Check if API server is running
- Verify base_url is correct
- Ensure database is accessible

**❌ No Hotels Found (Step 2)**
- Verify database has hotel data
- Check if hotels exist in "Addis Ababa"
- Run database seeding if needed

**❌ No Rooms Available (Step 3)**
- Check if rooms exist for selected hotel
- Verify dates are in the future
- Ensure rooms are not all booked

**❌ Booking Creation Failed (Step 4)**
- Ensure JWT token is valid
- Check if room_id exists
- Verify guest data format

**❌ Payment Initiation Failed (Step 5)**
- Ensure booking exists and is pending
- Check payment provider configuration
- Verify booking_id is valid

**❌ Payment Callback Failed (Step 6)**
- Ensure transaction_reference exists
- Check callback data format
- Verify payment is in correct state

**❌ Receipt Not Found (Step 7)**
- Ensure booking_id exists
- Check if payment was completed
- Verify booking is confirmed

### Debug Tips

1. **Check Console Output** - Each step logs detailed information
2. **Verify Environment Variables** - Ensure auto-stored values are present
3. **Run Steps in Order** - Don't skip steps as they depend on each other
4. **Check API Server Logs** - Look for server-side errors
5. **Validate Database State** - Ensure data exists at each step

## 📊 Expected Results

### Successful Workflow Completion

After running all 7 steps successfully, you should have:

1. ✅ **Authenticated User** - JWT token stored
2. ✅ **Selected Hotel** - Hotel chosen from search
3. ✅ **Available Room** - Room selected with pricing
4. ✅ **Created Booking** - Reservation made (pending)
5. ✅ **Payment Initiated** - Payment URL generated
6. ✅ **Payment Completed** - Transaction confirmed
7. ✅ **Booking Confirmed** - Final receipt with all details

### Final Receipt Example

```
🧾 BOOKING RECEIPT - CONFIRMATION
=====================================
🆔 Booking ID: 123
📊 Status: CONFIRMED

🏨 HOTEL DETAILS:
   Name: Sheraton Addis
   Address: Taitu Street, Addis Ababa
   City: Addis Ababa

🛏️ ROOM DETAILS:
   Type: Deluxe Room
   Price per night: ETB 2500

📅 STAY DETAILS:
   Check-in: 2025-10-01
   Check-out: 2025-10-03
   Nights: 2

👤 GUEST DETAILS:
   Name: Abebe Kebede
   Email: abebe.kebede@example.com
   Phone: +251911123456

💳 PAYMENT DETAILS:
   Total Amount: ETB 5000
   Payment Status: completed
   Transaction Ref: TXN_ABC123

🎉 BOOKING COMPLETED SUCCESSFULLY!
```

## 🔗 Related Collections

- **Eqabo-Hotel-Booking-API.postman_collection.json** - Complete API testing collection
- **Eqabo-Hotel-Booking-Environment.postman_environment.json** - General API environment

## 📞 Support

If you encounter issues:

1. **Check Prerequisites** - Server running, database seeded
2. **Verify Environment** - Correct environment selected
3. **Run in Sequence** - Don't skip steps
4. **Check Console** - Review detailed logs
5. **Validate Data** - Ensure test data exists

---

**🎉 Happy Booking! Enjoy the complete hotel booking workflow experience!**