# Payment Gateway Integration Guide

## Overview

The Eqabo backend now includes complete payment gateway integrations for Ethiopian payment providers:
- **Chapa** - Leading Ethiopian payment gateway
- **TeleBirr** - Ethio Telecom's mobile money service
- **eBirr (CBE Birr)** - Commercial Bank of Ethiopia's mobile payment
- **Kaafi** - Ethiopian mobile payment solution

## Architecture

### Gateway Interface (`IPaymentGateway`)

All payment gateways implement a common interface with three main operations:

1. **initiatePayment()** - Start a payment transaction
2. **verifyPayment()** - Check payment status with the gateway
3. **verifyWebhookSignature()** - Validate webhook callbacks (optional)

### Gateway Factory Pattern

The `PaymentGatewayFactory` manages gateway instances and provides:
- Lazy initialization of gateway clients
- Singleton instances per provider
- Configuration validation checks

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Base URL for callbacks
API_BASE_URL=http://localhost:3000

# Chapa Configuration
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_API_URL=https://api.chapa.co/v1

# TeleBirr Configuration
TELEBIRR_APP_ID=your-telebirr-app-id
TELEBIRR_APP_KEY=your-telebirr-app-key
TELEBIRR_PUBLIC_KEY=your-telebirr-public-key
TELEBIRR_API_URL=https://app.ethiotelecom.et:9443/ammapi

# eBirr Configuration
EBIRR_MERCHANT_ID=your-ebirr-merchant-id
EBIRR_API_KEY=your-ebirr-api-key
EBIRR_API_URL=https://api.cbe.com.et/ebirr

