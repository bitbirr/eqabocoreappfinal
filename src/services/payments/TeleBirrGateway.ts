import axios from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentGateway,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentVerificationResponse
} from './IPaymentGateway';

/**
 * TeleBirr Payment Gateway Integration
 * https://developer.ethiotelecom.et/telebirr
 */
export class TeleBirrGateway implements IPaymentGateway {
  private appId: string;
  private appKey: string;
  private publicKey: string;
  private apiUrl: string;
  private client: any;

  constructor() {
    this.appId = process.env.TELEBIRR_APP_ID || '';
    this.appKey = process.env.TELEBIRR_APP_KEY || '';
    this.publicKey = process.env.TELEBIRR_PUBLIC_KEY || '';
    this.apiUrl = process.env.TELEBIRR_API_URL || 'https://app.ethiotelecom.et:9443/ammapi';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (!this.appId || !this.appKey) {
      console.warn('⚠️  TeleBirr credentials not configured. Set TELEBIRR_APP_ID and TELEBIRR_APP_KEY in environment variables.');
    }
  }

  getProviderName(): string {
    return 'telebirr';
  }

  /**
   * Generate signature for TeleBirr request
   */
  private generateSignature(data: any): string {
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&') + this.appKey;
    return crypto.createHash('sha256').update(signString).digest('hex').toUpperCase();
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    if (!this.appId || !this.appKey) {
      return {
        success: false,
        providerReference: '',
        message: 'TeleBirr credentials not configured'
      };
    }

    try {
      // Generate unique order ID
      const outTradeNo = `TELEBIRR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const requestData = {
        appid: this.appId,
        body: request.description || 'Hotel Booking Payment',
        nonce_str: crypto.randomBytes(16).toString('hex'),
        notify_url: request.callbackUrl,
        out_trade_no: outTradeNo,
        subject: 'Eqabo Hotel Booking',
        time_expire: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        timestamp,
        total_amount: request.amount.toFixed(2),
        trade_type: 'InApp'
      };

      // Generate signature
      const sign = this.generateSignature(requestData);

      const payload = {
        ...requestData,
        sign
      };

      console.log('Initiating TeleBirr payment:', { outTradeNo, amount: request.amount });

      const response = await this.client.post('/payment/v1/merchant/preOrder', payload);

      if (response.data.code === 0 || response.data.msg === 'success') {
        return {
          success: true,
          paymentUrl: response.data.data?.toPayUrl || response.data.data?.prepay_id,
          providerReference: outTradeNo,
          message: 'Payment initiated successfully',
          expiresAt: new Date(requestData.time_expire)
        };
      } else {
        return {
          success: false,
          providerReference: outTradeNo,
          message: response.data.msg || 'Failed to initialize payment'
        };
      }
    } catch (error: any) {
      console.error('TeleBirr payment initiation error:', error.response?.data || error.message);
      return {
        success: false,
        providerReference: '',
        message: error.response?.data?.msg || error.message || 'Payment initiation failed'
      };
    }
  }

  async verifyPayment(providerReference: string): Promise<PaymentVerificationResponse> {
    if (!this.appId || !this.appKey) {
      return {
        success: false,
        status: 'failed',
        message: 'TeleBirr credentials not configured'
      };
    }

    try {
      const timestamp = new Date().toISOString();
      const requestData = {
        appid: this.appId,
        nonce_str: crypto.randomBytes(16).toString('hex'),
        out_trade_no: providerReference,
        timestamp
      };

      // Generate signature
      const sign = this.generateSignature(requestData);

      const payload = {
        ...requestData,
        sign
      };

      console.log('Verifying TeleBirr payment:', providerReference);

      const response = await this.client.post('/payment/v1/merchant/query', payload);

      if (response.data.code === 0 || response.data.msg === 'success') {
        const data = response.data.data;
        
        // Map TeleBirr status to our standard status
        let status: 'success' | 'pending' | 'failed' = 'pending';
        if (data.trade_status === 'TRADE_SUCCESS' || data.trade_status === 'SUCCESS') {
          status = 'success';
        } else if (data.trade_status === 'TRADE_FAILED' || data.trade_status === 'CLOSED') {
          status = 'failed';
        }

        return {
          success: true,
          status,
          amount: parseFloat(data.total_amount),
          transactionId: data.transaction_no || providerReference,
          message: data.trade_status,
          paidAt: data.time_end ? new Date(data.time_end) : undefined
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: response.data.msg || 'Payment verification failed'
        };
      }
    } catch (error: any) {
      console.error('TeleBirr payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'failed',
        message: error.response?.data?.msg || error.message || 'Verification failed'
      };
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.appKey) {
      return false;
    }

    try {
      const calculatedSign = this.generateSignature(payload);
      return calculatedSign === signature;
    } catch (error) {
      console.error('TeleBirr webhook signature verification error:', error);
      return false;
    }
  }
}
