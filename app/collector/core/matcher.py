from core.config import MatcherConfig
from rapidfuzz.fuzz import ratio
from models.match import Match

MATCH_DATA_KEYS = ('teams','category','time')

class Matcher:

    def __init__(self,config:MatcherConfig | None = None) -> None:

        self.config:MatcherConfig = config or MatcherConfig()

    def match_text(self,text1:str,text2:str,treashold:int) -> bool:

        text1 = self.config.normalizer.normalize(text1)
        text2 = self.config.normalizer.normalize(text2)

        return ratio(text1,text2) > treashold

    def match_connector(self,match:Match) -> dict:

        return {
            "teams":[self.config.normalizer.normalize(team) \
                     for team in match.teams],
            "category": self.config.normalizer.normalize(match.category),
            "time": match.start
        }

    def matches_matcher(self,
                      match1:dict | Match,
                      match2:dict | Match
                      ) -> bool:

        matches = (match1,match2)

        for match in matches:

            if isinstance(match,Match):
                match = self.match_connector(match)

            if match.keys() != MATCH_DATA_KEYS:
                return False

        teams_match = all(
            self.match_text(
            matches[0].teams[i],
            matches[1].teams[i],
            self.config.names_match_treashold)\
            for i in range(2)
        )

        category_match = self.match_text(
            matches[0].category,
            matches[1].category,
            self.config.category_match_treashold
        )
        
        time_match = abs(
            matches[0].time - matches[1].time
        ) <= self.config.allowed_time_slippage*60

        return teams_match and\
               category_match and\
               time_match