import axios from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentGateway,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationResponse
} from './IPaymentGateway';

/**
 * CBE Birr (eBirr) Payment Gateway Integration
 * Commercial Bank of Ethiopia's mobile money service
 */
export class EBirrGateway implements IPaymentGateway {
  private merchantId: string;
  private apiKey: string;
  private apiUrl: string;
  private client: any;

  constructor() {
    this.merchantId = process.env.EBIRR_MERCHANT_ID || '';
    this.apiKey = process.env.EBIRR_API_KEY || '';
    this.apiUrl = process.env.EBIRR_API_URL || 'https://api.cbe.com.et/ebirr';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Merchant-ID': this.merchantId
      },
      timeout: 30000
    });

    if (!this.merchantId || !this.apiKey) {
      console.warn('⚠️  eBirr credentials not configured. Set EBIRR_MERCHANT_ID and EBIRR_API_KEY in environment variables.');
    }
  }

  getProviderName(): string {
    return 'ebirr';
  }

  /**
   * Generate transaction reference
   */
  private generateReference(): string {
    return `EBIRR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (!this.merchantId || !this.apiKey) {
      return {
        success: false,
        providerReference: '',
        message: 'eBirr credentials not configured'
      };
    }

    try {
      const reference = this.generateReference();

      const payload = {
        merchantId: this.merchantId,
        transactionReference: reference,
        amount: request.amount,
        currency: request.currency || 'ETB',
        customerPhone: request.customerPhone.replace(/^\+251/, '0'), // Convert to local format
        customerName: request.customerName,
        description: request.description || `Hotel booking payment for ${request.bookingId}`,
        callbackUrl: request.callbackUrl,
        metadata: {
          bookingId: request.bookingId
        },
        expiryMinutes: 30
      };

      console.log('Initiating eBirr payment:', { reference, amount: request.amount });

      const response = await this.client.post('/v1/payment/initiate', payload);

      if (response.data.status === 'success' || response.data.statusCode === 200) {
        return {
          success: true,
          paymentUrl: response.data.data?.paymentUrl || response.data.paymentUrl,
          providerReference: reference,
          message: 'Payment initiated successfully',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        };
      } else {
        return {
          success: false,
          providerReference: reference,
          message: response.data.message || 'Failed to initialize payment'
        };
      }
    } catch (error: any) {
      console.error('eBirr payment initiation error:', error.response?.data || error.message);
      return {
        success: false,
        providerReference: '',
        message: error.response?.data?.message || error.message || 'Payment initiation failed'
      };
    }
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResponse> {
    if (!this.merchantId || !this.apiKey) {
      return {
        success: false,
        status: 'failed',
        message: 'eBirr credentials not configured'
      };
    }

    try {
      console.log('Verifying eBirr payment:', providerReference);

      const response = await this.client.get(`/v1/payment/status/${providerReference}`);

      if (response.data.status === 'success' || response.data.statusCode === 200) {
        const data = response.data.data || response.data;
        
        // Map eBirr status to our standard status
        let status: 'success' | 'pending' | 'failed' = 'pending';
        const paymentStatus = data.paymentStatus || data.status;
        
        if (paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
          status = 'success';
        } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') {
          status = 'failed';
        }

        return {
          success: true,
          status,
          amount: parseFloat(data.amount),
          transactionId: data.transactionId || data.ebirrReference || providerReference,
          message: paymentStatus,
          paidAt: data.completedAt ? new Date(data.completedAt) : undefined
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: response.data.message || 'Payment verification failed'
        };
      }
    } catch (error: any) {
      console.error('eBirr payment verification error:', error.response?.data || error.message);
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
      // eBirr uses HMAC SHA256 for webhook verification
      const hash = crypto
        .createHmac('sha256', this.apiKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('eBirr webhook signature verification error:', error);
      return false;
    }
  }
}
