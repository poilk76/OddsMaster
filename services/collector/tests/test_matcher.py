import pytest

from services.collector.src.core.matcher import Matcher
from dataclasses import dataclass

from datetime import datetime, timedelta

@dataclass
class FakeMatch:
    teams:list[str,str]
    category:str
    start:float

time = datetime.now()

class TestMatcher:

    matcher = Matcher()

    @pytest.mark.parametrize(
        "m1,m2,expected",
        [
            (FakeMatch(
                ["test1","test2"],
                "football",
                time.timestamp()
            ),FakeMatch(
                ["test1","test2"],
                "football",
                (time+timedelta(minutes=30)).timestamp()
            ),True),
            # TODO 
        ]
    )
    def test_matches_matcher(self,m1,m2,expected):

        m1 = self.matcher.match_connector(m1)
        m2 = self.matcher.match_connector(m2)

        assert self.matcher.matches_matcher(m1,m2) == expected