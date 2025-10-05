"use strict";
/**
 * Phone validation utility for Ethiopian phone numbers
 * Supports formats: +251XXXXXXXXX, 251XXXXXXXXX, 09XXXXXXXX, 07XXXXXXXX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEthiopianPhone = validateEthiopianPhone;
exports.formatPhoneForDisplay = formatPhoneForDisplay;
exports.isNormalizedPhone = isNormalizedPhone;
exports.validateMultiplePhones = validateMultiplePhones;
/**
 * Validates and normalizes Ethiopian phone numbers
 * @param phone - The phone number to validate
 * @returns PhoneValidationResult with validation status and normalized phone
 */
function validateEthiopianPhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return {
            isValid: false,
            error: 'Phone number is required and must be a string'
        };
    }
    // Remove all spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Ethiopian phone number patterns
    const patterns = [
        // +251XXXXXXXXX (international format with +)
        /^\+251([79]\d{8})$/,
        // 251XXXXXXXXX (international format without +)
        /^251([79]\d{8})$/,
        // 09XXXXXXXX or 07XXXXXXXX (local format)
        /^0([79]\d{8})$/
    ];
    for (const pattern of patterns) {
        const match = cleanPhone.match(pattern);
        if (match) {
            // Extract the 9-digit number (without country code or leading 0)
            const localNumber = match[1];
            // Validate that it starts with 7 or 9 (Ethiopian mobile prefixes)
            if (localNumber.startsWith('7') || localNumber.startsWith('9')) {
                return {
                    isValid: true,
                    normalizedPhone: `+251${localNumber}`
                };
            }
        }
    }
    return {
        isValid: false,
        error: 'Invalid Ethiopian phone number format. Expected formats: +251XXXXXXXXX, 251XXXXXXXXX, or 0XXXXXXXXX'
    };
}
/**
 * Formats a phone number for display
 * @param phone - The normalized phone number (+251XXXXXXXXX)
 * @returns Formatted phone number for display
 */
function formatPhoneForDisplay(phone) {
    if (!phone.startsWith('+251')) {
        return phone;
    }
    const number = phone.substring(4); // Remove +251
    return `+251 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
}
/**
 * Checks if a phone number is already in normalized format
 * @param phone - The phone number to check
 * @returns boolean indicating if phone is normalized
 */
function isNormalizedPhone(phone) {
    return /^\+251[79]\d{8}$/.test(phone);
}
/**
 * Validates multiple phone numbers
 * @param phones - Array of phone numbers to validate
 * @returns Array of validation results
 */
function validateMultiplePhones(phones) {
    return phones.map(phone => validateEthiopianPhone(phone));
}
