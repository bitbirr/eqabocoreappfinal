import axios from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentGateway,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationResponse
} from './IPaymentGateway';

/**
 * Kaafi Payment Gateway Integration
 * Ethiopian mobile payment solution
 */
export class KaafiGateway implements IPaymentGateway {
  private merchantCode: string;
  private apiKey: string;
  private secretKey: string;
  private apiUrl: string;
  private client: any;

  constructor() {
    this.merchantCode = process.env.KAAFI_MERCHANT_CODE || '';
    this.apiKey = process.env.KAAFI_API_KEY || '';
    this.secretKey = process.env.KAAFI_SECRET_KEY || '';
    this.apiUrl = process.env.KAAFI_API_URL || 'https://api.kaafi.com/v1';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (!this.merchantCode || !this.apiKey || !this.secretKey) {
      console.warn('⚠️  Kaafi credentials not configured. Set KAAFI_MERCHANT_CODE, KAAFI_API_KEY, and KAAFI_SECRET_KEY in environment variables.');
    }
  }

  getProviderName(): string {
    return 'kaafi';
  }

  /**
   * Generate signature for Kaafi request
   */
  private generateSignature(data: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }

  /**
   * Generate transaction reference
   */
  private generateReference(): string {
    return `KAAFI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (!this.merchantCode || !this.apiKey || !this.secretKey) {
      return {
        success: false,
        providerReference: '',
        message: 'Kaafi credentials not configured'
      };
    }

    try {
      const reference = this.generateReference();
      const timestamp = Date.now();

      const payload = {
        merchantCode: this.merchantCode,
        transactionRef: reference,
        amount: request.amount.toFixed(2),
        currency: request.currency || 'ETB',
        customerPhone: request.customerPhone,
        customerName: request.customerName,
        description: request.description || `Hotel booking #${request.bookingId}`,
        callbackUrl: request.callbackUrl,
        returnUrl: request.returnUrl || request.callbackUrl,
        metadata: {
          bookingId: request.bookingId,
          timestamp
        }
      };

      // Generate signature
      const signatureData = `${this.merchantCode}${reference}${payload.amount}${timestamp}`;
      const signature = this.generateSignature(signatureData);

      console.log('Initiating Kaafi payment:', { reference, amount: request.amount });

      const response = await this.client.post('/payments/initiate', {
        ...payload,
        signature
      });

      if (response.data.success === true || response.data.status === 'success') {
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
      console.error('Kaafi payment initiation error:', error.response?.data || error.message);
      return {
        success: false,
        providerReference: '',
        message: error.response?.data?.message || error.message || 'Payment initiation failed'
      };
    }
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResponse> {
    if (!this.merchantCode || !this.apiKey || !this.secretKey) {
      return {
        success: false,
        status: 'failed',
        message: 'Kaafi credentials not configured'
      };
    }

    try {
      const timestamp = Date.now();
      
      // Generate signature for verification
      const signatureData = `${this.merchantCode}${providerReference}${timestamp}`;
      const signature = this.generateSignature(signatureData);

      console.log('Verifying Kaafi payment:', providerReference);

      const response = await this.client.post('/payments/verify', {
        merchantCode: this.merchantCode,
        transactionRef: providerReference,
        timestamp,
        signature
      });

      if (response.data.success === true || response.data.status === 'success') {
        const data = response.data.data || response.data;
        
        // Map Kaafi status to our standard status
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
          transactionId: data.kaafiTransactionId || data.transactionId || providerReference,
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
      console.error('Kaafi payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'failed',
        message: error.response?.data?.message || error.message || 'Verification failed'
      };
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.secretKey) {
      return false;
    }

    try {
      // Kaafi signature format: merchantCode + transactionRef + amount + timestamp
      const signatureData = `${payload.merchantCode}${payload.transactionRef}${payload.amount}${payload.timestamp}`;
      const calculatedSignature = this.generateSignature(signatureData);
      
      return calculatedSignature === signature;
    } catch (error) {
      console.error('Kaafi webhook signature verification error:', error);
      return false;
    }
  }
}
