from redis import Redis

from json import dumps,loads

from random import randint

r = Redis(decode_responses=True)

def check_for_match(category,time) -> str:

    key = f'{category} {time}'

    search = r.smembers(key)

    return set(loads(s) for s in search)

def add_match_value(id,teams,category,time):

    key = f'{category} {time}'

    item = {
        "id": id,
        "teams": teams
    }

    r.sadd(key, dumps(item))