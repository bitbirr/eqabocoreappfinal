const { dataSource } = require('../server');

/**
 * Scheduled job to expire unpaid bookings that are older than 15 minutes
 * Runs every minute to check for expired bookings
 */
class ExpirePendingBookingsJob {
  constructor(dataSourceParam = null) {
    this.intervalId = null;
    this.isRunning = false;
    this.dataSource = dataSourceParam || dataSource;
  }

  /**
   * Start the scheduled job
   */
  start(dataSourceParam = null) {
    if (this.intervalId) {
      console.log('⚠️  ExpirePendingBookingsJob is already running');
      return;
    }

    if (dataSourceParam) {
      this.dataSource = dataSourceParam;
    }

    console.log('🕐 Starting ExpirePendingBookingsJob - will run every minute');

    // Run immediately on start
    this.executeJob();

    // Then run every minute (60000 ms)
    this.intervalId = setInterval(() => {
      this.executeJob();
    }, 60000);
  }

  /**
   * Stop the scheduled job
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 ExpirePendingBookingsJob stopped');
    }
  }

  /**
   * Execute the job to expire pending bookings
   */
  async executeJob() {
    // Prevent concurrent executions
    if (this.isRunning) {
      console.log('⏳ ExpirePendingBookingsJob is already running, skipping this execution');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();

    try {
      console.log(`🔄 [${startTime.toISOString()}] Executing ExpirePendingBookingsJob...`);

      // Check if database is connected
      if (!this.dataSource || !this.dataSource.isInitialized) {
        throw new Error('Database connection is not initialized');
      }

      // Execute the SQL query to expire pending bookings older than 15 minutes
      const result = await this.dataSource.query(`
        UPDATE bookings
        SET status = 'expired'
        WHERE status = 'pending_payment'
        AND created_at < NOW() - INTERVAL '15 minutes'
      `);

      // Get the count of affected rows
      const affectedRows = result[1] || 0;
      
      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();

      if (affectedRows > 0) {
        console.log(`✅ [${endTime.toISOString()}] ExpirePendingBookingsJob completed: ${affectedRows} booking(s) expired (${executionTime}ms)`);
      } else {
        console.log(`✅ [${endTime.toISOString()}] ExpirePendingBookingsJob completed: No bookings to expire (${executionTime}ms)`);
      }

      return {
        success: true,
        affectedRows,
        executionTime,
        timestamp: endTime
      };

    } catch (error) {
      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();
      
      console.error(`❌ [${endTime.toISOString()}] ExpirePendingBookingsJob failed after ${executionTime}ms:`, error.message);
      
      // Log additional error details for debugging
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }

      return {
        success: false,
        error: error.message,
        executionTime,
        timestamp: endTime
      };

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get the current status of the job
   */
  getStatus() {
    return {
      isActive: !!this.intervalId,
      isRunning: this.isRunning,
      startedAt: this.intervalId ? new Date() : null
    };
  }
}

// Create a singleton instance
const expirePendingBookingsJob = new ExpirePendingBookingsJob();

module.exports = {
  ExpirePendingBookingsJob,
  expirePendingBookingsJob
};