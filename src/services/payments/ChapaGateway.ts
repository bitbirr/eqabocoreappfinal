import axios from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentGateway,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationResponse
} from './IPaymentGateway';

/**
 * Chapa Payment Gateway Integration
 * https://developer.chapa.co/docs
 */
export class ChapaGateway implements IPaymentGateway {
  private apiKey: string;
  private apiUrl: string;
  private client: any;

  constructor() {
    this.apiKey = process.env.CHAPA_SECRET_KEY || '';
    this.apiUrl = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (!this.apiKey) {
      console.warn('⚠️  Chapa API key not configured. Set CHAPA_SECRET_KEY in environment variables.');
    }
  }

  getProviderName(): string {
    return 'chappa';
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        providerReference: '',
        message: 'Chapa API key not configured'
      };
    }

    try {
      // Generate unique transaction reference
      const txRef = `CHAPA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
        amount: request.amount,
        currency: request.currency || 'ETB',
        email: request.customerEmail || `${request.customerPhone}@eqabo.com`,
        first_name: request.customerName.split(' ')[0] || 'Guest',
        last_name: request.customerName.split(' ').slice(1).join(' ') || 'User',
        phone_number: request.customerPhone,
        tx_ref: txRef,
        callback_url: request.callbackUrl,
        return_url: request.returnUrl || request.callbackUrl,
        customization: {
          title: 'Eqabo Hotel Booking',
          description: request.description || `Booking payment for ${request.bookingId}`
        },
        meta: {
          booking_id: request.bookingId
        }
      };

      console.log('Initiating Chapa payment:', { txRef, amount: request.amount });

      const response = await this.client.post('/transaction/initialize', payload);

      if (response.data.status === 'success') {
        return {
          success: true,
          paymentUrl: response.data.data.checkout_url,
          providerReference: txRef,
          message: 'Payment initiated successfully'
        };
      } else {
        return {
          success: false,
          providerReference: txRef,
          message: response.data.message || 'Failed to initialize payment'
        };
      }
    } catch (error: any) {
      console.error('Chapa payment initiation error:', error.response?.data || error.message);
      return {
        success: false,
        providerReference: '',
        message: error.response?.data?.message || error.message || 'Payment initiation failed'
      };
    }
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        status: 'failed',
        message: 'Chapa API key not configured'
      };
    }

    try {
      console.log('Verifying Chapa payment:', providerReference);

      const response = await this.client.get(`/transaction/verify/${providerReference}`);

      if (response.data.status === 'success') {
        const data = response.data.data;
        
        return {
          success: true,
          status: data.status === 'success' ? 'success' : data.status === 'pending' ? 'pending' : 'failed',
          amount: parseFloat(data.amount),
          transactionId: data.reference || providerReference,
          message: data.status,
          paidAt: data.created_at ? new Date(data.created_at) : undefined
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: response.data.message || 'Payment verification failed'
        };
      }
    } catch (error: any) {
      console.error('Chapa payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'failed',
        message: error.response?.data?.message || error.message || 'Verification failed'
      };
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Chapa uses HMAC SHA256 for webhook verification
      const hash = crypto
        .createHmac('sha256', this.apiKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Chapa webhook signature verification error:', error);
      return false;
    }
  }
}
