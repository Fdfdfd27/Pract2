const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Настройки парсинга
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Раздаем файлы из текущей папки
app.use(express.static(__dirname));

// ПОДКЛЮЧЕНИЕ К БД 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'brand_shop11'
});

// Проверка подключения к БД
db.connect(err => {
    if (err) {
        console.log('\x1b[31m%s\x1b[0m', '❌ ОШИБКА ПОДКЛЮЧЕНИЯ К БД:');
        console.error(err);
        console.log('1. Убедитесь что MySQL запущен');
        return;
    }
    console.log('\x1b[32m%s\x1b[0m', '✅ Подключено к MySQL');
});

// ===== API ДЛЯ ИЗБРАННОГО =====

// Получить все избранные товары
app.get('/api/favorites', (req, res) => {
    db.query('SELECT * FROM favorites ORDER BY added_at DESC', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        res.json(results);
    });
});

// Добавить товар в избранное
app.post('/api/favorites/add', (req, res) => {
    const { name, price, image } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Название товара обязательно' });
    }
    
    db.query(
        'INSERT INTO favorites (product_name, product_price, product_image) VALUES (?, ?, ?)',
        [name, price || 0, image || ''],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Ошибка сохранения' });
            }
            
            db.query('SELECT * FROM favorites ORDER BY added_at DESC', (err, favorites) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка получения списка' });
                }
                res.json({ 
                    success: true, 
                    message: 'Товар добавлен в избранное',
                    favorites: favorites
                });
            });
        }
    );
});

// Удалить товар из избранного
app.delete('/api/favorites/remove/:id', (req, res) => {
    db.query('DELETE FROM favorites WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка удаления' });
        }
        
        db.query('SELECT * FROM favorites ORDER BY added_at DESC', (err, favorites) => {
            res.json({ 
                success: true, 
                message: 'Товар удален из избранного',
                favorites: favorites 
            });
        });
    });
});

// Очистить все избранное
app.delete('/api/favorites/clear', (req, res) => {
    db.query('DELETE FROM favorites', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка очистки' });
        }
        res.json({ success: true, message: 'Избранное очищено', favorites: [] });
    });
});


// ЗАПУСК СЕРВЕРА 
const PORT = 3000;
app.listen(PORT, () => {
    console.log('\n\x1b[32m%s\x1b[0m', `🚀 СЕРВЕР ЗАПУЩЕН НА ПОРТУ ${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `📋 Главная: http://localhost:${PORT}/index.html`);
    console.log('\x1b[36m%s\x1b[0m', `❤️ Избранное: http://localhost:${PORT}/favorites.html`);
    console.log('\x1b[33m%s\x1b[0m', '🔄 Для остановки нажмите Ctrl+C\n');
});