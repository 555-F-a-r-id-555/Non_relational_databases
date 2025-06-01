## Нереляционные базы данных и MongoDB
### Введение в MongoDB
* Подготовка:
    * Установка докер образа:
        * 1) docker run --name skillbox-mongodb -d mongo:4.4 
        * 2) docker exec -it skillbox-mongodb mongo
1. Задача:

```txt
Цель практической работы:
Научиться выполнять простые запросы в MongoDB.
Что нужно сделать:
Из коллекции постов(posts) выберите документы, в которых среди топиков(topics) встречается as, идентификатор автора(author) содержит example.ru, а score больше 100.
```
        

1. Ответ:
```javascript

db.posts.find({
  topics: "as",
  author: /example\.ru/,
  score: { $gt: 100 }
})

 ```

2. Задача:
```txt
Цель практической работы:
Научиться писать запросы с использованием различных структур данных в MongoDB.

Что нужно сделать:
Одним запросом добавьте два документа к коллекции posts:
creation_date — текущее время, автор — skbx@example.com, topics должен быть списком из одного элемента mongodb;
creation_date — 31 декабря 2021 года, автор — skbx@example.ru.

```
2. Ответ:

```javascript

> db.posts.insertMany([
...   {
...     creation_date: new Date(),
...     author: 'skbx@example.com',
...     topics: ['mongodb']
...   },
...   {
...     creation_date: ISODate('2021-12-31T00:00:00Z'), // Использование ISODate для явного указания формата даты
...     author: 'skbx@example.ru',
...     topics: [] // Добавление поля topics, оно обязательно в схеме
...   }
... ]);
{
        "acknowledged" : true,
        "insertedIds" : [
                ObjectId("683bdbf78bf3adfae8504b2b"),
                ObjectId("683bdbf78bf3adfae8504b2c")
        ]
}
> // Проверяем
> db.posts.find(   { author: { $in: ['skbx@example.com', 'skbx@example.ru'] } },   { _id: 0, author: 1, creation_date: 1, topics: 1 } );
{ "creation_date" : ISODate("2025-06-01T04:49:59.500Z"), "author" : "skbx@example.com", "topics" : [ "mongodb" ] }
{ "creation_date" : ISODate("2021-12-31T00:00:00Z"), "author" : "skbx@example.ru", "topics" : [ ] }

```


