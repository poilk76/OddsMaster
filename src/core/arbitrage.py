from typing import Tuple

def calculate_arbitrage(odds:Tuple[float],tax:int=0):

    if not isinstance(odds,tuple): return 1.0
    if not isinstance(tax,int): return 1.0
    if len(odds) == 0: return 1.0

    tax = (100+tax)/100
    arbitrage = 0

    for odd in odds:
        arbitrage += 1/odd

    return arbitrage*tax

def calculate_stakes(odds:Tuple[float],whole_stake:float=100.0):

    if not isinstance(odds,tuple): return ()
    if not isinstance(whole_stake,float): return ()

    arb = calculate_arbitrage(odds)

    return tuple(round((whole_stake*(1/odd))/arb,1) for odd in odds)
