#!/bin/bash

redis-cli ZADD ratings 10 mysql 20 postgresql 30 mongodb 40 redis
redis-cli ZINCRBY ratings 15 mysql
redis-cli ZREVRANGE ratings 0 -1 WITHSCORES
redis-cli ZPOPMAX ratings
redis-cli ZREVRANK ratings mysql
redis-cli ZSCORE ratings mysql
redis-cli ZREVRANGE ratings 0 -1 WITHSCORES
redis-cli #################################
redis-cli ZREVRANK ratings mysql
redis-cli ZSCORE ratings mysql


# chmod +x task2.sh