3. Задача: 
```txt
Цель практической работы:
Научиться анализировать запросы и создавать индексы в MongoDB.

Что нужно сделать:
Создайте композитный индекс для коллекции users, в него войдут поля first_name и last_name. Приведите запросы: на создание индекса и на проверку, что индекс используется.
```
3. Ответ:
```javascript
> // Создание композитного индекса
> db.users.createIndex({ first_name: 1, last_name: 1 });
{
        "createdCollectionAutomatically" : false,
        "numIndexesBefore" : 1,
        "numIndexesAfter" : 2,
        "ok" : 1
}
> // Либо так, если нужно, чтобы индекс был уникальным
> db.users.createIndex({ "first_name": 1, "last_name": 1}, {unique: true});
{
        "ok" : 0,
        "errmsg" : "Index with name: first_name_1_last_name_1 already exists with different options",
        "code" : 85,
        "codeName" : "IndexOptionsConflict"
}
> db.users.find().limit(2);
{ "_id" : "byuko@example.com", "first_name" : "Babita", "last_name" : "Yuko", "registration_date" : ISODate("2020-01-15T00:00:00Z"), "birth_date" : ISODate("1956-10-25T00:00:00Z"), "visits" : 826, "top_tags" : { "sleepy" : 5, "there" : 8, "stupid" : 8 }, "karma" : 126 }
{ "_id" : "mmickey@example.info", "first_name" : "Mamie", "last_name" : "Mickey", "registration_date" : ISODate("2020-01-12T00:00:00Z"), "birth_date" : ISODate("1960-07-11T00:00:00Z"), "visits" : 805, "top_tags" : { "a" : 5, "book" : 5, "trouble" : 8 }, "karma" : 80 }
> // Проверка, использования индекса
> const explainResult = db.users.find({ first_name: "Mamie", last_name: "Mickey" }).explain("executionStats");
> // Вывод результата
> printjson(explainResult);
{
        "queryPlanner" : {
                "plannerVersion" : 1,
                "namespace" : "skdb.users",
                "indexFilterSet" : false,
                "parsedQuery" : {
                        "$and" : [
                                {
                                        "first_name" : {
                                                "$eq" : "Mamie"
                                        }
                                },
                                {
                                        "last_name" : {
                                                "$eq" : "Mickey"
                                        }
                                }
                        ]
                },
                "winningPlan" : {
                        "stage" : "FETCH",
                        "inputStage" : {
                                "stage" : "IXSCAN",
                                "keyPattern" : {
                                        "first_name" : 1,
                                        "last_name" : 1
                                },
                                "indexName" : "first_name_1_last_name_1",
                                "isMultiKey" : false,
                                "multiKeyPaths" : {
                                        "first_name" : [ ],
                                        "last_name" : [ ]
                                },
                                "isUnique" : false,
                                "isSparse" : false,
                                "isPartial" : false,
                                "indexVersion" : 2,
                                "direction" : "forward",
                                "indexBounds" : {
                                        "first_name" : [
                                                "[\"Mamie\", \"Mamie\"]"
                                        ],
                                        "last_name" : [
                                                "[\"Mickey\", \"Mickey\"]"
                                        ]
                                }
                        }
                },
                "rejectedPlans" : [ ]
        },
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 1,
                "executionTimeMillis" : 0,
                "totalKeysExamined" : 1,
                "totalDocsExamined" : 1,
                "executionStages" : {
                        "stage" : "FETCH",
                        "nReturned" : 1,
                        "executionTimeMillisEstimate" : 0,
                        "works" : 2,
                        "advanced" : 1,
                        "needTime" : 0,
                        "needYield" : 0,
                        "saveState" : 0,
                        "restoreState" : 0,
                        "isEOF" : 1,
                        "docsExamined" : 1,
                        "alreadyHasObj" : 0,
                        "inputStage" : {
                                "stage" : "IXSCAN",
                                "nReturned" : 1,
                                "executionTimeMillisEstimate" : 0,
                                "works" : 2,
                                "advanced" : 1,
                                "needTime" : 0,
                                "needYield" : 0,
                                "saveState" : 0,
                                "restoreState" : 0,
                                "isEOF" : 1,
                                "keyPattern" : {
                                        "first_name" : 1,
                                        "last_name" : 1
                                },
                                "indexName" : "first_name_1_last_name_1",
                                "isMultiKey" : false,
                                "multiKeyPaths" : {
                                        "first_name" : [ ],
                                        "last_name" : [ ]
                                },
                                "isUnique" : false,
                                "isSparse" : false,
                                "isPartial" : false,
                                "indexVersion" : 2,
                                "direction" : "forward",
                                "indexBounds" : {
                                        "first_name" : [
                                                "[\"Mamie\", \"Mamie\"]"
                                        ],
                                        "last_name" : [
                                                "[\"Mickey\", \"Mickey\"]"
                                        ]
                                },
                                "keysExamined" : 1,
                                "seeks" : 1,
                                "dupsTested" : 0,
                                "dupsDropped" : 0
                        }
                }
        },
        "serverInfo" : {
                "host" : "98d685cc84ff",
                "port" : 27017,
                "version" : "4.4.29",
                "gitVersion" : "f4dda329a99811c707eb06d05ad023599f9be263"
        },
        "ok" : 1
}
> // Либо вот так
> print("Используемый индекс:", explainResult.executionStats.executionStages.inputStage.indexName);
Используемый индекс: first_name_1_last_name_1

```

4. Задача:
```txt
Цель практической работы:
Научиться писать аналитические запросы в MongoDB.

Что нужно сделать:
Для коллекции users.
Посчитайте сумму кармы(karma) по первым буквам имён пользователей(first_name) для тех пользователей(users), у которых больше 300 визитов(visits).
Советы и указания
Для выбора первой буквы имени используйте ключевое слово substr.- для старых версий MongoDB и для новых substrCP

``` 
4. Ответ:
```javascript
> db
skdb
> db.users.aggregate([
...   {
...     $match: { visits: { $gt: 300 } } // Фильтрация по количеству визитов
...   },
...   {
...     $project: {
...       first_letter: { $substrCP: ["$first_name", 0, 1] }, // Получение первой буквы имени
...       karma: 1
...     }
...   },
...   {
...     $group: {
...       _id: "$first_letter", // Группировка по первой букве
...       total_karma: { $sum: "$karma" } // Сумма кармы по каждой группе
...     }
...   }
... ]);
{ "_id" : "V", "total_karma" : -43 }
{ "_id" : "L", "total_karma" : 243 }
{ "_id" : "M", "total_karma" : 516 }
{ "_id" : "R", "total_karma" : 53 }
{ "_id" : "J", "total_karma" : 478 }
{ "_id" : "Z", "total_karma" : -82 }
{ "_id" : "G", "total_karma" : 199 }
{ "_id" : "H", "total_karma" : 79 }
{ "_id" : "D", "total_karma" : -39 }
{ "_id" : "A", "total_karma" : -28 }
{ "_id" : "O", "total_karma" : 71 }
{ "_id" : "P", "total_karma" : 94 }
{ "_id" : "K", "total_karma" : 153 }
{ "_id" : "C", "total_karma" : 176 }
{ "_id" : "S", "total_karma" : 296 }
{ "_id" : "E", "total_karma" : 120 }
{ "_id" : "B", "total_karma" : 323 }
{ "_id" : "T", "total_karma" : -68 }
```


