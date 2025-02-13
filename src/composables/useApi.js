// src/composables/useApi.js (создайте этот файл)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://v0-new-project-dqi1l3eck6k.vercel.app';

export const useApi = () => {

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
    };

    // src/composables/useApi.js
    const getReferrals = async (userId) => {
        try {
            console.log('DEBUG: Making API call to:', `${API_BASE_URL}/api/referrals/${userId}`);

            const response = await fetch(`${API_BASE_URL}/api/referrals/${userId}`);
            console.log('DEBUG: API Response status:', response.status);

            const responseText = await response.text();
            console.log('DEBUG: Raw response:', responseText);

            // Пробуем распарсить JSON только если есть данные
            const data = responseText ? JSON.parse(responseText) : [];
            console.log('DEBUG: Parsed referrals data:', data);

            return data;
        } catch (error) {
            console.error('DEBUG: Error in getReferrals:', error);
            return [];
        }
    };





    const saveReferral = async (referralData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/referrals`, {
                method: 'POST',
                headers,
                body: JSON.stringify(referralData)
            });
            if (!response.ok) throw new Error('Failed to save referral');
            return await response.json();
        } catch (error) {
            console.error('Error saving referral:', error);
            return null;
        }
    };

    return {
        getReferrals,
        saveReferral
    };
};