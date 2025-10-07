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

    it('should throw error when userId is empty', async () => {
      if (!firebaseService.isInitialized()) {
        // Skip if not initialized
        return;
      }
      await expect(
        firebaseService.createCustomToken('', 'customer')
      ).rejects.toThrow('Invalid userId');
    });

    it('should throw error when userId is null', async () => {
      if (!firebaseService.isInitialized()) {
        // Skip if not initialized
        return;
      }
      await expect(
        firebaseService.createCustomToken(null as any, 'customer')
      ).rejects.toThrow('Invalid userId');
    });

    it('should throw error when userId is whitespace', async () => {
      if (!firebaseService.isInitialized()) {
        // Skip if not initialized
        return;
      }
      await expect(
        firebaseService.createCustomToken('   ', 'customer')
      ).rejects.toThrow('Invalid userId');
    });

    it('should throw error when role is empty', async () => {
      if (!firebaseService.isInitialized()) {
        // Skip if not initialized
        return;
      }
      await expect(
        firebaseService.createCustomToken('test-user-id', '')
      ).rejects.toThrow('Invalid role');
    });

    it('should throw error when role is null', async () => {
      if (!firebaseService.isInitialized()) {
        // Skip if not initialized
        return;
      }
      await expect(
        firebaseService.createCustomToken('test-user-id', null as any)
      ).rejects.toThrow('Invalid role');
    });

    it('should throw error when role is whitespace', async () => {
      if (!firebaseService.isInitialized()) {
        // Skip if not initialized
        return;
      }
      await expect(
        firebaseService.createCustomToken('test-user-id', '   ')
      ).rejects.toThrow('Invalid role');
    });

    it('should return a non-empty string token when Firebase is initialized', async () => {
      if (firebaseService.isInitialized()) {
        const token = await firebaseService.createCustomToken('test-user-id', 'customer');
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
        expect(token.trim()).toBe(token); // No leading/trailing whitespace
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