# Kaafi Configuration
KAAFI_MERCHANT_CODE=your-kaafi-merchant-code
KAAFI_API_KEY=your-kaafi-api-key
KAAFI_SECRET_KEY=your-kaafi-secret-key
KAAFI_API_URL=https://api.kaafi.com/v1
```

### Getting API Credentials

#### Chapa
1. Visit https://dashboard.chapa.co
2. Sign up for a merchant account
3. Navigate to Settings > API Keys
4. Copy your secret key

#### TeleBirr
1. Contact Ethio Telecom Business Support
2. Request merchant registration
3. Receive APP_ID, APP_KEY, and PUBLIC_KEY

#### eBirr (CBE Birr)
1. Visit your nearest Commercial Bank of Ethiopia branch
2. Request eBirr merchant account
3. Complete KYC and merchant agreement
4. Receive merchant credentials

#### Kaafi
1. Visit https://kaafi.com or contact support
2. Complete merchant onboarding
3. Receive API credentials

## API Endpoints

### 1. Initiate Payment

**Endpoint**: `POST /api/payments/initiate`

**Description**: Starts a payment transaction with the selected provider.

**Request**:
```json
{
  "bookingId": "uuid-here",
  "provider": "chappa|telebirr|ebirr|kaafi"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "booking_id": "booking-uuid",
      "amount": 5000.00,
      "provider": "chappa",
      "provider_reference": "CHAPA_1234567890_abc123",
      "status": "pending",
      "created_at": "2025-01-15T10:30:00Z"
    },
    "booking": {
      "id": "booking-uuid",
      "user": {
        "name": "John Doe",
        "phone": "+251911234567"
      },
      "hotel": "Grand Hotel",
      "room": "101",
      "total_amount": 5000.00
    },
    "payment_instructions": {
      "provider": "chappa",
      "reference": "CHAPA_1234567890_abc123",
      "amount": 5000.00,
      "callback_url": "https://api.eqabo.com/api/payments/callback",
      "payment_url": "https://checkout.chapa.co/pay/TX_1234567890",
      "expires_at": "2025-01-15T11:00:00Z"
    }
  }
}
```

### 2. Payment Callback (Webhook)

**Endpoint**: `POST /api/payments/callback`

**Description**: Receives payment status updates from providers.

**Request** (from provider):
```json
{
  "provider_reference": "CHAPA_1234567890_abc123",
  "status": "success|failed",
  "transaction_id": "TXN_987654321",
  "amount": 5000.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment processed successfully. Booking confirmed.",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "status": "success",
      "amount": 5000.00,
      "provider": "chappa",
      "transaction_id": "TXN_987654321"
    },
    "booking": {
      "id": "booking-uuid",
      "status": "confirmed",
      "confirmation_number": "ABC12345"
    }
  }
}
```

### 3. Verify Payment

**Endpoint**: `GET /api/payments/:id/verify`

**Description**: Manually verify payment status with the gateway.

**Response**:
```json
{
  "success": true,
  "message": "Payment verification completed",
  "data": {
    "payment": {
      "id": "payment-uuid",
      "amount": 5000.00,
      "provider": "chappa",
      "provider_reference": "CHAPA_1234567890_abc123",
      "status": "success",
      "transaction_id": "TXN_987654321"
    },
    "verification": {
      "gateway_status": "success",
      "gateway_message": "Payment completed",
      "verified_amount": 5000.00,
      "paid_at": "2025-01-15T10:35:00Z"
    },
    "booking": {
      "id": "booking-uuid",
      "status": "confirmed"
    }
  }
}
```

### 4. Get Payment Status

**Endpoint**: `GET /api/payments/:id`

**Description**: Get detailed payment information.

## Payment Flow

### Standard Flow

1. **User selects hotel and room** → Creates booking (status: pending)
2. **User initiates payment** → Calls `POST /api/payments/initiate`
3. **Backend creates payment record** → Returns payment URL
4. **User completes payment** → Redirected to provider's checkout
5. **Provider processes payment** → Sends callback to `/api/payments/callback`
6. **Backend updates status** → Booking confirmed, room locked
7. **User receives notification** → Via FCM and Firestore

### Verification Flow

1. **Payment status uncertain** → Admin/user calls `GET /api/payments/:id/verify`
2. **Backend queries gateway** → Gets current payment status
3. **Status synced** → Database and Firestore updated
4. **Response returned** → Current payment state

## Security Features

### Webhook Signature Verification

Each gateway implements signature verification to ensure callbacks are authentic:

- **Chapa**: HMAC SHA256 with secret key
- **TeleBirr**: Custom signature algorithm with app key
- **eBirr**: HMAC SHA256 with API key
- **Kaafi**: HMAC SHA256 with secret key

The `verifyWebhookSignature()` method validates incoming webhook requests.

### Best Practices

1. **Always use HTTPS** in production
2. **Store credentials securely** - Never commit to source control
3. **Validate amounts** - Check payment amount matches booking amount
4. **Log all transactions** - Use PaymentLog for audit trail
5. **Handle timeouts** - Set appropriate timeout values (30s default)
6. **Retry failed requests** - Implement exponential backoff

## Error Handling

### Common Errors

| Error | Description | Action |
|-------|-------------|--------|
| Credentials not configured | API keys missing | Add to .env file |
| Payment initiation failed | Gateway API error | Check logs, retry |
| Verification failed | Gateway unreachable | Retry later |
| Amount mismatch | Callback amount ≠ expected | Log and investigate |
| Invalid signature | Webhook signature invalid | Reject request |

### Error Response Format

```json
{
  "success": false,
  "message": "Detailed error message",
  "error": "ERROR_CODE"
}
```

## Testing

### Test Mode

Most providers offer sandbox/test environments:

- **Chapa**: Use test secret keys from dashboard
- **TeleBirr**: Request test credentials from support
- **eBirr**: Contact CBE for test environment
- **Kaafi**: Use sandbox API URL

### Mock Testing

Without provider credentials, gateways will:
1. Log a warning on initialization
2. Return error responses for operations
3. Allow the app to run (graceful degradation)

## Integration with Firebase

Payment status updates trigger:

1. **Firestore Sync** - Booking status updated in real-time
2. **FCM Notifications** - High-priority push to user's device
3. **Audit Logs** - All changes logged to payment_logs table

## Monitoring

### Log Messages

Payment operations log detailed information:

```
Initiating Chapa payment: { txRef: 'CHAPA_...', amount: 5000 }
Successfully sent FCM notification: messageId
Chapa payment verification error: { message: '...' }
```

### Key Metrics to Monitor

- Payment initiation success rate
- Callback processing time
- Verification failure rate
- Gateway API response times
- Webhook signature failures

## Troubleshooting

### Payment not updating after callback

1. Check webhook URL is accessible from internet
2. Verify signature validation is working
3. Check payment_logs for callback attempts
4. Manually verify with `GET /api/payments/:id/verify`

### Gateway returns errors

1. Verify credentials in .env file
2. Check API URL is correct
3. Ensure sufficient balance/credit
4. Review gateway API documentation

### Firestore not syncing

1. Check Firebase credentials configured
2. Verify Firestore rules allow writes
3. Check Firebase service logs

## Provider-Specific Notes

### Chapa
- Supports card payments and mobile money
- Webhook includes detailed transaction info
- Test mode available with test keys

### TeleBirr
- Mobile-only payment method
- Requires user to have TeleBirr wallet
- Complex signature algorithm

### eBirr
- Linked to CBE bank accounts
- Requires merchant agreement with CBE
- Phone number format: 0911234567 (local)

### Kaafi
- New player in Ethiopian fintech
- Competitive transaction fees
- Modern API design

## Next Steps

1. **Get Credentials** - Sign up with payment providers
2. **Configure Environment** - Add credentials to .env
3. **Test Integration** - Use sandbox/test mode
4. **Monitor Transactions** - Track success rates
5. **Go Live** - Switch to production credentials

## Support

For issues with:
- **Chapa**: support@chapa.co
- **TeleBirr**: Ethio Telecom business support
- **eBirr**: Your CBE branch manager
- **Kaafi**: support@kaafi.com
- **Eqabo Backend**: Check GitHub issues

## API Documentation

Full API documentation available at: `/api/docs` (Swagger UI)
