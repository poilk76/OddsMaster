def extract_best_odds(odds:dict) -> tuple[float] | None:

    if not isinstance(odds,dict): return None

    all_odds = odds.values()

    rotate = [list(x) for x in zip(*all_odds)]
    
    return tuple(max(odds) for odds in rotate)

def calculate_arbitrage(
        odds:tuple[float],
        tax:int=12
    ) -> float | None:

    if isinstance(odds,dict):
        odds = extract_best_odds(odds)

    if not isinstance(odds,tuple): return None
    if not isinstance(tax,int): return None
    if len(odds) == 0: return None
    if not all(isinstance(odd,float) for odd in odds):
        return None

    tax = (100+tax)/100

    return sum(map(lambda odd:1/odd,odds))

def calculate_arb_procentage(
        odds:dict,
        tax:int=12
    ) -> float | None:

    arb = calculate_arbitrage(odds,tax)

    if arb == None: return -10.

    return (1/(arb*tax)-1)*100

def calculate_stakes(
        odds:dict,
    ) -> tuple[float]:

    arb =  calculate_arbitrage(odds,0)

    if arb == None: return ()

    return tuple(round((100*(1/odd))/arb,2) for odd in odds)