// pages/api/admin/users/index.js
export default async function handler(req, res) {
    await dbConnect();

    switch (req.method) {
        case 'GET':
            try {
                const users = await User.find({})
                    .select('telegramId first_name last_name username gameData lastLogin registeredAt blocked');

                const formattedUsers = users.map(user => ({
                    id: user.telegramId,
                    name: `${user.first_name} ${user.last_name || ''}`.trim(),
                    level: user.gameData?.level?.current || 1,
                    passiveIncome: user.gameData?.passiveIncome || 0,
                    balance: user.gameData?.balance || 0,
                    lastLogin: user.lastLogin,
                    registeredAt: user.registeredAt,
                    blocked: user.blocked || false
                }));

                res.status(200).json({
                    success: true,
                    data: {
                        users: formattedUsers
                    }
                });
            } catch (error) {
                console.error('Error getting users:', error);
                res.status(500).json({ success: false, error: error.message });
            }
            break;

        default:
            res.status(405).json({ success: false, message: 'Method not allowed' });
            break;
    }
}