5. Задача:
```txt
Цель практической работы:
Научиться писать хранимые процедуры в MongoDB.

Что нужно сделать:
Создайте хранимую функцию shuffle, которая принимает один параметр — строку и возвращает строку со случайно переставленными символами.


Советы и указания:
Используйте встроенный в JavaScript метод Math.random() для сортировки символов в строке.
```

5. Ответ:
    * v_1
    * Cамый простой варинт использовать JS .
```javascript
function shuffle2(str) {
  let arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

shuffle2("mongodb"); // => случайная перестановка
```    
```javascript
> function shuffle2(str) {   let arr = str.split('');   for (let i = arr.length - 1; i > 0; i--) {     const j = Math.floor(Math.random() * (i + 1));     [arr[i], arr[j]] = [arr[j], arr[i]];   }   return arr.join(''); };
> shuffle2("mongodb");
bnodmog
>
```

   * v_2
```javascript
> db.system.js.updateOne(
...   { _id: "shuffle" },
...   {
...     $set: {
...       value: function(str) {
...         let arr = str.split('');
...         for (let i = arr.length - 1; i > 0; i--) {
...           const j = Math.floor(Math.random() * (i + 1));
...           const temp = arr[i];
...           arr[i] = arr[j];
...           arr[j] = temp;
...         }
...         return arr.join('');
...       }
...     }
...   },
...   { upsert: true }
... );
{
        "acknowledged" : true,
        "matchedCount" : 0,
        "modifiedCount" : 0,
        "upsertedId" : "shuffle"
}
> //Проверка:
> db.system.js.find({ _id: "shuffle" }).pretty();
{
        "_id" : "shuffle",
        "value" : {
                "code" : "function(str) {\n        let arr = str.split('');\n        for (let i = arr.length - 1; i > 0; i--) {\n          const j = Math.floor(Math.random() * (i + 1));\n          const temp = arr[i];\n          arr[i] = arr[j];\n          arr[j] = temp;\n        }\n        return arr.join('');\n      }"
        }
}
> const shuffleCode = db.system.js.findOne({ _id: "shuffle" }).value;
> const shuffle = eval('(' + shuffleCode.code + ')');
> print(shuffle("mongodb"));
oogmndb
> print(shuffle("Hello_MongoDB"));
nHlM_ooDoglBe
>

```

###  Введение Redis

* Подготовка:
    * Установка докер образа:
        * 1) docker run -d --name redis -p 6379:6379 redis:8.0
        * 2) docker exec -it redis redis-cli - подключение
        * 3) redis-cli -h 127.0.0.1 -p 6379 - локально


Redis — это высокопроизводительная база данных, работающая в памяти, которая используется для кэширования, хранения сессий, очередей сообщений и других задач, требующих быстрого доступа к данным.

1. Задача:
```txt
Цель практической работы:
Научиться выполнять простые запросы в Redis.

Что нужно сделать
Напишите последовательность команд для Redis:
1.Создайте ключ index со значением “index precalculated content”.
2.Проверьте, есть ли ключ index в БД.
3.Узнайте, сколько ещё времени будет существовать ключ index.
4.Отмените запланированное удаление ключа index.

Что оценивается
Верная последовательность команд.
```
1. Ответ:

```bash
127.0.0.1:6379> set index "index precalculated content" ex 220
OK
127.0.0.1:6379> get index
"index precalculated content"
127.0.0.1:6379> ttl index
(integer) 201
127.0.0.1:6379> persist index
(integer) 1
127.0.0.1:6379> ttl index
(integer) -1
127.0.0.1:6379> keys *
1) "visitors:main"
2) "hello"
3) "index"

```

