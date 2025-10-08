import { AuthController } from '../src/controllers/AuthController';
import { AuthService } from '../src/services/AuthService';
import { UserRole } from '../src/models/User';
import { Request, Response } from 'express';

describe('FCM Token API', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    // Create mock AuthService
    mockAuthService = {
      updateFcmToken: jest.fn()
    } as any;

    // Create AuthController with mock service
    authController = new AuthController(mockAuthService);

    // Setup mock response
    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();
    
    mockResponse = {
      status: responseStatus,
      json: responseJson
    };

    // Setup base mock request
    mockRequest = {
      body: {},
      user: {
        id: 'test-user-id',
        phone: '+251927802065',
        role: UserRole.CUSTOMER
      }
    };
  });

  describe('updateFcmToken', () => {
    it('should accept fcmToken in camelCase format', async () => {
      mockRequest.body = { fcmToken: 'test-fcm-token-123' };
      mockAuthService.updateFcmToken.mockResolvedValue(true);

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).toHaveBeenCalledWith('test-user-id', 'test-fcm-token-123');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        message: 'FCM token updated successfully',
        data: {
          userId: 'test-user-id'
        }
      });
    });

    it('should accept fcm_token in snake_case format', async () => {
      mockRequest.body = { fcm_token: 'test-fcm-token-456' };
      mockAuthService.updateFcmToken.mockResolvedValue(true);

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).toHaveBeenCalledWith('test-user-id', 'test-fcm-token-456');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        message: 'FCM token updated successfully',
        data: {
          userId: 'test-user-id'
        }
      });
    });

    it('should prefer fcmToken over fcm_token when both are provided', async () => {
      mockRequest.body = { 
        fcmToken: 'camelCase-token',
        fcm_token: 'snake_case-token'
      };
      mockAuthService.updateFcmToken.mockResolvedValue(true);

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).toHaveBeenCalledWith('test-user-id', 'camelCase-token');
      expect(responseStatus).toHaveBeenCalledWith(200);
    });

    it('should return 400 error when neither fcmToken nor fcm_token is provided', async () => {
      mockRequest.body = { someOtherField: 'value' };

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        error: 'FCM token is required',
        message: 'Please provide either "fcmToken" or "fcm_token" field in the request body'
      });
    });

    it('should return 400 error when fcmToken is empty string', async () => {
      mockRequest.body = { fcmToken: '' };

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
    });

    it('should return 400 error when fcm_token is empty string', async () => {
      mockRequest.body = { fcm_token: '' };

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
    });

    it('should return 401 error when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.body = { fcmToken: 'test-token' };

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
    });

    it('should return 500 error when updateFcmToken fails', async () => {
      mockRequest.body = { fcmToken: 'test-token' };
      mockAuthService.updateFcmToken.mockResolvedValue(false);

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.updateFcmToken).toHaveBeenCalledWith('test-user-id', 'test-token');
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update FCM token'
      });
    });

    it('should handle service errors gracefully', async () => {
      mockRequest.body = { fcmToken: 'test-token' };
      mockAuthService.updateFcmToken.mockRejectedValue(new Error('Database error'));

      await authController.updateFcmToken(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update FCM token'
      });
    });
  });
});
