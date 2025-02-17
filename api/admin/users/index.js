// pages/api/admin/users/index.js
export default async function handler(req, res) {
    await dbConnect();

    switch (req.method) {
        case 'GET':
            try {
                const users = await User.find({})
                    .select('telegramId first_name last_name username gameData lastLogin registeredAt blocked')
                    .sort({ 'gameData.passiveIncome': -1 }); // Сортировка по пассивному доходу

                // Подготовка статистики
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);

                const stats = {
                    total: users.length,
                    activeToday: users.filter(user => {
                        const lastLogin = new Date(user.lastLogin);
                        return lastLogin >= today;
                    }).length,
                    newThisWeek: users.filter(user => {
                        const registerDate = new Date(user.registeredAt);
                        return registerDate >= weekAgo;
                    }).length
                };

                res.status(200).json({
                    success: true,
                    data: {
                        users: users.map(user => ({
                            id: user.telegramId,
                            name: `${user.first_name} ${user.last_name || ''}`.trim(),
                            username: user.username,
                            level: user.gameData?.level?.current || 1,
                            passiveIncome: user.gameData?.passiveIncome || 0,
                            balance: user.gameData?.balance || 0,
                            lastLogin: user.lastLogin,
                            blocked: user.blocked || false
                        })),
                        stats
                    }
                });
            } catch (error) {
                console.error('Error getting users:', error);
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        default:
            res.status(405).json({ success: false, message: 'Method not allowed' });
            break;
    }
}