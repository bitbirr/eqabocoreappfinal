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
        console.log('Firebase Admin SDK already initialized');
        return;
      }

      // Get Firebase configuration from environment
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      // If credentials are not available, log detailed warning but don't fail
      if (!projectId || !clientEmail || !privateKey) {
        console.warn('⚠️  Firebase credentials not configured. Firebase features will be disabled.');
        console.warn('Missing Firebase environment variables:');
        if (!projectId) console.warn('  - FIREBASE_PROJECT_ID');
        if (!clientEmail) console.warn('  - FIREBASE_CLIENT_EMAIL');
        if (!privateKey) console.warn('  - FIREBASE_PRIVATE_KEY');
        console.warn('To enable Firebase features:');
        console.warn('  1. Go to Firebase Console > Project Settings > Service Accounts');
        console.warn('  2. Generate a new private key');
        console.warn('  3. Set the environment variables in your .env file');
        console.warn('  4. Restart the server');
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
      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log(`   Project ID: ${projectId}`);
      console.log(`   Client Email: ${clientEmail.substring(0, 30)}...`);
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin SDK:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
      }
      console.error('Please verify:');
      console.error('  - Your Firebase service account credentials are correct');
      console.error('  - The private key format includes proper line breaks (\\n)');
      console.error('  - Your Firebase project exists and is active');
      console.error('  - Network connectivity to https://firebase.googleapis.com');
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
      console.error('Cannot create custom token: Firebase is not initialized');
      throw new Error('Firebase is not initialized');
    }

    // Validate input parameters
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('Cannot create custom token: Invalid userId', { userId });
      throw new Error('Invalid userId: must be a non-empty string');
    }

    if (!role || typeof role !== 'string' || role.trim() === '') {
      console.error('Cannot create custom token: Invalid role', { role });
      throw new Error('Invalid role: must be a non-empty string');
    }

    try {
      const customClaims: FirebaseCustomClaims = {
        role,
        userId
      };

      console.log('Creating Firebase custom token', { userId, role });

      // Create custom token with 1-hour expiration (handled by Firebase)
      const token = await admin.auth().createCustomToken(userId, customClaims);

      // Validate the generated token
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('Firebase Admin SDK returned invalid token', {
          userId,
          tokenType: typeof token,
          tokenValue: token
        });
        throw new Error('Firebase Admin SDK returned an invalid token');
      }

      console.log('Firebase custom token created successfully', {
        userId,
        tokenLength: token.length
      });

      return token;
    } catch (error) {
      console.error('Error creating custom token:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Token creation error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }

      // Re-throw the error with more context
      if (error instanceof Error && error.message.includes('Firebase')) {
        throw error;
      }
      
      throw new Error(`Failed to create Firebase custom token: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            sound: 'default',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          headers: {
            'apns-priority': isCritical ? '10' : '5',
            'apns-push-type': 'alert'
          },
          payload: {
            aps: {
              alert: {
                title,
                body
              },
              sound: 'default',
              badge: 1,
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
