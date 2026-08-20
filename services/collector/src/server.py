from fastapi import FastAPI

from models.include import IncludeInput
from models.match import Match, MatchInput

from db import redis_handler

from core.config import matcher, normalizer

app = FastAPI()

@app.put("/include")
def include_match(data: IncludeInput):

    r = redis_handler.check_for_match(
        data.category,
        data.start
    )

    if r != set():

        pass

    else:

        m = Match(MatchInput(
            data.teams,
            data.category,
            data.start,
            data.odds,
            data.link
        ))

        redis_handler.add_match_value(
            m.id,
            m.teams,
            m.category,
            m.time
        )

    return {"status":"correct!","item_id":m.id}