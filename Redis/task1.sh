#!/bin/bash

redis-cli SET index "index precalculated content" EX 220
redis-cli GET index
redis-cli TTL index
redis-cli PERSIST index
redis-cli TTL index
redis-cli KEYS '*'

# chmod +x task1.sh
