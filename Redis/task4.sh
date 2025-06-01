#!/bin/bash

# Очищаем Redis
redis-cli DEL result1 result2
# Загружаем Lua-скрипт, который сохраняет корень квадратный из чисел в ключи
SHA=$(redis-cli SCRIPT LOAD "for i=1, #KEYS do redis.call('set', KEYS[i], math.sqrt(tonumber(ARGV[i]))) end")

# Выполняем скрипт по SHA с двумя ключами и значениями 25 и 81
redis-cli EVALSHA "$SHA" 2 result1 result2 25 81

# Проверяем результат
echo "result1 = $(redis-cli GET result1)"
echo "result2 = $(redis-cli GET result2)"



# chmod +x task4.sh