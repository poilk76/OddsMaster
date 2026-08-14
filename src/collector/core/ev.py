from collector.core.arbitrage import extract_best_odds
from collector.models.match import Match

def calculate_avg_procantage(
        match:Match
    ) -> tuple[float] | None:

    if not isinstance(match,Match): return None
    
    all_odds = match.odds.values()
     
    return tuple(0 if sum(x) == 0 else len(x) / sum(x) for x in zip(*all_odds))

def calculate_ev(match:Match,tax:int,rounding:int=4) -> tuple[float]:

    if not isinstance(match.odds, dict): return ()
    if not isinstance(tax,int): return ()

    best = extract_best_odds(match)
    procantage = calculate_avg_procantage(match)

    if best == None: return -tax
    if procantage == None: return -tax

    return tuple(round(procantage[i]*(1+(best[i]-1)*(1-tax))-1,rounding) for i in range(len(best)))

def calculate_kelly_criterion(match:Match,tax:int,rounding:int=4) -> tuple[float]:

    if not isinstance(match.odds, dict): return ()
    if not isinstance(tax,int): return ()

    best = extract_best_odds(match)
    procantage = calculate_avg_procantage(match)
    
    if best == None: return -tax
    if procantage == None: return -tax

    return tuple(round((procantage[i]/best[i])-(1-procantage[i]),rounding)
            for i in range(len(best)))