2. Задача:
```txt
Цель практической работы:
Научиться работать со структурами данных в Redis.

Что нужно сделать
Напишите последовательность команд для Redis:
Создайте в Redis структуру данных с ключом ratings для хранения следующих значений рейтингов технологий: mysql — 10, postgresql — 20, mongodb — 30, redis — 40.
По этому же ключу увеличьте значение рейтинга mysql на 15.
Удалите из структуры элемент с максимальным значением.
Выведите место в рейтинге для mysql.

Что оценивается
Верная последовательность команд.
```
2. Ответ:
```bash
PS D:\MongoDB\Non_relational_databases\Redis> docker exec -it redis redis-cli
127.0.0.1:6379> ZADD ratings 10 mysql 20 postgresql 30 mongodb 40 redis
(integer) 4
127.0.0.1:6379> ZINCRBY ratings 15 mysql
"25"
127.0.0.1:6379> ZREVRANGE ratings 0 -1 WITHSCORES
1) "redis"
2) "40"
3) "mongodb"
4) "30"
5) "mysql"
6) "25"
7) "postgresql"
8) "20"
127.0.0.1:6379> ZPOPMAX ratings
1) "redis"
2) "40"
127.0.0.1:6379> ZREVRANK ratings mysql
(integer) 1
127.0.0.1:6379> ZSCORE ratings mysql
"25"
127.0.0.1:6379> ZREVRANGE ratings 0 -1 WITHSCORES
1) "mongodb"
2) "30"
3) "mysql"
4) "25"
5) "postgresql"
6) "20"
127.0.0.1:6379> ZREVRANK ratings mysql WITHSCORE
1) (integer) 1
2) "25"


```

3. Задача:
```plaintext
Цель практической работы:
Научиться работать с механизмом Pub/Sub в Redis.

Что нужно сделать
Напишите две команды для СУБД Redis:
1) Подпишитесь на все события, опубликованные на каналах, начинающихся с events.
2) Опубликуйте сообщение на канале events101 с текстом “Hello there”.

Что оценивается
Верная последовательность команд.

```
3. Ответ:

```sh
127.0.0.1:6379> PSUBSCRIBE events*
1) "psubscribe"
2) "events*"
3) (integer) 1
1) "pmessage"
2) "events*"
3) "events101"
4) "Hello there"
127.0.0.1:6379> PUBLISH events101 "Hello there"
(integer) 1
```

4. Задача:
```txt
Цель практической работы:
Научиться работать с хранимыми функциями в Redis.

Что нужно сделать
Сохраните в Redis функцию, которая принимает ключ и значение и сохраняет под указанным ключом квадратный корень от значения.

Что оценивается
Верный запрос.
```
4. Ответ:
* v_1
```sh
127.0.0.1:6379> script load "redis.call('set', KEYS[1], math.sqrt(tonumber(ARGV[1])))"
"799f63c53d34aaf6d427666319aa7084196921ae"
127.0.0.1:6379> evalsha 799f63c53d34aaf6d427666319aa7084196921ae 1 result 49
(nil)
127.0.0.1:6379> get result
"7.0"

```
* v_1_2
```sh
127.0.0.1:6379> script load "for i=1, #KEYS do redis.call('set', KEYS[i], math.sqrt(tonumber(ARGV[i]))) end"
"f1483ed0a2a6fb54bc2735147e2e7e1af7f06f64"
127.0.0.1:6379> evalsha f1483ed0a2a6fb54bc2735147e2e7e1af7f06f64 2 result1 result2 25 81
(nil)
127.0.0.1:6379> get result1
"5"
127.0.0.1:6379> get result2
"9"
```
* v_2

* Этот скрипт выдаст ошибку, поэтому пришлось внести изменения и итоговый скрипт приведен ниже => v_3
```bash
FUNCTION CREATE mathLib LUA '
redis.register_function("save_sqrt", function(keys, args)
    local key = keys[1]
    local value = tonumber(args[1])
    local sqrt_result = math.sqrt(value)
    redis.call("set", key, sqrt_result)
end)
'
FCALL save_sqrt 1 result 49

GET result

FUNCTION DELETE mathLib
```
* v_3 => для Redis 7+ и 8+ требует "метаданные библиотеки" при использовании FUNCTION LOAD
* Результат выполнения скрипта
```sh
127.0.0.1:6379> FUNCTION LOAD "#!lua name=mathLib\nredis.register_function('save_sqrt', function(keys, args) local key = keys[1] local value = tonumber(args[1]) local sqrt_result = math.sqrt(value) redis.call('set', key, sqrt_result) end)"
"mathLib"
127.0.0.1:6379> FCALL save_sqrt 1 mykey 144
(nil)
127.0.0.1:6379> GET mykey
"12"
127.0.0.1:6379> FUNCTION DELETE mathLib
OK
```