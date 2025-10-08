/**
 * Payment Gateway Interface
 * Defines the contract for payment gateway integrations
 */

export interface PaymentInitiationRequest {
  amount: number;
  currency: string;
  bookingId: string;
  customerEmail?: string;
  customerPhone: string;
  customerName: string;
  callbackUrl: string;
  returnUrl?: string;
  description?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  paymentUrl?: string;
  providerReference: string;
  message?: string;
  expiresAt?: Date;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: 'success' | 'pending' | 'failed';
  amount?: number;
  transactionId?: string;
  message?: string;
  paidAt?: Date;
}

export interface IPaymentGateway {
  /**
   * Initialize a payment with the gateway
   */
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;

  /**
   * Verify payment status with the gateway
   */
  verifyPayment(providerReference: string): Promise<PaymentVerificationResponse>;

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature?(payload: any, signature: string): boolean;

  /**
   * Get provider name
   */
  getProviderName(): string;
}
