export const investmentsData = {
    "finances": {
        "title": "Финансы",
        "type": "linear",
        "items": [
            { "id": "money_loan", "name": "Деньги в долг", "image": "../assets/images/growth/1.png", "cost": 1000, "baseIncome": 1500, "level": 1, "multiplier": 1.3, "required_level": 1 },
            { "id": "bank_deposit", "name": "Банковский вклад", "image": "../assets/images/growth/2.png", "cost": 5000, "baseIncome": 5000, "level": 1, "multiplier": 1.3, "required_level": 1 },
            { "id": "russian_stocks", "name": "Акции российских компаний", "image": "../assets/images/growth/3.png", "cost": 10000, "baseIncome": 10000, "level": 1, "multiplier": 1.3, "required_level": 2 },
            { "id": "international_stocks", "name": "Акции международных компаний", "image": "../assets/images/growth/4.png", "cost": 50000, "baseIncome": 40000, "level": 1, "multiplier": 1.3, "required_level": 2 },
            { "id": "ipo", "name": "IPO", "image": "../assets/images/growth/5.png", "cost": 100000, "baseIncome": 70000, "level": 1, "multiplier": 1.3, "required_level": 3 },
            { "id": "bonds", "name": "Облигации", "image": "../assets/images/growth/6.png", "cost": 200000, "baseIncome": 120000, "level": 1, "multiplier": 1.3, "required_level": 3 },
            { "id": "mutual_funds", "name": "Паевые фонды", "image": "../assets/images/growth/7.png", "cost": 500000, "baseIncome": 200000, "level": 1, "multiplier": 1.3, "required_level": 4 },
            { "id": "trust_management", "name": "Доверительное управление", "image": "../assets/images/growth/8.png", "cost": 1000000, "baseIncome": 500000, "level": 1, "multiplier": 1.3, "required_level": 4 },
            { "id": "stock_fund", "name": "Биржевой фонд", "image": "../assets/images/growth/9.png", "cost": 2000000, "baseIncome": 900000, "level": 1, "multiplier": 1.3, "required_level": 5 },
            { "id": "swiss_deposit", "name": "Швейцарский вклад", "image": "../assets/images/growth/10.png", "cost": 5000000, "baseIncome": 2000000, "level": 1, "multiplier": 1.3, "required_level": 5 }
        ]
    },
    "technology": {
        "title": "Технологии",
        "type": "parabolic",
        "items": [
            { "id": "blog", "name": "Блог", "image": "../assets/images/growth/11.png", "cost": 1200, "baseIncome": 2000, "level": 1, "multiplier": 1.5, "bonus_percent": 0.01, "required_level": 1 },
            { "id": "telegram_channel", "name": "Телеграм канал", "image": "../assets/images/growth/12.png", "cost": 5000, "baseIncome": 5000, "level": 1, "multiplier": 1.5, "bonus_percent": 0.01, "required_level": 1 },
            { "id": "youtube_channel", "name": "YouTube канал", "image": "../assets/images/growth/13.png", "cost": 10000, "baseIncome": 12000, "level": 1, "multiplier": 1.5, "bonus_percent": 0.01, "required_level": 2 },
            { "id": "online_course", "name": "Онлайн курс", "image": "../assets/images/growth/14.png", "cost": 50000, "baseIncome": 60000, "level": 1, "multiplier": 1.5, "bonus_percent": 0.02, "required_level": 2 },
            { "id": "advertising_sites", "name": "Рекламные места", "image": "../assets/images/growth/15.png", "cost": 200000, "baseIncome": 200000, "level": 1, "multiplier": 1.5, "bonus_percent": 0.02, "required_level": 3 }
        ]
    },
    "business": {
        "title": "Бизнес",
        "type": "exponential",
        "items": [
            { "id": "vending_machine", "name": "Вендинговый аппарат", "image": "../assets/images/growth/20.png", "cost": 7000, "baseIncome": 3000, "level": 1, "multiplier": 1.5, "required_level": 1 },
            { "id": "coffee_shop", "name": "Кофейня", "image": "../assets/images/growth/21.png", "cost": 30000, "baseIncome": 8000, "level": 1, "multiplier": 1.5, "required_level": 1 },
            { "id": "grocery_store", "name": "Продуктовый магазин", "image": "../assets/images/growth/22.png", "cost": 130000, "baseIncome": 25000, "level": 1, "multiplier": 1.5, "required_level": 2 },
            { "id": "restaurant", "name": "Ресторан", "image": "../assets/images/growth/23.png", "cost": 300000, "baseIncome": 50000, "level": 1, "multiplier": 1.5, "required_level": 2 },
            { "id": "car_dealership", "name": "Автосалон", "image": "../assets/images/growth/24.png", "cost": 500000, "baseIncome": 90000, "level": 1, "multiplier": 1.5, "required_level": 3 }
        ]
    },
    "realestate": {
        "title": "Недвижимость",
        "type": "inverse_parabolic",
        "items": [
            { "id": "garage", "name": "Гараж", "image": "../assets/images/growth/29.png", "cost": 12000, "baseIncome": 8000, "level": 1, "multiplier": 1.3, "required_level": 1 },
            { "id": "parking", "name": "Парковка", "image": "../assets/images/growth/30.png", "cost": 50000, "baseIncome": 15000, "level": 1, "multiplier": 1.3, "required_level": 1 },
            { "id": "apartment", "name": "Квартира", "image": "../assets/images/growth/31.png", "cost": 70000, "baseIncome": 30000, "level": 1, "multiplier": 1.3, "required_level": 2 },
            { "id": "house", "name": "Дом", "image": "../assets/images/growth/32.png", "cost": 250000, "baseIncome": 60000, "level": 1, "multiplier": 1.3, "required_level": 2 },
            { "id": "dubai_house", "name": "Дом в Дубае", "image": "../assets/images/growth/33.png", "cost": 700000, "baseIncome": 150000, "level": 1, "multiplier": 1.3, "required_level": 3 }
        ]
    }
}