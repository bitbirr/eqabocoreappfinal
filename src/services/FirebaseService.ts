import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

export interface FirebaseCustomClaims {
  role: string;
  userId: string;
}

export interface FCMNotificationPayload {
  type: string;
  booking_id?: string;
  status?: string;
  priority?: string;
  [key: string]: any;
}

export class FirebaseService {
  private app: admin.app.App | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initialize(): void {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        this.app = admin.apps[0];
        this.initialized = true;
        return;
      }

      // Get Firebase configuration from environment
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      // If credentials are not available, log warning but don't fail
      if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase credentials not configured. Firebase features will be disabled.');
        return;
      }

      const serviceAccount: ServiceAccount = {
        projectId,
        clientEmail,
        privateKey
      };

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId
      });

      this.initialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
    }
  }

  /**
   * Check if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a custom Firebase token with role claims
   */
  async createCustomToken(userId: string, role: string): Promise<string> {
    if (!this.initialized || !this.app) {
      throw new Error('Firebase is not initialized');
    }

    try {
      const customClaims: FirebaseCustomClaims = {
        role,
        userId
      };

      // Create custom token with 1-hour expiration (handled by Firebase)
      const token = await admin.auth().createCustomToken(userId, customClaims);
      return token;
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw new Error('Failed to create Firebase custom token');
    }
  }

  /**
   * Send high-priority FCM notification
   */
  async sendNotification(
    fcmToken: string,
    data: FCMNotificationPayload,
    title: string,
    body: string
  ): Promise<boolean> {
    if (!this.initialized || !this.app) {
      console.warn('Firebase is not initialized, skipping notification');
      return false;
    }

    try {
      const isCritical = data.type === 'booking_update' || 
                         data.type === 'payment_confirmation';

      const message: admin.messaging.Message = {
        token: fcmToken,
        data: {
          ...data,
          // Convert all values to strings as required by FCM
          ...Object.keys(data).reduce((acc, key) => {
            acc[key] = String(data[key]);
            return acc;
          }, {} as Record<string, string>)
        },
        notification: {
          title,
          body
        },
        android: {
          priority: isCritical ? 'high' : 'normal',
          notification: {
            channelId: isCritical ? 'eqabo_critical' : 'eqabo_default',
            priority: isCritical ? 'max' : 'default',
            sound: 'default'
          }
        },
        apns: {
          headers: {
            'apns-priority': isCritical ? '10' : '5'
          },
          payload: {
            aps: {
              alert: {
                title,
                body
              },
              sound: 'default',
              'interruption-level': isCritical ? 'time-sensitive' : 'active'
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent FCM notification:', response);
      return true;
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      return false;
    }
  }

  /**
   * Sync booking to Firestore
   */
  async syncBookingToFirestore(bookingId: string, bookingData: any): Promise<boolean> {
    if (!this.initialized || !this.app) {
      console.warn('Firebase is not initialized, skipping Firestore sync');
      return false;
    }

    try {
      const db = admin.firestore();
      const bookingRef = db.collection('bookings').doc(bookingId);
      
      await bookingRef.set({
        ...bookingData,
        synced_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log('Successfully synced booking to Firestore:', bookingId);
      return true;
    } catch (error) {
      console.error('Error syncing booking to Firestore:', error);
      return false;
    }
  }

  /**
   * Update booking status in Firestore
   */
  async updateBookingInFirestore(bookingId: string, updates: any): Promise<boolean> {
    if (!this.initialized || !this.app) {
      console.warn('Firebase is not initialized, skipping Firestore update');
      return false;
    }

    try {
      const db = admin.firestore();
      const bookingRef = db.collection('bookings').doc(bookingId);
      
      await bookingRef.update({
        ...updates,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Successfully updated booking in Firestore:', bookingId);
      return true;
    } catch (error) {
      console.error('Error updating booking in Firestore:', error);
      return false;
    }
  }
}
