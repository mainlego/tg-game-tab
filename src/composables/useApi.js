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
            const response = await fetch(`${API_BASE_URL}/api/referrals/${userId}`);

            // Добавим логирование для отладки
            console.log('API Response:', response);

            if (!response.ok) {
                console.error('Error response:', await response.text());
                throw new Error('Failed to fetch referrals');
            }

            const data = await response.json();
            console.log('Referrals data:', data);

            return data;
        } catch (error) {
            console.error('Error fetching referrals:', error);
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