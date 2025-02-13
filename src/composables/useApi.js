// src/composables/useApi.js (создайте этот файл)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://v0-new-project-dqi1l3eck6k.vercel.app';

export const useApi = () => {
    const getReferrals = async (userId) => {
        try {
            console.log('Fetching referrals for user:', userId);
            const response = await fetch(`${API_BASE_URL}/api/referrals/${userId}`);
            console.log('Referrals response:', response);
            if (!response.ok) throw new Error('Failed to fetch referrals');
            return await response.json();
        } catch (error) {
            console.error('Error fetching referrals:', error);
            return [];
        }
    };

    const saveReferral = async (referralData) => {
        try {
            console.log('Saving referral:', referralData);
            const response = await fetch(`${API_BASE_URL}/api/referrals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(referralData)
            });
            console.log('Save referral response:', response);
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