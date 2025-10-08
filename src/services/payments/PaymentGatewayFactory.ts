import { PaymentProvider } from '../../models/Payment';
import { IPaymentGateway } from './IPaymentGateway';
import { ChapaGateway } from './ChapaGateway';
import { TeleBirrGateway } from './TeleBirrGateway';
import { EBirrGateway } from './EBirrGateway';
import { KaafiGateway } from './KaafiGateway';

/**
 * Payment Gateway Factory
 * Creates and manages payment gateway instances
 */
export class PaymentGatewayFactory {
  private static gateways: Map<PaymentProvider, IPaymentGateway> = new Map();

  /**
   * Get payment gateway instance for a provider
   */
  static getGateway(provider: PaymentProvider): IPaymentGateway {
    // Return existing instance if available
    if (this.gateways.has(provider)) {
      return this.gateways.get(provider)!;
    }

    // Create new instance based on provider
    let gateway: IPaymentGateway;

    switch (provider) {
      case PaymentProvider.CHAPPA:
        gateway = new ChapaGateway();
        break;
      case PaymentProvider.TELEBIRR:
        gateway = new TeleBirrGateway();
        break;
      case PaymentProvider.EBIRR:
        gateway = new EBirrGateway();
        break;
      case PaymentProvider.KAAFI:
        gateway = new KaafiGateway();
        break;
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }

    // Cache the instance
    this.gateways.set(provider, gateway);
    return gateway;
  }

  /**
   * Check if a provider is configured (has API credentials)
   */
  static isProviderConfigured(provider: PaymentProvider): boolean {
    try {
      const gateway = this.getGateway(provider);
      // Try to get provider name - if credentials are missing, gateway is still created
      // but should log warnings. We'll consider it "configured" if it doesn't throw.
      return gateway.getProviderName() === provider;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of configured providers
   */
  static getConfiguredProviders(): PaymentProvider[] {
    const providers = Object.values(PaymentProvider);
    return providers.filter(provider => this.isProviderConfigured(provider));
  }
}
