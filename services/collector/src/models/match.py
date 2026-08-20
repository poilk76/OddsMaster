from dataclasses import dataclass

from uuid import uuid8

from services.collector.src.core.ev import calculate_ev, calculate_kelly_criterion
from services.collector.src.core.arbitrage import calculate_arbitrage, calculate_stakes

from services.collector.src.core.matcher import Matcher, MatcherConfig

from services.collector.src.models.include import IncludeInput


@dataclass
class MatchInput:
    teams:list[str,str] | None = None
    category:str | None = None
    start:float | None  = None
    odds:dict[str:list[float]] | None = None
    links:dict[str:str] | None = None

class Match:

    def __calculate_ev_and_arb(self) -> None:

        self.ev = {
            "values": calculate_ev(self.odds,12),
            "kelly": calculate_kelly_criterion(self.odds,12)
        }
        self.arb = {
            "values": calculate_arbitrage(self.odds,12),
            "stakes": calculate_stakes(self.odds)
        }

    def __input_to_self(self) -> None:

        self.id = uuid8()
        self.teams = self.input.teams
        self.category = self.input.category
        self.start = self.input.start
        self.odds = self.input.odds
        self.links = self.input.links
        self.__calculate_ev_and_arb()

        self.matcher_data = self.matcher.match_connector(self)

        del self.input

    def __int__(self,input: MatchInput | None = None, matcher:Matcher | None = None) -> None:

        if input == None:
            self.input = MatchInput()
        else:
            self.input = input

        if matcher == None:
            self.matcher = Matcher()
        else:
            self.matcher = matcher

        self.__input_to_self()

    def set_matcher_config(self,config:MatcherConfig) -> bool:

        if not isinstance(config,MatcherConfig):
            return False

        self.matcher.config = config

        return True

    def add(self,input:IncludeInput) -> bool:

        if not isinstance(input,IncludeInput):
            return False

        match_effect = self.matcher.matches_matcher(
            self.matcher_data,
            {
                "teams":input.teams,
                "category":input.category,
                "time":input.start
            }
        )

        if not match_effect: return False

        sources = self.odds.keys()

        if input.source in sources:

            if self.odds[input.source] != input.odds:

                self.odds[input.source] = input.odds

                # TODO history save
        
        else:

            self.odds[input.source] = input.odds
            self.links[input.source] = input.link

        self.__calculate_ev_and_arb()

        return True
