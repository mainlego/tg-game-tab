// pages/api/admin/users/[id].js
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export default async function handler(req, res) {
    const { id } = req.query
    await dbConnect()

    switch (req.method) {
        case 'GET':
            try {
                const user = await User.findOne({ telegramId: id })
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' })
                }
                res.status(200).json({ success: true, data: user })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
            break

        case 'PUT':
            try {
                const user = await User.findOneAndUpdate(
                    { telegramId: id },
                    req.body,
                    { new: true }
                )
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' })
                }
                res.status(200).json({ success: true, data: user })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
            break

        case 'DELETE':
            try {
                const user = await User.findOneAndDelete({ telegramId: id })
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' })
                }
                res.status(200).json({ success: true, data: {} })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
            break

        default:
            res.status(405).json({ success: false, message: 'Method not allowed' })
            break
    }
}

// pages/api/admin/users/index.js
export default async function handler(req, res) {
    await dbConnect()

    switch (req.method) {
        case 'GET':
            try {
                const { sort = 'passiveIncome', order = 'desc', page = 1, limit = 10 } = req.query
                const skip = (page - 1) * limit

                const users = await User.find({})
                    .sort({ [`gameData.${sort}`]: order === 'desc' ? -1 : 1 })
                    .skip(skip)
                    .limit(parseInt(limit))

                const total = await User.countDocuments()

                res.status(200).json({
                    success: true,
                    data: {
                        users,
                        pagination: {
                            total,
                            pages: Math.ceil(total / limit),
                            currentPage: page,
                            perPage: limit
                        }
                    }
                })
            } catch (error) {
                res.status(400).json({ success: false, error: error.message })
            }
            break

        default:
            res.status(405).json({ success: false, message: 'Method not allowed' })
            break
    }
}

// pages/api/admin/users/actions.js
export default async function handler(req, res) {
    await dbConnect()

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' })
    }

    const { action, userId } = req.body

    try {
        const user = await User.findOne({ telegramId: userId })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        switch (action) {
            case 'block':
                user.blocked = !user.blocked
                await user.save()
                break

            case 'reset':
                user.gameData = {
                    balance: 0,
                    passiveIncome: 0,
                    energy: {
                        current: 1000,
                        max: 1000,
                        regenRate: 1,
                        lastRegenTime: Date.now()
                    },
                    level: {
                        current: 1,
                        progress: 0,
                        title: 'Пацан'
                    },
                    multipliers: {
                        tapValue: 1,
                        tapMultiplier: 1,
                        incomeBoost: 1
                    },
                    investments: {
                        purchased: [],
                        activeIncome: 0,
                        lastCalculation: Date.now()
                    },
                    stats: {
                        totalClicks: 0,
                        totalEarned: 0,
                        maxPassiveIncome: 0
                    }
                }
                await user.save()
                break

            default:
                return res.status(400).json({ success: false, message: 'Invalid action' })
        }

        res.status(200).json({ success: true, data: user })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
}