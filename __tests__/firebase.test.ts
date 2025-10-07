import { FirebaseService } from '../src/services/FirebaseService';

describe('FirebaseService', () => {
  let firebaseService: FirebaseService;

  beforeAll(() => {
    firebaseService = new FirebaseService();
  });

  describe('initialization', () => {
    it('should initialize without crashing', () => {
      expect(firebaseService).toBeDefined();
    });

    it('should report initialization status', () => {
      // If Firebase is not configured, it should gracefully handle it
      const isInitialized = firebaseService.isInitialized();
      expect(typeof isInitialized).toBe('boolean');
    });
  });

  describe('createCustomToken', () => {
    it('should throw error when Firebase is not initialized', async () => {
      if (!firebaseService.isInitialized()) {
        await expect(
          firebaseService.createCustomToken('test-user-id', 'customer')
        ).rejects.toThrow('Firebase is not initialized');
      }
    });
  });

  describe('sendNotification', () => {
    it('should return false when Firebase is not initialized', async () => {
      if (!firebaseService.isInitialized()) {
        const result = await firebaseService.sendNotification(
          'test-token',
          { type: 'booking_update', booking_id: 'test', priority: 'high' },
          'Test Title',
          'Test Body'
        );
        expect(result).toBe(false);
      }
    });
  });

  describe('syncBookingToFirestore', () => {
    it('should return false when Firebase is not initialized', async () => {
      if (!firebaseService.isInitialized()) {
        const result = await firebaseService.syncBookingToFirestore(
          'test-booking-id',
          { test: 'data' }
        );
        expect(result).toBe(false);
      }
    });
  });

  describe('updateBookingInFirestore', () => {
    it('should return false when Firebase is not initialized', async () => {
      if (!firebaseService.isInitialized()) {
        const result = await firebaseService.updateBookingInFirestore(
          'test-booking-id',
          { status: 'confirmed' }
        );
        expect(result).toBe(false);
      }
    });
  });
});
